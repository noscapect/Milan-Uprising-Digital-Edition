"""Export a module's exact texture selection from a downloaded, verified client ZIP.

Never execute/install the game. Only selected unencrypted Unity resource files are
temporarily unpacked. No SDK, stories, audio or executable files are exported.
"""
from contextlib import contextmanager
import argparse
import base64
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import tempfile
import zipfile
import UnityPy


@contextmanager
def unity_environment(path):
    environment = UnityPy.load(str(path))
    try:
        yield environment
    finally:
        # UnityPy keeps resource streams in cyclic object graphs on Windows.
        for item in list(environment.files.values()) + list(environment.cabs.values()):
            reader = getattr(item, 'reader', item)
            stream = getattr(reader, 'stream', None)
            if stream is not None:
                stream.close()


def extract(archive, recipe, destination):
    if recipe.get('schemaVersion') != 1 or not re.fullmatch(r'[a-z0-9-]+', recipe.get('gameId', '')):
        raise ValueError('Unsupported artwork recipe')
    if not 1 <= len(recipe['assets']) <= 256:
        raise ValueError('Invalid artwork selection')
    required = {asset['sourceFile'] for asset in recipe['assets'].values()}
    if any(not re.fullmatch(r'[A-Za-z0-9_.-]+\.assets', name) for name in required):
        raise ValueError('Unsafe Unity resource name')
    # The Node parent performs a verified cleanup after this process exits too;
    # Windows resource handles in third-party object graphs can outlive `env`.
    with tempfile.TemporaryDirectory(prefix='tce-unity-', dir=archive.parent, ignore_cleanup_errors=True) as folder:
        work = Path(folder).resolve()
        work.relative_to(archive.parent.resolve())  # Cleanup stays inside our own staging directory.
        with zipfile.ZipFile(archive) as client:
            found = set()
            for entry in client.infolist():
                name = Path(entry.filename.replace('\\', '/')).name
                if name not in required and not any(name == resource + '.resS' or name == resource + '.resource' for resource in required):
                    continue
                if name in found or entry.file_size > 2 * 1024**3:
                    raise ValueError('Ambiguous or oversized Unity resource')
                found.add(name)
                with client.open(entry) as source, (work / name).open('wb') as target:
                    shutil.copyfileobj(source, target)
            if not required <= found:
                raise ValueError('The client does not contain the expected Unity resources')
        images, assets = {}, {}
        for resource in sorted(required):
            with unity_environment(work / resource) as env:
                selection = {item['pathId']: (key, item) for key, item in recipe['assets'].items() if item['sourceFile'] == resource}
                for obj in env.objects:
                    if obj.path_id not in selection:
                        continue
                    key, expected = selection[obj.path_id]
                    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,80}', key) or obj.type.name != expected.get('type', 'Texture2D') or obj.type.name not in ('Texture2D', 'Sprite'):
                        raise ValueError('Invalid selected texture: ' + key + ' (' + obj.type.name + ')')
                    texture = obj.read()
                    if texture.m_Name != expected['textureName']:
                        raise ValueError('The client texture selection has changed: ' + key)
                    image = texture.image
                    if image.size != (expected['width'], expected['height']):
                        raise ValueError('The client image dimensions have changed: ' + key)
                    stream = io.BytesIO()
                    image.save(stream, format='PNG')
                    data = stream.getvalue()
                    images[key] = base64.b64encode(data).decode('ascii')
                    assets[key] = {'file': key + '.png', 'sha256': hashlib.sha256(data).hexdigest()}
        if set(assets) != set(recipe['assets']):
            raise ValueError('Not all required artwork could be extracted')
        manifest = {'format': 'tabletop-local-artwork', 'schemaVersion': 1, 'gameId': recipe['gameId'], 'assets': assets, **recipe['bindings']}
        if manifest.get('branding', {}).get('map') not in assets:
            raise ValueError('Missing game map')
        with gzip.open(destination, 'wt', encoding='utf8', compresslevel=9) as output:
            json.dump({'format': 'tce-artwork-bundle', 'version': 1, 'manifest': manifest, 'images': images}, output, separators=(',', ':'))
        print(json.dumps({'images': len(images), 'gameId': recipe['gameId']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--zip', type=Path, required=True)
    parser.add_argument('--recipe', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    options = parser.parse_args()
    extract(options.zip.resolve(), json.loads(options.recipe.read_text(encoding='utf8')), options.output.resolve())
