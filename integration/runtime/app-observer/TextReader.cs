using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using Tesseract;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage.Streams;

// A local reader with the same word/coordinate contract for both backends.
// Never downloads models or asks Windows Update to install a language.
sealed class TextReader : IDisposable {
    readonly OcrEngine? windows;
    readonly TesseractEngine? portable;
    public string Backend => windows != null ? "windows" : "bundled-tesseract";
    public TextReader() {
        if (Environment.GetEnvironmentVariable("TCE_OCR_BACKEND") != "portable") {
            try { windows = OcrEngine.TryCreateFromLanguage(new Language("en-US")); } catch {}
        }
        if (windows == null) {
            var data = Path.Combine(AppContext.BaseDirectory, "tessdata");
            if (!File.Exists(Path.Combine(data, "eng.traineddata")))
                throw new InvalidOperationException("The included text reader is incomplete. Repair or reinstall TCE; no Windows language pack is required.");
            portable = new TesseractEngine(data, "eng", EngineMode.LstmOnly);
        }
    }
    public async Task<ReadResult> RecognizeAsync(SoftwareBitmap image) {
        if (windows != null) {
            var read = await windows.RecognizeAsync(image);
            return new ReadResult(read.Lines.Select(line => new ReadLine(line.Words.Select(word => new ReadWord(word.Text, word.BoundingRect)).ToList())).ToList());
        }
        var buffer = new Windows.Storage.Streams.Buffer((uint)(image.PixelWidth * image.PixelHeight * 4));
        image.CopyToBuffer(buffer);
        var bytes = new byte[buffer.Length];
        using (var reader = DataReader.FromBuffer(buffer)) reader.ReadBytes(bytes);
        using var bitmap = new Bitmap(image.PixelWidth, image.PixelHeight, PixelFormat.Format32bppArgb);
        var locked = bitmap.LockBits(new Rectangle(0, 0, bitmap.Width, bitmap.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        try { for (int y = 0; y < bitmap.Height; y++) Marshal.Copy(bytes, y * bitmap.Width * 4, IntPtr.Add(locked.Scan0, y * locked.Stride), bitmap.Width * 4); }
        finally { bitmap.UnlockBits(locked); }
        using var png = new MemoryStream(); bitmap.Save(png, System.Drawing.Imaging.ImageFormat.Png);
        using var pix = Pix.LoadFromMemory(png.ToArray());
        using var page = portable!.Process(pix, PageSegMode.SparseText);
        using var iterator = page.GetIterator();
        var lines = new List<ReadLine>(); var words = new List<ReadWord>();
        iterator.Begin();
        do {
            if (iterator.IsAtBeginningOf(PageIteratorLevel.TextLine) && words.Count > 0) { lines.Add(new ReadLine(words)); words = new(); }
            var text = iterator.GetText(PageIteratorLevel.Word)?.Trim();
            if (!string.IsNullOrEmpty(text) && iterator.GetConfidence(PageIteratorLevel.Word) >= 40 && iterator.TryGetBoundingBox(PageIteratorLevel.Word, out var box))
                words.Add(new ReadWord(text, new Windows.Foundation.Rect(box.X1, box.Y1, box.Width, box.Height)));
        } while (iterator.Next(PageIteratorLevel.Word));
        if (words.Count > 0) lines.Add(new ReadLine(words));
        return new ReadResult(lines);
    }
    public void Dispose() => portable?.Dispose();
}
sealed record ReadWord(string Text, Windows.Foundation.Rect BoundingRect);
sealed record ReadLine(List<ReadWord> Words) { public string Text => string.Join(" ", Words.Select(word => word.Text)); }
sealed record ReadResult(List<ReadLine> Lines) { public string Text => string.Join("\n", Lines.Select(line => line.Text)); }
