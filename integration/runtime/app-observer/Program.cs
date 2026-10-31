using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text.Json;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage.Streams;

if(args.Length==1&&args[0]=="--readiness"){
  try {
    using var reader=new TextReader();
    using var sample=new Bitmap(700,90);using(var graphics=Graphics.FromImage(sample)){graphics.Clear(Color.White);using var font=new Font("Arial",26);graphics.DrawString("NIGHT 2 DAY",font,Brushes.Black,10,15);}
    using var pixels=BitmapInput.Software(sample);var read=await reader.RecognizeAsync(pixels);
    bool available=read.Text.Contains("NIGHT")&&read.Text.Contains("DAY")&&read.Text.Contains("2");
    Console.WriteLine(JsonSerializer.Serialize(new{englishOcrAvailable=available,textRecognitionAvailable=available,backend=reader.Backend}));
  }catch(Exception error){Console.WriteLine(JsonSerializer.Serialize(new{englishOcrAvailable=false,textRecognitionAvailable=false,error=error.Message}));}
  return;
}
Native.SetProcessDpiAwarenessContext(new IntPtr(-4));
Native.SetThreadDpiAwarenessContext(new IntPtr(-4));
var targetProcess=Environment.GetEnvironmentVariable("TCE_GAME_PROCESS");
var process=string.IsNullOrEmpty(targetProcess)?null:Process.GetProcessesByName(targetProcess).FirstOrDefault(p=>p.MainWindowHandle!=IntPtr.Zero);
bool focusRead=args.Length==3&&args[2]=="--focus";
bool rawImage=(args.Length==2||focusRead)&&args[0]=="--raw";
bool external=(args.Length==2||focusRead)&&(args[0]=="--image"||rawImage);
if(!external&&process==null){Console.WriteLine(JsonSerializer.Serialize(new{available=false,error="Official app window not available"}));return;}
using var externalImage=external?(rawImage?BitmapInput.ReadRaw(args[1]):new Bitmap(args[1])):null;
int width,height;
if(external){width=externalImage!.Width;height=externalImage.Height;}
else{if(!Native.GetWindowRect(process!.MainWindowHandle,out var rect))throw new Exception("Window bounds unavailable");width=rect.Right-rect.Left;height=rect.Bottom-rect.Top;}
if(width<400||height<300||width>5000||height>5000)throw new Exception("Unsupported window bounds");
using var bitmap=new Bitmap(width,height,System.Drawing.Imaging.PixelFormat.Format32bppArgb);
using(var graphics=Graphics.FromImage(bitmap)){
  if(external)graphics.DrawImageUnscaled(externalImage!,0,0);
  else{var dc=graphics.GetHdc();bool captured;
    try{captured=Native.PrintWindow(process!.MainWindowHandle,dc,2);}finally{graphics.ReleaseHdc(dc);}
    if(!captured)throw new Exception("App window capture failed");}
}
using var software=BitmapInput.Software(bitmap);
using var engine=new TextReader();
// During a pending move, read only the location header and active-character footer.
// Fall back to the complete observer when this is not an ordinary location screen.
if(focusRead&&external&&width==2560&&height==1600){
 var focusedLines=new List<object>();var focusedText=new List<string>();bool locationHeading=false;
 foreach(var area in new[]{new Rectangle(0,0,width,620),new Rectangle(0,1280,width,320)}){
  using var crop=new Bitmap(area.Width,area.Height);using(var g=Graphics.FromImage(crop))g.DrawImage(bitmap,new Rectangle(0,0,area.Width,area.Height),area,GraphicsUnit.Pixel);
  using var pixels=BitmapInput.Software(crop);var read=await engine.RecognizeAsync(pixels);
  foreach(var line in read.Lines){
   var y=line.Words.Min(w=>w.BoundingRect.Y)+area.Y;
   focusedText.Add(line.Text);
   if(y>height*.10&&y<height*.31&&line.Text.Contains(':'))locationHeading=true;
   focusedLines.Add(new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X),y,words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X,y=w.BoundingRect.Y+area.Y,width=w.BoundingRect.Width,height=w.BoundingRect.Height})});
  }
 }
 var compact=System.Text.RegularExpressions.Regex.Replace(string.Join(" ",focusedText).ToLowerInvariant(),"[^a-z0-9]","");
 int headerWhites=0;
 for(int y=60;y<125;y+=2)for(int x=700;x<875;x+=2){var pixel=bitmap.GetPixel(x,y);if(pixel.R>180&&pixel.G>180&&pixel.B>180)headerWhites++;}
 // Modal overlays dim the navigation. They must use full OCR, including errors.
 if(headerWhites>=100&&locationHeading&&compact.Contains("endturn")&&compact.Contains("main")&&compact.Contains("sheet")){
  Console.WriteLine(JsonSerializer.Serialize(new{available=true,focusRead=true,capturedAt=DateTimeOffset.UtcNow,width,height,lines=focusedLines,visuals=Array.Empty<object>(),mapGeometry=(string?)null,setupTargetZone=(string?)null}));return;
 }
}
var result=await engine.RecognizeAsync(software);
// OCR can mistake colored Influence cubes for letters. Read
// calibrated feed text as neutral light ink, without red/purple/gold icons.
if(external&&width==2560&&height==1600&&result.Lines.Any(line=>line.Text.Contains("SUSPICION",StringComparison.OrdinalIgnoreCase))){
  const int fx=1330,fy=320,fw=630,fh=1072;
  using var feed=new Bitmap(fw,fh);
  for(int y=0;y<fh;y++)for(int x=0;x<fw;x++){
    var pixel=bitmap.GetPixel(x+fx,y+fy);int low=Math.Min(pixel.R,Math.Min(pixel.G,pixel.B)),high=Math.Max(pixel.R,Math.Max(pixel.G,pixel.B));
    feed.SetPixel(x,y,low>145&&high-low<60?Color.Black:Color.White);
  }
  using var feedPixels=BitmapInput.Software(feed);var clean=await engine.RecognizeAsync(feedPixels);
  result.Lines.RemoveAll(line=>line.Words.Min(word=>word.BoundingRect.X)>width*.5&&line.Words.Min(word=>word.BoundingRect.X)<width*.7&&line.Words.Min(word=>word.BoundingRect.Y)>fy&&line.Words.Min(word=>word.BoundingRect.Y)<fy+fh);
  result.Lines.AddRange(clean.Lines.Select(line=>new ReadLine(line.Words.Select(word=>new ReadWord(word.Text,new Windows.Foundation.Rect(word.BoundingRect.X+fx,word.BoundingRect.Y+fy,word.BoundingRect.Width,word.BoundingRect.Height))).ToList())));
}
var supplementalLines=new List<object>();
// Gold setup titles can disappear in whole-frame OCR. Read their fixed
// title area separately; only an explicitly recognized placement title counts.
if(external&&width==2560&&height==1600&&result.Lines.Any(l=>System.Text.RegularExpressions.Regex.Replace(l.Text.ToLowerInvariant(),"[^a-z]","").Contains("scenariosetup"))){
  const int sx=800,sy=175,sw=1000,sh=90;
  using var setupTitle=new Bitmap(sw,sh);
  for(int y=0;y<sh;y++)for(int x=0;x<sw;x++){
    var pixel=bitmap.GetPixel(x+sx,y+sy);
    setupTitle.SetPixel(x,y,pixel.R>120&&pixel.R>pixel.G*1.1&&pixel.G>pixel.B*1.15?Color.Black:Color.White);
  }
  using var setupPixels=BitmapInput.Software(setupTitle);
  var setupResult=await engine.RecognizeAsync(setupPixels);
  var setupText=System.Text.RegularExpressions.Regex.Replace(setupResult.Text.ToLowerInvariant(),"[^a-z]","");
  if(new[]{"npcplacement","alliesplacement","ghoulsplacement"}.Contains(setupText))
    foreach(var line in setupResult.Lines)supplementalLines.Add(new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X)+sx,y=line.Words.Min(w=>w.BoundingRect.Y)+sy,words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X+sx,y=w.BoundingRect.Y+sy,width=w.BoundingRect.Width,height=w.BoundingRect.Height})});
}
bool recoveredPhaseHeader=false;
// Whole-frame OCR sometimes drops NIGHT/number while the day feed scrolls.
// Read the fixed header area directly; require a complete recognized phase title.
if(external&&width==2560&&height==1600&&!result.Lines.Any(l=>l.Words.Min(w=>w.BoundingRect.Y)<height*.12&&l.Text.TrimStart().StartsWith("NIGHT",StringComparison.OrdinalIgnoreCase))&&result.Lines.Any(l=>l.Text.Contains("SUSPICION",StringComparison.OrdinalIgnoreCase))){
  // Retry without the calendar icon and phase dots when they obscure NIGHT in OCR.
  foreach(var crop in new[]{(x:300,y:40,w:500,h:130),(x:385,y:60,w:365,h:80)}){
  int hx=crop.x,hy=crop.y,hw=crop.w,hh=crop.h;using var header=new Bitmap(hw,hh);
  using(var g=Graphics.FromImage(header))g.DrawImage(bitmap,new Rectangle(0,0,hw,hh),new Rectangle(hx,hy,hw,hh),GraphicsUnit.Pixel);
  for(int y=0;y<hh;y++)for(int x=0;x<hw;x++){var pixel=header.GetPixel(x,y);header.SetPixel(x,y,pixel.R+pixel.G+pixel.B>105?Color.Black:Color.White);}
  using var headerSoftware=BitmapInput.Software(header);var headerResult=await engine.RecognizeAsync(headerSoftware);
  if(Environment.GetEnvironmentVariable("MILAN_OCR_DEBUG_HEADER")=="1")Console.Error.WriteLine(headerResult.Text);
  var title=System.Text.RegularExpressions.Regex.Replace(headerResult.Text.ToLowerInvariant(),"[^a-z0-9]","");
  recoveredPhaseHeader=System.Text.RegularExpressions.Regex.IsMatch(title,@"night[0-9oi]+(day|sunset|hour[0-9oi]+)");
  if(recoveredPhaseHeader)foreach(var line in headerResult.Lines)supplementalLines.Add(new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X)+hx,y=line.Words.Min(w=>w.BoundingRect.Y)+hy,words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X+hx,y=w.BoundingRect.Y+hy,width=w.BoundingRect.Width,height=w.BoundingRect.Height})});
  if(recoveredPhaseHeader)break;
  }
}
// Red role titles on the companion deployment screen have too little contrast
// for the whole-frame OCR. Read that bounded title area as a red-ink mask.
if(external&&width==2560&&height==1600&&result.Lines.Any(l=>l.Text.Trim().Equals("Allies",StringComparison.OrdinalIgnoreCase))&&result.Lines.Any(l=>l.Text.Trim().Equals("Ghouls",StringComparison.OrdinalIgnoreCase))&&result.Lines.Any(l=>l.Text.Trim().Equals("Done",StringComparison.OrdinalIgnoreCase))){
  int titleY=640,titleHeight=112,titleWidth=1024;
  using var titleMask=new Bitmap(titleWidth,titleHeight);
  for(int y=0;y<titleHeight;y++)for(int x=0;x<titleWidth;x++){
    var pixel=bitmap.GetPixel(x,y+titleY);
    titleMask.SetPixel(x,y,pixel.R>100&&pixel.R>pixel.G*1.8&&pixel.R>pixel.B*1.5?Color.Black:Color.White);
  }
  using var titleSoftware=BitmapInput.Software(titleMask);
  var titleResult=await engine.RecognizeAsync(titleSoftware);
  foreach(var line in titleResult.Lines)supplementalLines.Add(new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X),y=line.Words.Min(w=>w.BoundingRect.Y)+titleY,words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X,y=w.BoundingRect.Y+titleY,width=w.BoundingRect.Width,height=w.BoundingRect.Height})});
}
// Animated character artwork can cause whole-screen OCR to miss its footer.
// Read the scan prompt separately; it is still observed text, never inferred.
if(external&&!result.Lines.Any(l=>System.Text.RegularExpressions.Regex.Replace(l.Text.ToLowerInvariant(),"[^a-z]","").Contains("scanyourcharacter"))){
  int cropY=(int)(height*.82),cropHeight=height-cropY;
  using var footer=new Bitmap(width,cropHeight);
  using(var g=Graphics.FromImage(footer))g.DrawImage(bitmap,new Rectangle(0,0,width,cropHeight),new Rectangle(0,cropY,width,cropHeight),GraphicsUnit.Pixel);
  using var footerSoftware=BitmapInput.Software(footer);
  foreach(var line in (await engine.RecognizeAsync(footerSoftware)).Lines){
    if(!System.Text.RegularExpressions.Regex.Replace(line.Text.ToLowerInvariant(),"[^a-z]","").Contains("scanyourcharacter"))continue;
    supplementalLines.Add(new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X),y=line.Words.Min(w=>w.BoundingRect.Y)+cropY,words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X,y=w.BoundingRect.Y+cropY,width=w.BoundingRect.Width,height=w.BoundingRect.Height})});
  }
}
var visuals=new List<object>();
var anchorColumns=new HashSet<int>();var anchorRows=new HashSet<int>();int mapAnchors=0;bool mapBoundsVerified=false;
string? setupTargetZone=null;
if(external&&width==2560&&height==1600&&result.Lines.Any(l=>l.Text.Contains("CHARACTERS SELECTION",StringComparison.OrdinalIgnoreCase))){
  var targets=new List<string>();
  for(int col=0;col<2;col++){
    var edges=new List<int>();
    for(int y=350;y<1180;y++){
      int whites=0;
      for(int x=col==0?270:420;x<(col==0?413:577);x++){var p=bitmap.GetPixel(x,y);if(p.R>225&&p.G>225&&p.B>225)whites++;}
      if(whites>=85&&(edges.Count==0||y-edges.Last()>3))edges.Add(y);
    }
    if(edges.Count==2&&edges[1]-edges[0]>=110&&edges[1]-edges[0]<=150){
      double center=(edges[0]+edges[1])/2.0;
      int row=(int)Math.Round((center-445)/162.0);
      if(row>=0&&row<5&&Math.Abs(center-(445+row*162))<30)targets.Add($"haven-{row+1}{(col==0?"l":"r")}");
    }
  }
  if(targets.Count==1)setupTargetZone=targets[0];
}
bool androidMap=external&&width==2560&&height==1600&&(recoveredPhaseHeader||result.Lines.Any(l=>l.Words.Min(w=>w.BoundingRect.Y)<height*.12&&l.Text.TrimStart().StartsWith("NIGHT",StringComparison.OrdinalIgnoreCase)));
bool androidSetup=external&&width==2560&&height==1600&&result.Lines.Any(l=>l.Text.Contains("COMPONENTS SETUP",StringComparison.OrdinalIgnoreCase));
if((!external&&width==1042&&height==815)||androidMap||androidSetup){
  Color Sample(int x,int y)=>(androidMap||androidSetup)?bitmap.GetPixel((int)Math.Round(67+(x-41)*220.0/105.6),(int)Math.Round((androidSetup?436:408)+(y-232)*219.0/106)):bitmap.GetPixel(x,y);
  for(int column=0;column<6;column++)for(int row=0;row<5;row++){
    int cx=(int)Math.Round(41+105.6*column),cy=232+106*row;
    var totals=new int[5];int edges=0;
    for(int dy=-9;dy<=9;dy++)for(int dx=-9;dx<=9;dx++){
      var p=Sample(cx+dx,cy+dy);
      if(p.R>65&&p.R>p.G*1.8&&p.R>p.B*1.4)totals[0]++;
      if(p.B>55&&p.B>p.R*1.12&&p.B>p.G*1.35&&p.R>p.G*1.15)totals[1]++;
      if(p.R>90&&p.G>70&&p.B<p.R*.6&&p.G>p.R*.55)totals[2]++;
      if(p.R>210&&p.G>210&&p.B>210)totals[3]++;
      if(p.R<45&&p.G<45&&p.B<45)totals[4]++;
    }
    foreach(int offset in Enumerable.Range(-7,15))foreach(var q in new[]{(cx-12,cy+offset),(cx+12,cy+offset),(cx+offset,cy-12),(cx+offset,cy+12)}){
      var p=Sample(q.Item1,q.Item2);if(p.R<55&&p.G<55&&p.B<55)edges++;
    }
    int dominant=Enumerable.Range(0,3).OrderByDescending(i=>totals[i]).First();
    bool single=totals[dominant]>300&&totals[3]<15;
    bool multiple=totals[dominant]>140&&totals[3]>35&&totals[4]>25;
    bool empty=!single&&!multiple&&totals[dominant]<210&&edges<25;
    int? count=single?1:empty?0:null;string numberText="";
    if(multiple){
      using var digit=new Bitmap(400,140);
      using(var graphics=Graphics.FromImage(digit)){
        graphics.Clear(Color.White);using var font=new Font("Segoe UI",40,FontStyle.Bold);graphics.DrawString("Count",font,Brushes.Black,0,20);
        for(int dy=-13;dy<=13;dy++)for(int dx=-13;dx<=13;dx++){
          var p=Sample(cx+dx,cy+dy);
          if(p.R>210&&p.G>210&&p.B>210)graphics.FillRectangle(Brushes.Black,200+(dx+13)*4,10+(dy+13)*4,4,4);
        }
      }
      using var digitPng=new MemoryStream();digit.Save(digitPng,ImageFormat.Png);
      using var digitStream=new InMemoryRandomAccessStream();
      using(var writer=new DataWriter(digitStream)){writer.WriteBytes(digitPng.ToArray());await writer.StoreAsync();writer.DetachStream();}digitStream.Seek(0);
      var digitDecoder=await BitmapDecoder.CreateAsync(digitStream);
      using var digitSoftware=await digitDecoder.GetSoftwareBitmapAsync(BitmapPixelFormat.Bgra8,BitmapAlphaMode.Premultiplied);
      numberText=(await engine.RecognizeAsync(digitSoftware)).Text.Trim();
      var number=System.Text.RegularExpressions.Regex.Match(numberText,@"(?<!\d)[23](?!\d)");
      count=number.Success?int.Parse(number.Value.Trim()):null;
    }
    var control=new int[5];
    for(int dy=-11;dy<=11;dy++)for(int dx=-11;dx<=11;dx++){
      var p=Sample(cx+41+dx,cy+dy);
      if(p.R>65&&p.R>p.G*1.8&&p.R>p.B*1.4)control[0]++;
      if(p.B>55&&p.B>p.R*1.12&&p.B>p.G*1.35&&p.R>p.G*1.15)control[1]++;
      if(p.R>90&&p.G>70&&p.B<p.R*.6&&p.G>p.R*.55)control[2]++;
      if(p.R>210&&p.G>210&&p.B>210)control[3]++;
      if(p.R<45&&p.G<45&&p.B<45)control[4]++;
    }
    int controlDominant=Enumerable.Range(0,3).OrderByDescending(i=>control[i]).First();
    string? controlFaction=control[controlDominant]>300&&control[3]>60&&control[4]>10?new[]{"anarchs","camarilla","ambrose"}[controlDominant]:null;
    if(controlFaction!=null){mapAnchors++;anchorColumns.Add(column);anchorRows.Add(row);}
    visuals.Add(new{appSensor=(column+2)*5+(4-row),cx,cy,red=totals[0],purple=totals[1],yellow=totals[2],white=totals[3],dark=totals[4],edges,cubeFaction=count>0?new[]{"anarchs","camarilla","ambrose"}[dominant]:null,cubeCount=count,numberText,control,controlFaction});
  }
}
var lines=result.Lines.Select(line=>(object)new{text=line.Text,x=line.Words.Min(w=>w.BoundingRect.X),y=line.Words.Min(w=>w.BoundingRect.Y),words=line.Words.Select(w=>new{text=w.Text,x=w.BoundingRect.X,y=w.BoundingRect.Y,width=w.BoundingRect.Width,height=w.BoundingRect.Height})}).Concat(supplementalLines);
if(androidMap){
  int dark=0,total=0;
  for(int x=1310;x<=1320;x+=2)for(int y=350;y<=1250;y+=30){var pixel=bitmap.GetPixel(x,y);total++;if(pixel.R<45&&pixel.G<45&&pixel.B<45)dark++;}
  mapBoundsVerified=dark>=total*.90&&mapAnchors>=8&&anchorColumns.Count>=4&&anchorRows.Count>=4;
}
Console.WriteLine(JsonSerializer.Serialize(new{mapGeometry=mapBoundsVerified?"android-city-v1":null,available=true,capturedAt=DateTimeOffset.UtcNow,source=external?"android-image":"windows",processId=external?(int?)null:process!.Id,width,height,lines,visuals,setupTargetZone}));

