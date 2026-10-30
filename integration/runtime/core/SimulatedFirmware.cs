using System.Text.Json;
namespace Tce.Core;
// Our emulator compatibility state only. No firmware image is executed or modified.
public sealed class SimulatedFirmware {
  public record Revision(byte Major,byte Minor){public override string ToString()=>$"{Major}.{Minor}.0";}
  public sealed record Saved(int SchemaVersion,Revision Core,Revision[] Dice,string Phase,string? CompletedAt,Revision? Ring=null);
  // Compatibility targets observed in the unmodified Android app's version check,
  // 2026-10-25. Bundled update filenames can lag behind the app's version catalogue.
  public static readonly Revision CoreTarget=new(2,32),DieTarget=new(3,39),RingTarget=new(1,15);
  readonly string? file;
  Saved state=new(1,new(0,0),Enumerable.Range(0,5).Select(_=>new Revision(0,0)).ToArray(),"idle",null);
  public SimulatedFirmware(string? file=null){
    this.file=file;
    if(file!=null&&File.Exists(file)){
      var saved=JsonSerializer.Deserialize<Saved>(File.ReadAllText(file))??throw new Exception("Invalid simulated firmware state");
      if(saved.SchemaVersion!=1||saved.Core==null||saved.Dice.Length!=5||saved.Dice.Any(x=>x==null)||!new[]{"idle","updating","completed","interrupted"}.Contains(saved.Phase))throw new Exception("Invalid simulated firmware state");
      state=saved;
      if(state.Phase=="updating"){state=state with{Phase="interrupted"};Persist();}
    }
  }
  void Persist(){
    if(file==null)return;
    Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(file))!);var temp=file+".tmp";
    for(int attempt=0;;attempt++)try{File.WriteAllText(temp,JsonSerializer.Serialize(state));File.Move(temp,file,true);break;}
    catch(Exception e)when(attempt<8&&e is IOException or UnauthorizedAccessException){Thread.Sleep(10);}
  }
  void Commit(Saved next){var old=state;state=next;try{Persist();}catch{state=old;throw;}}
  public Revision Core=>state.Core;
  public Revision Die(int index)=>index is >=1 and <=5?state.Dice[index-1]:throw new ArgumentOutOfRangeException(nameof(index));
  public Revision Ring=>state.Ring??new(0,0);
  public bool Updating=>state.Phase=="updating";
  public bool Current=>Core==CoreTarget&&Ring==RingTarget&&state.Dice.All(x=>x==DieTarget);
  public object Status=>new{simulated=true,phase=state.Phase,updateRequired=!Current,core=new{reportedVersion=Core.ToString(),targetVersion=CoreTarget.ToString()},dice=Enumerable.Range(1,5).Select(i=>new{index=i,reportedVersion=Die(i).ToString(),targetVersion=DieTarget.ToString()}),ring=new{reportedVersion=Ring.ToString(),targetVersion=RingTarget.ToString()},completedAt=state.CompletedAt,officialDfuSupported=false};
  public void Begin(){if(Updating)throw new InvalidOperationException("A simulated update is already running.");if(Current)return;Commit(state with{Phase="updating"});}
  public void Complete(){if(Current)return;if(!Updating)throw new InvalidOperationException("Start the simulated update first.");Commit(state with{Core=CoreTarget,Ring=RingTarget,Dice=Enumerable.Repeat(DieTarget,5).ToArray(),Phase="completed",CompletedAt=DateTimeOffset.UtcNow.ToString("O")});}
  public void Abort(){if(!Updating)return;Commit(state with{Phase="interrupted"});}
}
