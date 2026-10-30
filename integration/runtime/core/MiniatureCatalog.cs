using System.Text.Json;
using System.Text.RegularExpressions;
namespace Tce.Core;
// Game semantics come from the selected module; physical identities remain synthetic.
static class MiniatureCatalog {
  internal static (string IdentityKey, byte[] Data) Get(int slot) {
    var path = Environment.GetEnvironmentVariable("TCE_GAME_CATALOG") ?? Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../miniatures.json"));
    using var document = JsonDocument.Parse(File.ReadAllText(path));
    if (document.RootElement.GetProperty("schemaVersion").GetInt32() != 1 || !document.RootElement.GetProperty("miniatures").TryGetProperty(slot.ToString(), out var item)) throw new ArgumentException("Unknown module miniature");
    var key = item.GetProperty("identityKey").GetString() ?? "";
    if (!Regex.IsMatch(key, "^[a-z0-9-]{1,80}$")) throw new ArgumentException("Invalid synthetic identity key");
    var data = item.GetProperty("data").EnumerateArray().Select(value => value.GetByte()).ToArray();
    if (data.Length < 1 || data.Length > 32) throw new ArgumentException("Invalid module miniature data");
    return (key, data);
  }
}
