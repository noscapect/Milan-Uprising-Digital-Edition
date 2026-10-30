// Interoperability implementation; publication authorized by the project owner.
namespace Tce.Core;
public sealed class CoreCodec(byte[] identity,SimulatedFirmware? firmware=null) {
  public SimulatedFirmware Firmware {get;}=firmware??new();
  public const string Service="82047f67-f217-45dc-b881-19f93c12d7ae",Command="0000ccdd-333a-666b-2018-01c2210776ab",Data="0000ddaa-333a-666b-2018-02c2210776ab";
  readonly byte[] ownId=identity.Length==8?(byte[])identity.Clone():throw new ArgumentException("8 bytes required");
  readonly bool[] sensors=new bool[40];
  readonly int[] radios=new int[2];
  bool open,reading,reader;
  byte[] led=[];
  public record Reply(bool Data,byte[] Bytes);
  byte[] Ack(byte status,byte device,byte command){byte[] result=new byte[14];result[0]=status;result[1]=device;result[2]=command;ownId.CopyTo(result,3);result[12]=Firmware.Core.Major;result[13]=Firmware.Core.Minor;return result;}
  public List<Reply> Accept(byte[] bytes){
    if(bytes.Length<2)return [];
    byte device=bytes[0],command=bytes[1];var replies=new List<Reply>();
    if(device==0xfa&&command==0x11){open=true;replies.Add(new(false,Ack(255,device,command)));}
    else if(device==0xfa&&command==0x10){open=reading=reader=false;Array.Clear(radios);replies.Add(new(false,Ack(255,device,command)));}
    else if((device==1||device==2)&&bytes.Length==2&&(command==0||command==1||command==2||command==0x10)){
      if(command!=0x10)radios[device-1]=command;replies.Add(new(false,Ack(255,device,command)));
    }else if(device==2&&((command==0xc0&&new[]{3,11}.Contains(bytes.Length))||(command==0xc1&&new[]{8,15,16,23}.Contains(bytes.Length))||(command==0xc2&&new[]{5,7,13,15}.Contains(bytes.Length)))){
      led=(byte[])bytes.Clone();replies.Add(new(false,Ack(255,device,command)));
    }else if(device==0xa1&&(command==0||command==1||command==3)){
      reading=command!=0;replies.Add(new(false,Ack(255,device,command)));
      if(reading){replies.Add(new(false,Ack(128,device,command)));replies.Add(new(true,SensorFrame()));}
    }else if(device==0xa0&&(command==0||command==1)){reader=command==1;replies.Add(new(false,Ack(255,device,command)));}
    else replies.Add(new(false,Ack(0,device,command)));
    return replies;
  }
  public byte[]? SetSensor(int index,bool active){if(index<0||index>=40)throw new ArgumentException("Invalid sensor");sensors[index]=active;return reading?SensorFrame():null;}
  public byte[] SensorFrame(){byte[] frame=new byte[7];frame[0]=0xa1;frame[1]=5;for(int i=0;i<40;i++)if(sensors[i])frame[2+i/8]|=(byte)(1<<(7-i%8));return frame;}
  public byte[] Scan(byte[] ownIdentity,byte[] semanticData){
    if(!open||!reader)throw new InvalidOperationException("De app heeft de scanlezer niet ingeschakeld.");
    if(ownIdentity.Length!=8||semanticData.Length!=4)throw new ArgumentException("Invalid synthetic input");
    byte[] frame=new byte[17];frame[0]=0xa0;frame[1]=15;frame[2]=0x81;ownIdentity.CopyTo(frame,3);frame[11]=4;semanticData.CopyTo(frame,13);reader=false;return frame;
  }
  public bool[] Sensors=>(bool[])sensors.Clone();
  // Experimental synthetic d10 input, previously checked with the local decoder.
  public byte[] DieStatus(byte[] identity,string phase,int face=0,int dieIndex=1){
    if(!open||(radios[0]!=1&&!(phase=="discovered"&&radios[0]==2)))throw new InvalidOperationException("Dobbelsteenkanaal is niet actief.");
    if(identity.Length!=8)throw new ArgumentException("Own die identity must contain 8 bytes");
    if(phase is not ("discovered" or "rolling" or "settling" or "result" or "status"))throw new ArgumentException("Unknown die phase");
    if(phase is "result" or "settling"?(face<1||face>10):face!=0)throw new ArgumentOutOfRangeException(nameof(face));
    byte[] frame=new byte[26];frame[0]=1;frame[1]=24;
    frame[2]=phase=="discovered"?(byte)0xa0:phase=="status"?(byte)0xb7:(byte)0xb1;
    frame[3]=(byte)(3<<3 | (phase=="rolling"?3:phase=="settling"?1:phase is "discovered" or "status"?2:0));
    frame[4]=(byte)face;identity.CopyTo(frame,5);
    var battery=VirtualBatteryRaw(identity);frame[13]=(byte)battery;frame[14]=(byte)(battery>>8);
    var revision=Firmware.Die(dieIndex);frame[16]=revision.Major;frame[17]=revision.Minor;
    return frame;
  }
  static int VirtualBatteryRaw(byte[] identity)=>540+System.Security.Cryptography.SHA256.HashData(identity)[0]%27;
  public byte[] RingStatus(byte[] identity){
    if(!open||radios[1] is not (1 or 2))throw new InvalidOperationException("LED-ringkanaal is niet actief.");
    if(identity.Length!=8)throw new ArgumentException("Own ring identity must contain 8 bytes");
    // Own synthetic accessory: battery uses the same stable simulation as dice.
    byte[] frame=new byte[20];frame[0]=2;frame[1]=18;identity.CopyTo(frame,5);
    var battery=VirtualBatteryRaw(identity);frame[13]=(byte)battery;frame[14]=(byte)(battery>>8);
    frame[16]=Firmware.Ring.Major;frame[17]=Firmware.Ring.Minor;return frame;
  }
  public static int VirtualBatteryPercent(byte[] identity)=>(int)Math.Round((((VirtualBatteryRaw(identity)*600/1024)*12)-3100)/9.0);
  public bool ReaderEnabled=>reader;
  public bool Open=>open;
  public bool SensorsEnabled=>reading;
  public byte[] LedCommand=>(byte[])led.Clone();
  public int Radio(int device)=>device is 1 or 2?radios[device-1]:throw new ArgumentOutOfRangeException(nameof(device));
  public void Reset(){open=reading=reader=false;led=[];Array.Clear(radios);Array.Clear(sensors);}
}
