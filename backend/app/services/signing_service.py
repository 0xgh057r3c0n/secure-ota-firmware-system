import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import serialization

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEFAULT_PRIVATE_KEY_PATH = os.path.join(REPO_ROOT, "keys", "private.pem")
DEFAULT_PUBLIC_KEY_PATH = os.path.join(REPO_ROOT, "keys", "public.pem")


def _resolve_path(path, default_path):
    if path is None:
        return default_path

    if os.path.isabs(path):
        return path

    return os.path.abspath(os.path.join(REPO_ROOT, path))


def _ensure_keys(private_key_path=None, public_key_path=None):
    if os.getenv("PRIVATE_KEY") or os.getenv("PUBLIC_KEY"):
        return None, None

    private_key_path = _resolve_path(private_key_path, DEFAULT_PRIVATE_KEY_PATH)
    public_key_path = _resolve_path(public_key_path, DEFAULT_PUBLIC_KEY_PATH)

    if os.path.exists(private_key_path) and os.path.exists(public_key_path):
        return private_key_path, public_key_path

    os.makedirs(os.path.dirname(private_key_path), exist_ok=True)
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )

    with open(private_key_path, "wb") as f:
        f.write(pem)

    pub_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    with open(public_key_path, "wb") as f:
        f.write(pub_pem)

    return private_key_path, public_key_path


def _load_private_key(private_key_path=None):
    private_key_material = os.getenv("PRIVATE_KEY")
    if private_key_material:
        return serialization.load_pem_private_key(
            private_key_material.encode("utf-8"),
            password=None
        )

    private_key_path = _resolve_path(private_key_path, DEFAULT_PRIVATE_KEY_PATH)
    with open(private_key_path, "rb") as key_file:
        return serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )


def sign_firmware(file_path, private_key_path=None, public_key_path=None):
    private_key_path, public_key_path = _ensure_keys(private_key_path, public_key_path)
    private_key = _load_private_key(private_key_path)

    with open(file_path, "rb") as f:
        data = f.read()

    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    sig_path = file_path + ".sig"

    with open(sig_path, "wb") as f:
        f.write(signature)

    if os.getenv("PUBLIC_KEY") and public_key_path:
        public_key_path = _resolve_path(public_key_path, DEFAULT_PUBLIC_KEY_PATH)
        os.makedirs(os.path.dirname(public_key_path), exist_ok=True)
        public_key = private_key.public_key()
        pub_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open(public_key_path, "wb") as f:
            f.write(pub_pem)

    return sig_path