static class Native {
  [DllImport("user32.dll")]internal static extern bool SetProcessDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]internal static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]internal static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll")]internal static extern bool PrintWindow(IntPtr hwnd,IntPtr hdc,uint flags);
  internal struct Rect{public int Left,Top,Right,Bottom;}
}

static class BitmapInput {
  internal static Bitmap ReadRaw(string path){
    var bytes=File.ReadAllBytes(path);if(bytes.Length<16)throw new Exception("Incomplete raw screenshot");
    int width=BitConverter.ToInt32(bytes,0),height=BitConverter.ToInt32(bytes,4),format=BitConverter.ToInt32(bytes,8);
    if(width<400||height<300||width>5000||height>5000||format!=1)throw new Exception("Unsupported raw screenshot");
    int count=checked(width*height*4),header=bytes.Length-count;
    if(header!=12&&header!=16)throw new Exception("Invalid raw screenshot length");
    var pixels=new byte[count];for(int i=0;i<count;i+=4){pixels[i]=bytes[header+i+2];pixels[i+1]=bytes[header+i+1];pixels[i+2]=bytes[header+i];pixels[i+3]=bytes[header+i+3];}
    var bitmap=new Bitmap(width,height,System.Drawing.Imaging.PixelFormat.Format32bppArgb);
    var data=bitmap.LockBits(new Rectangle(0,0,width,height),ImageLockMode.WriteOnly,System.Drawing.Imaging.PixelFormat.Format32bppArgb);
    try{for(int row=0;row<height;row++)Marshal.Copy(pixels,row*width*4,IntPtr.Add(data.Scan0,row*data.Stride),width*4);}finally{bitmap.UnlockBits(data);}
    return bitmap;
  }
  internal static SoftwareBitmap Software(Bitmap bitmap){
    var data=bitmap.LockBits(new Rectangle(0,0,bitmap.Width,bitmap.Height),ImageLockMode.ReadOnly,System.Drawing.Imaging.PixelFormat.Format32bppArgb);
    var pixels=new byte[checked(bitmap.Width*bitmap.Height*4)];
    try{for(int row=0;row<bitmap.Height;row++)Marshal.Copy(IntPtr.Add(data.Scan0,row*data.Stride),pixels,row*bitmap.Width*4,bitmap.Width*4);}finally{bitmap.UnlockBits(data);}
    using var writer=new DataWriter();writer.WriteBytes(pixels);
    return SoftwareBitmap.CreateCopyFromBuffer(writer.DetachBuffer(),BitmapPixelFormat.Bgra8,bitmap.Width,bitmap.Height,BitmapAlphaMode.Premultiplied);
  }
}
