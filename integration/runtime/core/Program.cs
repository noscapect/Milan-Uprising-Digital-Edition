namespace Tce.Core;
static class Program {
  static void Main(string[] args) {
    if(args.Length!=1 || args[0]!="--codec-json-lines") throw new ArgumentException("Use --codec-json-lines");
    CodecPipe.Run();
  }
}
