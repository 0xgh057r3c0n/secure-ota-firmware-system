import argparse
import hashlib
import os
import shutil
import sys
import urllib.request
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature


def download_artifact(url, destination):
    urllib.request.urlretrieve(url, destination)


def calculate_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def verify_signature(file_path, signature_path, public_key_path):
    with open(file_path, "rb") as firmware_file:
        firmware_data = firmware_file.read()
    with open(signature_path, "rb") as signature_file:
        signature = signature_file.read()
    with open(public_key_path, "rb") as key_file:
        public_key = serialization.load_pem_public_key(key_file.read())

    try:
        public_key.verify(
            signature,
            firmware_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )
    except (InvalidSignature, ValueError, TypeError):
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description='Simulated OTA edge verification agent')
    parser.add_argument('--firmware-url', required=True)
    parser.add_argument('--signature-url', required=True)
    parser.add_argument('--public-key', required=True)
    parser.add_argument('--workdir', default='edge_artifacts')
    args = parser.parse_args()

    workdir = Path(args.workdir)
    workdir.mkdir(parents=True, exist_ok=True)

    firmware_path = workdir / 'firmware.bin'
    signature_path = workdir / 'firmware.bin.sig'

    download_artifact(args.firmware_url, firmware_path)
    download_artifact(args.signature_url, signature_path)

    if not verify_signature(firmware_path, signature_path, args.public_key):
        print('CRITICAL: signature verification failed')
        sys.exit(1)

    file_hash = calculate_hash(firmware_path)
    print(f'Verified firmware hash: {file_hash}')
    print('Mock reboot and installation accepted')


if __name__ == '__main__':
    main()
