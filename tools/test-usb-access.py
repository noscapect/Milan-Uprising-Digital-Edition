import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

spec = importlib.util.spec_from_file_location('usb_access', Path(__file__).resolve().parents[1]/'integration/runtime/prepare-usb-access.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class AccessChecks(unittest.TestCase):
    def test_unique_device_and_ambiguity(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            def device(name):
                path = root/name
                path.mkdir()
                for key, value in dict(idVendor='1234', idProduct='abcd', busnum='1', devnum='7').items():
                    (path/key).write_text(value)
            device('a')
            calls = []
            options = dict(sys_root=root, device_root=Path('/mock/usb'), chown=lambda *a: calls.append(a), chmod=lambda *a: calls.append(a))
            module.prepare_access('1234:abcd', '1000', **options)
            self.assertEqual(calls, [(Path('/mock/usb/001/007'), 1000, -1), (Path('/mock/usb/001/007'), 0o600)])
            device('b')
            with self.assertRaises(RuntimeError):
                module.prepare_access('1234:abcd', '1000', **options)
            self.assertEqual(len(calls), 2)
            with self.assertRaises(ValueError):
                module.prepare_access('../arbitrary', '1000', **options)
            self.assertEqual(len(calls), 2)

if __name__ == '__main__':
    unittest.main()
