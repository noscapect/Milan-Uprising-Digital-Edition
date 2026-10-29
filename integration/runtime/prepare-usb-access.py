"""Grant the current Linux user access to one explicitly assigned USB radio."""
import os
import re
import sys
from pathlib import Path

def prepare_access(vid_pid, user_id, sys_root=Path('/sys/bus/usb/devices'), device_root=Path('/dev/bus/usb'), chown=None, chmod=None):
    if not re.fullmatch(r"[0-9a-fA-F]{4}:[0-9a-fA-F]{4}", vid_pid) or not user_id.isdigit():
        raise ValueError("Invalid selected adapter or Linux user")
    vendor, product = vid_pid.lower().split(":")
    matches = []
    for device in sys_root.iterdir():
        try:
            if (device/'idVendor').read_text().strip() == vendor and (device/'idProduct').read_text().strip() == product:
                matches.append(device)
        except FileNotFoundError:
            pass
    if len(matches) != 1:
        raise RuntimeError("The selected radio is not unique in WSL; no device permissions changed")
    device = matches[0]
    node = device_root/f"{int((device/'busnum').read_text()):03d}"/f"{int((device/'devnum').read_text()):03d}"
    (chown or os.chown)(node, int(user_id), -1)
    (chmod or os.chmod)(node, 0o600)

if __name__ == '__main__':
    prepare_access(*sys.argv[1:])
