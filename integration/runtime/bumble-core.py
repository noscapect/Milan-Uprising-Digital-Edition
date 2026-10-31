"""Optional Core transport. Uses the project codec and generated identities only."""
import asyncio
import json
import pathlib
import sys
import secrets
import contextlib
import importlib.util

from bumble.core import AdvertisingData, UUID
from bumble.device import Device, Peer
from bumble.gatt import Characteristic, CharacteristicValue, Service
from bumble.hci import Address

ROOT = pathlib.Path(__file__).resolve().parent
CODEC = ROOT / 'windows-core/ring-telemetry-build/CoreContract.exe'
_led_spec = importlib.util.spec_from_file_location('led_presentation', ROOT / 'led-presentation.py')
_led_module = importlib.util.module_from_spec(_led_spec)
_led_spec.loader.exec_module(_led_module)


class Codec:
    async def start(self):
        self.lock = asyncio.Lock()
        self.pending = set()
        self.process = await asyncio.create_subprocess_exec(
            str(CODEC), '--codec-json-lines', stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        self.state = await self.call('status')

    async def call(self, action, **kwargs):
        # Keep the request/reply pair serialized even if its HTTP caller leaves.
        task = asyncio.create_task(self.exchange(action, **kwargs))
        self.pending.add(task)
        task.add_done_callback(self.finished)
        return await asyncio.shield(task)

    def finished(self, task):
        self.pending.discard(task)
        if not task.cancelled():
            task.exception()

    async def exchange(self, action, **kwargs):
        async with self.lock:
            self.process.stdin.write((json.dumps(dict(action=action, **kwargs))+'\n').encode())
            await self.process.stdin.drain()
            line = await self.process.stdout.readline()
            if not line:
                raise RuntimeError('Codec gestopt')
            result = json.loads(line)
            if 'error' in result:
                raise ValueError(result['error'])
            self.state = result
            return result

    async def close(self):
        self.process.stdin.close()
        await asyncio.wait_for(self.process.wait(), 5)


class Core:
    def __init__(self, device, codec):
        self.device, self.codec = device, codec
        self.commands = 0
        self.notifications = 0
        self.connections = set()
        self.gate = asyncio.Lock()
        self.log = []
        self.rolling = False
        self.led_state = dict(observed=False, colors=[[0,0,0] for _ in range(4)])
        self.last_roll = None
        self.roll_sequence = 0
        self.command = Characteristic(
            codec.state['command'],
            Characteristic.Properties.READ | Characteristic.Properties.WRITE |
            Characteristic.Properties.WRITE_WITHOUT_RESPONSE | Characteristic.Properties.NOTIFY,
            Characteristic.READABLE | Characteristic.WRITEABLE,
            CharacteristicValue(read=lambda _: b'', write=self.write))
        self.data = Characteristic(
            codec.state['data'], Characteristic.Properties.READ | Characteristic.Properties.NOTIFY,
            Characteristic.READABLE, b'')
        device.add_service(Service(codec.state['service'], [self.command, self.data]))
        device.on('connection', self.connected)

    def connected(self, connection):
        self.connections.add(connection)
        connection.on('disconnection', lambda _: asyncio.create_task(self.disconnected(connection)))

    async def disconnected(self, connection):
        async with self.gate:
            self.connections.discard(connection)
            self.led_state = dict(observed=False, colors=[[0,0,0] for _ in range(4)])
            await self.codec.call('reset')

    async def send(self, result):
        for reply in result['replies']:
            characteristic = self.data if reply['data'] else self.command
            value = bytes.fromhex(reply['hex'])
            limit = min((c.att_mtu - 3 for c in self.connections), default=20)
            if limit <= 0:
                raise ValueError('Ongeldige notificatielimiet')
            for offset in range(0, len(value), limit):
                await self.device.notify_subscribers(characteristic, value[offset:offset+limit])
                self.notifications += 1

    async def write(self, connection, value):
        async with self.gate:
            if len(self.connections) != 1 or connection not in self.connections:
                raise ValueError('Precies één appverbinding vereist')
            if not 2 <= len(value) <= 512:
                raise ValueError('Ongeldige opdrachtlengte')
            result = await self.codec.call('accept', hex=value.hex())
            if result['replies'] and bytes.fromhex(result['replies'][0]['hex'])[0] == 255:
                self.led_state = _led_module.apply_led_command(self.led_state, value, bytes.fromhex(self.codec.state['ringIdentity']))
            self.commands += 1
            await self.send(result)

    async def roll_die(self, dice=None):
        # Only our own synthetic die; callers cannot select a successful result.
        async with self.gate:
            if self.rolling:
                raise ValueError('Er loopt al een worp')
            if len(self.connections) != 1:
                raise ValueError('Geen actieve appverbinding')
            connection = next(iter(self.connections))
            selection = [1] if dice is None else dice
            if not isinstance(selection, list) or not selection or len(selection) > 5 or any(type(i) is not int or not 1 <= i <= 5 for i in selection) or len(set(selection)) != len(selection):
                raise ValueError('Selecteer één tot vijf verschillende dobbelstenen (1–5)')
            result = await self.codec.call('die-start', dice=selection)
            self.roll_sequence += 1
            self.last_roll = dict(sequence=self.roll_sequence, dice=selection[:], stage='started', appAcceptanceVerified=False)
            discovery = [reply for reply in result['replies'] if bytes.fromhex(reply['hex'])[2] == 0xa0]
            movement = [reply for reply in result['replies'] if reply not in discovery]
            self.rolling = True
            try:
                await self.send(dict(result, replies=discovery if discovery else movement))
            except BaseException:
                self.last_roll['stage'] = 'interrupted'
                self.rolling = False
                await self.codec.call('die-cancel')
                raise
        try:
            if discovery:
                # Let the app register newly discovered dice before its first rolling callback.
                await asyncio.sleep(0.25)
                async with self.gate:
                    if self.connections != {connection} or self.codec.state.get('diceRadioMode') != 1 or not self.codec.state.get('dieRolling'):
                        raise ValueError('Dice input changed during discovery')
                    await self.send(dict(result, replies=movement))
            await asyncio.sleep(0.6)
            async with self.gate:
                if self.connections != {connection}:
                    raise ValueError('Appverbinding gewijzigd tijdens worp')
                await self.send(await self.codec.call('die-settle'))
                self.last_roll['stage'] = 'sufficient-motion-sent'
            await asyncio.sleep(0.25)
            async with self.gate:
                if self.connections != {connection}:
                    raise ValueError('Appverbinding gewijzigd tijdens worp')
                await self.send(await self.codec.call('die-result'))
                self.last_roll['stage'] = 'result-sent'
                self.last_roll['results'] = [dict(index=d['index'],face=d['face']) for d in self.codec.state['dice'] if d['index'] in selection]
        except BaseException:
            self.last_roll['stage'] = 'interrupted'
            raise
        finally:
            async with self.gate:
                await self.codec.call('die-cancel')
                self.rolling = False

    async def wake_dice(self):
        async with self.gate:
            if self.rolling or len(self.connections) != 1:
                raise ValueError('A connected, idle Core is required')
            await self.send(await self.codec.call('die-wake'))

    async def advertise(self):
        advertising = AdvertisingData([
            (AdvertisingData.FLAGS, bytes([6])),
            (AdvertisingData.COMPLETE_LIST_OF_128_BIT_SERVICE_CLASS_UUIDS,
             bytes(UUID(self.codec.state['service']))),
            (AdvertisingData.COMPLETE_LOCAL_NAME, b'Teburu')])
        assert len(bytes(advertising)) <= 31
        await self.device.start_advertising(advertising_data=bytes(advertising),
                                            scan_response_data=b'', auto_restart=True)


async def serve(transport_spec):
    shutdown_requested = asyncio.Event()
    from aiohttp import web
    from bumble.transport import open_transport
    if not transport_spec.startswith('usb:') or transport_spec == 'usb:0':
        raise ValueError('Gebruik een specifiek geïdentificeerde USB-radio, niet usb:0')
    codec = Codec()
    await codec.start()
    stack = contextlib.AsyncExitStack()
    core = None
    running = False
    token = secrets.token_hex(32)
    state_dir = ROOT / 'windows-core/state'
    state_dir.mkdir(parents=True, exist_ok=True)
    (state_dir / 'control.json').write_text(json.dumps(dict(address='http://127.0.0.1:5181', token=token)))
    address_file = state_dir / 'bumble-radio-address.json'
    if not address_file.exists():
        random_address = bytearray(secrets.token_bytes(6))
        random_address[0] |= 0xC0
        address_file.write_text(json.dumps(':'.join(f'{b:02X}' for b in random_address)))

    async def stop():
        nonlocal running, core
        running = False
        try:
            if core:
                for connection in list(core.connections):
                    with contextlib.suppress(Exception):
                        await asyncio.wait_for(connection.disconnect(), 1)
                with contextlib.suppress(Exception):
                    await asyncio.wait_for(core.device.stop_advertising(), 1)
        finally:
            try:
                await asyncio.wait_for(stack.aclose(), 1)
            finally:
                core = None
                await codec.call('reset')

    def status():
        return dict(version='windows-0.1', transport='bumble-wsl-usb', running=running,
                    connected=bool(core and len(core.connections) == 1),
                    advertising='Started' if running else 'Stopped',
                    commands=core.commands if core else 0,
                    notifications=core.notifications if core else 0,
                    readerEnabled=codec.state['readerEnabled'], sensors=codec.state['sensors'],
                    dieRolling=bool(core and core.rolling), dice=codec.state.get('dice', []),
                    lastDiceRoll=core.last_roll if core else None,
                    diceChannelReady=codec.state.get('diceChannelReady', False), diceRadioMode=codec.state.get('diceRadioMode', 0),
                    firmware=codec.state.get('firmware'),
                    ledRing=core.led_state if core else dict(observed=False, colors=[[0,0,0] for _ in range(4)]),
                    capabilities=dict(contacts=True, characterScan=True, companionScan=True, scannableMiniatures=26,
                                      experimentalD10=True, diceCount=5, ledPresentation=True, simulatedLedRing=True,
                                      firmwareUpdate=False, simulatedFirmwareUpdate=True, tagWrite=False,
                                      androidDiceAcceptanceVerified=False),
                    log='Bumble Core: '+('actief' if running else 'gestopt'))

    @web.middleware
    async def access(request, handler):
        if request.host != '127.0.0.1:5181' or request.headers.get('Origin', 'http://127.0.0.1:5181') not in (
                'http://127.0.0.1:5181', 'http://127.0.0.1:5180'):
            return web.json_response(dict(error='Forbidden'), status=403)
        if not secrets.compare_digest(request.headers.get('X-Core-Token', ''), token):
            return web.json_response(dict(error='Forbidden'), status=403)
        try:
            response = await handler(request)
        except Exception as error:
            response = web.json_response(dict(error=str(error)), status=400)
        response.headers['Cache-Control'] = 'no-store'
        return response

    gate = asyncio.Lock()
    async def handle(request):
        nonlocal core, running
        async with gate:
            if request.path == '/status' and request.method == 'GET':
                return web.json_response(status())
            if request.path == '/readiness' and request.method == 'GET':
                return web.json_response(dict(bluetoothNameReady=True, bleAdvertisedNameVerified=False,
                                             advertisingStartedAutomatically=False))
            if request.method != 'POST':
                raise web.HTTPNotFound()
            if request.path == '/start':
                if not running:
                    try:
                        transport = await stack.enter_async_context(await open_transport(transport_spec))
                        device = Device.with_hci('Teburu', Address(json.loads(address_file.read_text())),
                                                 transport.source, transport.sink)
                        core = Core(device, codec)
                        await device.power_on()
                        await core.advertise()
                        running = True
                    except Exception:
                        await stop()
                        raise
            elif request.path == '/stop':
                await stop()
            elif request.path == '/shutdown':
                await stop()
                shutdown_requested.set()
            elif request.path == '/firmware/simulate-update':
                body = await request.json()
                if body != {'confirmSimulation': True}:
                    raise ValueError('Confirm the local firmware simulation.')
                async with (core.gate if core else contextlib.AsyncExitStack()):
                    if core and core.rolling:
                        raise ValueError('Wait for the current roll.')
                    await codec.call('firmware-begin')
                    try:
                        await asyncio.sleep(0.8)
                        await codec.call('firmware-complete')
                        if core and core.connections and codec.state.get('diceRadioMode') == 1:
                            await core.send(await codec.call('die-status'))
                    except BaseException:
                        await codec.call('firmware-abort')
                        raise
            elif request.path == '/dice/roll':
                if not core:
                    raise ValueError('Geen actieve Core')
                body = await request.json()
                await core.roll_die(body.get('dice'))
            elif request.path == '/dice/wake':
                if not core:
                    raise ValueError('No active Core')
                await core.wake_dice()
            elif request.path in ('/sensor', '/scan'):
                if not core or len(core.connections) != 1:
                    raise ValueError('Geen actieve appverbinding')
                body = await request.json()
                async with core.gate:
                    if request.path == '/sensor':
                        if type(body.get('index')) is not int or type(body.get('active')) is not bool:
                            raise ValueError('Ongeldige sensorinvoer')
                        result = await codec.call('sensor', index=body['index'], active=body['active'])
                    else:
                        if type(body.get('character')) is not int:
                            raise ValueError('Ongeldig personage')
                        result = await codec.call('scan', character=body['character'])
                    await core.send(result)
            else:
                raise web.HTTPNotFound()
            return web.json_response(status())

    async def keep_dice_present():
        while True:
            await asyncio.sleep(8)
            current = core
            if not running or current is None or len(current.connections) != 1 or current.rolling:
                continue
            try:
                async with current.gate:
                    if core is current and len(current.connections) == 1 and not current.rolling:
                        if codec.state.get('diceRadioMode') == 1:
                            await current.send(await codec.call('die-status'))
                        await current.send(await codec.call('ring-status'))
            except Exception as error:
                print('Dice status update failed: '+type(error).__name__, flush=True)

    app = web.Application(middlewares=[access], client_max_size=4096)
    app.router.add_route('*', '/{path:.*}', handle)
    runner = web.AppRunner(app)
    await runner.setup()
    presence_task = asyncio.create_task(keep_dice_present())
    try:
        await web.TCPSite(runner, '127.0.0.1', 5181).start()
        print('Private Bumble Core voorbereid op 127.0.0.1:5181; radio nog niet geopend.', flush=True)
        await shutdown_requested.wait()
    finally:
        presence_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await presence_task
        await stop()
        await runner.cleanup()
        await codec.close()


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--serve':
        asyncio.run(serve(sys.argv[2]))
    else:
        raise SystemExit('Gebruik --serve usb:VID:PID')
