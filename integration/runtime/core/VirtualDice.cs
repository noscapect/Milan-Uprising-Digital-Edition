// Private synthetic hardware state; no Milan rules or real hardware identities.
using System.Security.Cryptography;
namespace Tce.Core;
public sealed class VirtualDice {
  readonly CoreCodec codec;
  readonly byte[][] ids;
  readonly bool[] announced=new bool[5];
  readonly int?[] faces=new int?[5];
  int[] pending=[];
  int[]? pendingValues;
  public VirtualDice(CoreCodec codec,Func<int,byte[]> identity){
    this.codec=codec;ids=Enumerable.Range(1,5).Select(i=>(byte[])identity(i).Clone()).ToArray();
    if(ids.Any(id=>id.Length!=8)||ids.Select(Convert.ToHexString).Distinct().Count()!=5)throw new ArgumentException("Five distinct own identities required");
  }
  public bool Rolling=>pending.Length>0;
  public object[] State=>Enumerable.Range(1,5).Select(i=>(object)new{index=i,batteryPercent=CoreCodec.VirtualBatteryPercent(ids[i-1]),batterySimulated=true,firmwareVersion=codec.Firmware.Die(i).ToString(),firmwareSimulated=true,announced=announced[i-1],rolling=pending.Contains(i),face=faces[i-1]}).ToArray();
  public List<CoreCodec.Reply> Wake(){
    if(Rolling)throw new InvalidOperationException("Wait for the current roll.");
    var replies=new List<CoreCodec.Reply>();
    foreach(int i in Enumerable.Range(1,5))replies.Add(new(true,codec.DieStatus(ids[i-1],"discovered",dieIndex:i)));
    Array.Fill(announced,true);return replies;
  }
  public List<CoreCodec.Reply> Heartbeat()=>Rolling?[]:Enumerable.Range(1,5).Where(i=>announced[i-1]).Select(i=>new CoreCodec.Reply(true,codec.DieStatus(ids[i-1],"status",dieIndex:i))).ToList();
  public List<CoreCodec.Reply> Start(int[] selection){
    if(Rolling)throw new InvalidOperationException("Er loopt al een worp.");
    if(selection.Length<1||selection.Length>5||selection.Any(i=>i<1||i>5)||selection.Distinct().Count()!=selection.Length)throw new ArgumentException("Selecteer één tot vijf verschillende dobbelstenen (1–5).");
    var replies=new List<CoreCodec.Reply>();
    foreach(int i in selection){
      if(!announced[i-1])replies.Add(new(true,codec.DieStatus(ids[i-1],"discovered",dieIndex:i)));
      replies.Add(new(true,codec.DieStatus(ids[i-1],"rolling",dieIndex:i)));
    }
    pending=(int[])selection.Clone();pendingValues=null;foreach(int i in pending)announced[i-1]=true;
    return replies;
  }
  public List<CoreCodec.Reply> Settle(){
    if(!Rolling)throw new InvalidOperationException("Geen lopende worp.");
    pendingValues??=pending.Select(_=>RandomNumberGenerator.GetInt32(1,11)).ToArray();
    return pending.Select((i,n)=>new CoreCodec.Reply(true,codec.DieStatus(ids[i-1],"settling",pendingValues[n],i))).ToList();
  }
  public List<CoreCodec.Reply> Finish(){
    if(!Rolling)throw new InvalidOperationException("Geen lopende worp.");
    var values=pendingValues??pending.Select(_=>RandomNumberGenerator.GetInt32(1,11)).ToArray();
    var replies=pending.Select((i,n)=>new CoreCodec.Reply(true,codec.DieStatus(ids[i-1],"result",values[n],i))).ToList();
    for(int n=0;n<pending.Length;n++)faces[pending[n]-1]=values[n];
    pending=[];pendingValues=null;return replies;
  }
  public void Cancel(){pending=[];pendingValues=null;}
  public void Reset(){Cancel();Array.Clear(announced);Array.Clear(faces);}
}
