using System.Text.Json;
using System.Security.Cryptography;
namespace Tce.Core;
static class CodecPipe {
  public static void Run(){
    var directory=Path.GetFullPath(Environment.GetEnvironmentVariable("MILAN_CORE_STATE_DIRECTORY")??Path.Combine(AppContext.BaseDirectory,"../state"));
    byte[] Identity(string name){var file=Path.Combine(directory,name+".bin");Directory.CreateDirectory(directory);if(!File.Exists(file)){var bytes=RandomNumberGenerator.GetBytes(8);if(name=="core")bytes[1]=0;File.WriteAllBytes(file,bytes);}var result=File.ReadAllBytes(file);if(result.Length!=8)throw new Exception("Invalid own identity");return result;}
    var codec=new CoreCodec(Identity("core"),new SimulatedFirmware(Path.Combine(directory,"simulated-firmware.json")));
    var dice=new VirtualDice(codec,i=>Identity("die-"+i));
    string? line;
    while((line=Console.ReadLine())!=null){
      try{
        using var doc=JsonDocument.Parse(line);var input=doc.RootElement;
        var replies=new List<CoreCodec.Reply>();
        switch(input.GetProperty("action").GetString()){
          case "accept":
            var command=Convert.FromHexString(input.GetProperty("hex").GetString()!);replies=codec.Accept(command);
            if(!codec.Open||codec.Radio(1)==0)dice.Reset();
            if(command.Length==2&&command[0]==2&&command[1] is 1 or 2&&codec.Open)replies.Add(new(true,codec.RingStatus(Identity("led-ring"))));
            break;
          case "sensor":var frame=codec.SetSensor(input.GetProperty("index").GetInt32(),input.GetProperty("active").GetBoolean());if(frame!=null)replies.Add(new(true,frame));break;
          case "scan":var character=input.GetProperty("character").GetInt32();var miniature=MiniatureCatalog.Get(character);replies.Add(new(true,codec.Scan(Identity(miniature.IdentityKey),miniature.Data)));break;
          case "die-start":
            var selection=input.TryGetProperty("dice",out var selected)?selected.EnumerateArray().Select(x=>x.GetInt32()).ToArray():new[]{1};
            replies=dice.Start(selection);break;
          case "die-wake":replies=dice.Wake();break;
          case "die-status":replies=dice.Heartbeat();break;
          case "ring-status":if(codec.Open&&codec.Radio(2) is 1 or 2)replies.Add(new(true,codec.RingStatus(Identity("led-ring"))));break;
          case "die-settle":replies=dice.Settle();break;
          case "die-result":replies=dice.Finish();break;
          case "die-cancel":dice.Cancel();break;
          case "firmware-begin":if(dice.Rolling)throw new InvalidOperationException("Wait for the current roll.");codec.Firmware.Begin();break;
          case "firmware-complete":codec.Firmware.Complete();break;
          case "firmware-abort":codec.Firmware.Abort();break;
          case "reset":codec.Reset();dice.Reset();break;
          case "status":break;
          default:throw new ArgumentException("Unknown codec action");
        }
        Console.WriteLine(JsonSerializer.Serialize(new{ringIdentity=Convert.ToHexString(Identity("led-ring")),service=CoreCodec.Service,command=CoreCodec.Command,data=CoreCodec.Data,readerEnabled=codec.ReaderEnabled,diceChannelReady=codec.Open&&codec.Radio(1) is 1 or 2,diceRadioMode=codec.Radio(1),sensors=codec.Sensors,dieRolling=dice.Rolling,dice=dice.State,firmware=codec.Firmware.Status,replies=replies.Select(r=>new{data=r.Data,hex=Convert.ToHexString(r.Bytes)})}));
      }catch(Exception ex){Console.WriteLine(JsonSerializer.Serialize(new{error=ex.Message}));}
    }
  }
}
