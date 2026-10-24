"""Read selected, unencrypted images from the locally installed official app.

Optional preparation tool: pip install UnityPy==1.23.0. The demo needs only Node.
Never patches the application; exports only to the ignored private/artwork folder.
"""
import argparse
import hashlib
import json
import os
import unicodedata
from pathlib import Path

import UnityPy

ROOT = Path(__file__).resolve().parents[1]


def normalized(value):
    return "".join(c for c in unicodedata.normalize("NFD", value).lower() if c.isascii() and c.isalnum())


def extract(app_data):
    profile = json.loads((ROOT / "data/games/milan-uprising/city.json").read_text(encoding="utf8"))
    output = ROOT / "private/artwork"
    images = output / "images"
    images.mkdir(parents=True, exist_ok=True)
    textures = []
    environments = []  # Keep backing resource streams alive until export finishes.
    for filename in ("resources.assets", "sharedassets0.assets"):
        env = UnityPy.load(str(app_data / filename))
        environments.append(env)
        for obj in env.objects:
            if obj.type.name != "Texture2D":
                continue
            data = obj.read()
            textures.append((filename, obj.path_id, data))
    pack = {
        "format": "tabletop-local-artwork", "schemaVersion": 1, "gameId": "milan-uprising",
        "source": {"label": "Milan Uprising Windows 1.0.9", "tool": f"UnityPy {UnityPy.__version__}",
                   "rights": "No redistribution license verified. Local artwork is excluded from Git."},
        "assets": {}, "components": {}, "zones": {}, "groups": {}, "faces": {}, "branding": {},
    }

    def export(asset_id, name, width=None, height=None):
        candidates = [r for r in textures if normalized(r[2].m_Name) == normalized(name)
                      and (width is None or r[2].m_Width == width)
                      and (height is None or r[2].m_Height == height)]
        if len(candidates) != 1:
            return None  # Never guess between different pictures or locations.
        filename, path_id, texture = candidates[0]
        destination = images / f"{asset_id}.png"
        texture.image.save(destination)  # Decode original pixels; no generated/repainted artwork.
        pack["assets"][asset_id] = {
            "file": destination.name, "label": name, "width": texture.m_Width, "height": texture.m_Height,
            "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
            "sourceFile": filename, "pathId": path_id, "textureName": texture.m_Name,
        }
        return asset_id

    people = {
        "character-brujah": "simona_ferrari", "character-gangrel": "rosa_de_lorenzo",
        "character-malkavian": "arianna_zanni", "character-nosferatu": "orlando_bianchi",
        "character-toreador": "latebra_uberto_ascheri", "character-tremere": "dante_brunieri",
        "character-ventrue": "chao_yang_marco_hu", "ally-carabinieri-officer": "police_officer",
        "ally-reporter": "reporter", "ghoul-con-artist": "con_artist", "ghoul-fixer": "fixer",
        "npc-agnese-della-luna": "agnese", "npc-hasanah": "hasanah", "npc-helena-varga": "helena",
        "npc-il-dottore": "dottore", "npc-lafcadio": "lafcadio", "npc-leandro-costa": "leandro",
        "npc-ruslana": "ruslana", "npc-salvador-espartelo": "salvador",
    }
    for component_id, name in people.items():
        icon_width = 256 if component_id.startswith("character-") else 240
        icon_height = 255 if component_id.startswith("character-") else 240
        icon = export(f"{component_id}-icon", name, icon_width, icon_height)
        detail = export(f"{component_id}-portrait", name, 614, 1024)
        pack["components"][component_id] = {key: value for key, value in {"icon": icon, "detail": detail}.items() if value}
    for zone in profile["zones"]:
        if zone.get("area") == "city":
            background = export(f"location-{zone['id']}", zone["label"], 1024, 576)
            if background:
                pack["zones"][zone["id"]] = {"background": background}
    for group, name in [("anarch-cubes", "anarchs_cube"), ("camarilla-cubes", "camarilla_cube"), ("ambrose-cubes", "inquisition_cube")]:
        asset_id = export(f"group-{group}", name, 72, 73)
        if asset_id:
            pack["groups"][group] = asset_id
    for face, name, width, height in [("anarchs", "anarchs", 79, 79), ("camarilla", "camarilla", 79, 79),
                                      ("ambrose", "inquisition", 79, 79), ("investigation", "token_investigation", 128, 128),
                                      ("restricted", "token_forbiddenlocation", 256, 256)]:
        asset_id = export(f"face-{face}", name, width, height)
        if asset_id:
            pack["faces"][face] = asset_id
    masquerade = export("token-masquerade", "token_masquerade", 256, 256)
    if masquerade:
        pack["components"]["masquerade"] = {"icon": masquerade}
    for kind, asset_id, name, width, height in [("map", "map-milan", "map_Milan", 2048, 1295),
                                                ("logo", "logo-milan", "logo-MilanUprising", 1024, 412)]:
        result = export(asset_id, name, width, height)
        if result:
            pack["branding"][kind] = result
    for kind, name in [("blank", "diceblack_empty"), ("skull", "diceblack_skull"), ("success", "diceblack_ankh"), ("double-success", "diceblack_double_ankh")]:
        asset_id = export(f"dice-{kind}", name)
        if asset_id:
            pack["faces"][f"dice-{kind}"] = asset_id
    (output / "manifest.json").write_text(json.dumps(pack, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({"exportedImages": len(pack["assets"]), "people": len(people), "districtBackgrounds": len(pack["zones"]),
                      "map": bool(pack["branding"].get("map")), "logo": bool(pack["branding"].get("logo")),
                      "output": "private/artwork"}))


if __name__ == "__main__":
    default = Path(os.environ.get("LOCALAPPDATA", "")) / "Programs/Teburu/Milan Uprising/1.0.9/VTMTEBURU_v1.0.9/VTMTEBURU_Data"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-data", type=Path, default=default)
    args = parser.parse_args()
    source = args.app_data.resolve()
    if not (source / "resources.assets").is_file() or not (source / "sharedassets0.assets").is_file():
        parser.error("Officiële appdata niet gevonden; geef --app-data op.")
    if source == (ROOT / "private/artwork").resolve():
        parser.error("Bron en uitvoer mogen niet hetzelfde zijn.")
    extract(source)
