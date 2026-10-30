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


def extract(app_data, merge=False):
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
    if merge and (output / 'manifest.json').exists():
        existing = json.loads((output / 'manifest.json').read_text(encoding='utf8'))
        if existing.get('format') != pack['format'] or existing.get('gameId') != pack['gameId'] or existing.get('schemaVersion') != 1:
            raise ValueError('Incompatible local artwork manifest')
        pack = existing

    def export(asset_id, name, width=None, height=None):
        candidates = [r for r in textures if normalized(r[2].m_Name) == normalized(name)
                      and (width is None or r[2].m_Width == width)
                      and (height is None or r[2].m_Height == height)]
        if len(candidates) != 1:
            return None  # Never guess between different pictures or locations.
        filename, path_id, texture = candidates[0]
        destination = images / f"{asset_id}.png"
        previous = pack['assets'].get(asset_id)
        if merge and previous and destination.is_file() and previous.get('file') == destination.name:
            if (previous.get('sourceFile'), previous.get('pathId'), previous.get('textureName')) == (filename, path_id, texture.m_Name) and hashlib.sha256(destination.read_bytes()).hexdigest() == previous.get('sha256'):
                return asset_id
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
        "character-ventrue": "chao_yang_marco_hu",
        "character-hecata": "jamilah_ianni", "character-lasombra": "domenica_amato",
        "character-ministry": "aristide_demiana", "character-tzimisce": "romeo_de_carlo",
        "ally-carabinieri-officer": "police_officer",
        "ally-reporter": "reporter", "ghoul-con-artist": "con_artist", "ghoul-fixer": "fixer",
        "ally-food-delivery-driver": "food_delivery_driver", "ally-paramedic": "paramedic",
        "ally-taxi-driver": "taxi_driver", "ally-investigator": "investigator",
        "ally-hacker": "hacker", "ally-real-estate-agent": "real_estate_agent",
        "ghoul-blood-addict": "blood_addict", "ghoul-enforcer": "enforcer",
        "ghoul-punk": "punk", "ghoul-burglar": "burglar", "ghoul-vagrant": "vagrant",
        "npc-professor-jacopo-spano": "spano", "npc-rahim": "rahim",
        "npc-andreu-la-torre": "latorre",
        "npc-agnese-della-luna": "agnese", "npc-hasanah": "hasanah", "npc-helena-varga": "helena",
        "npc-il-dottore": "dottore", "npc-lafcadio": "lafcadio", "npc-leandro-costa": "leandro",
        "npc-ruslana": "ruslana", "npc-salvador-espartelo": "salvador",
    }
    for component_id, name in people.items():
        icon_width = 256 if component_id.startswith("character-") else 240
        icon_height = 255 if component_id.startswith("character-") else 240
        icon = export(f"{component_id}-icon", name, icon_width, icon_height)
        detail = export(f"{component_id}-portrait", name, 611 if name == 'latorre' else 614, 1024)
        pack["components"].setdefault(component_id, {}).update({key: value for key, value in {"icon": icon, "detail": detail}.items() if value})
    # These numbered IDs are our inventory slots, not an official numbering scheme.
    extras = json.loads((ROOT / 'data/games/milan-uprising/expansions.json').read_text(encoding='utf8'))
    shared = {
        'faction-anarchs-': ('prop_anarchs', 128, 128),
        'faction-camarilla-': ('prop_camarilla', 128, 128),
        'faction-ambrose-': ('prop_inquisition', 128, 128),
        'faction-sabbat-': ('prop_sabbat', 128, 128),
        'influence-sabbat-': ('sabbat_cube', 72, 73),
        'influence-nephilim-': ('nephilim_cube', 72, 73),
    }
    numbered = {'amulet-location': [('talismaninvestigation'+str(i),128,128) for i in range(1,5)],
                'special-location': [('DuomoSpecialMM',128,128),('RipamontiSpecialMM',128,128)],
                'npc-cult-fanatic': [('cultleader_'+kind,240,240) for kind in ['physical','social','mental','mixed']]}
    for key, variants in numbered.items():
        for i, (name,w,h) in enumerate(variants,1):
            asset = export(f'{key}-{i}-icon', name, w, h)
            if asset: pack['components'].setdefault(f'{key}-{i}', {})['icon'] = asset
    for prefix,(name,w,h) in shared.items():
        asset = export('expansion-'+name.replace('_','-'), name, w, h)
        if asset:
            for expansion in extras['packs']:
                for component in expansion['components']:
                    if component['id'].startswith(prefix):pack['components'].setdefault(component['id'], {})['icon'] = asset
    helicopter = export('npc-military-helicopter-icon','helicopter',256,256)
    if helicopter:pack['components'].setdefault('npc-military-helicopter', {})['icon'] = helicopter
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
    parser.add_argument("--merge", action="store_true", help="Preserve previously exported local assets, including optional accessories")
    args = parser.parse_args()
    source = args.app_data.resolve()
    if not (source / "resources.assets").is_file() or not (source / "sharedassets0.assets").is_file():
        parser.error("Officiële appdata niet gevonden; geef --app-data op.")
    if source == (ROOT / "private/artwork").resolve():
        parser.error("Bron en uitvoer mogen niet hetzelfde zijn.")
    extract(source, merge=args.merge)
