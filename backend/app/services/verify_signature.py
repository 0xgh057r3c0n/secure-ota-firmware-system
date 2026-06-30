import os

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEFAULT_PUBLIC_KEY_PATH = os.path.join(REPO_ROOT, "keys", "public.pem")


def _resolve_path(path=None):
    if path is None:
        return DEFAULT_PUBLIC_KEY_PATH

    if os.path.isabs(path):
        return path

    return os.path.abspath(os.path.join(REPO_ROOT, path))


def _load_public_key(public_key_path=None):
    public_key_material = os.getenv("PUBLIC_KEY")
    if public_key_material:
        return serialization.load_pem_public_key(public_key_material.encode("utf-8"))

    public_key_path = _resolve_path(public_key_path)
    with open(public_key_path, "rb") as key_file:
        return serialization.load_pem_public_key(key_file.read())


def verify_signature(file_path, signature_path, public_key_path=None):
    if not os.path.exists(file_path) or not os.path.exists(signature_path):
        return False

    try:
        public_key = _load_public_key(public_key_path)
    except (ValueError, TypeError):
        return False

    with open(file_path, "rb") as firmware_file:
        firmware_data = firmware_file.read()

    with open(signature_path, "rb") as signature_file:
        signature = signature_file.read()

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
