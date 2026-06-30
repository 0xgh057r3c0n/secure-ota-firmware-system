import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import serialization

PRIVATE_KEY_PATH = "keys/private.pem"
PUBLIC_KEY_PATH = "keys/public.pem"


def _ensure_keys():
    # generate a test RSA keypair if not present (development convenience)
    if not os.path.exists(PRIVATE_KEY_PATH):
        os.makedirs(os.path.dirname(PRIVATE_KEY_PATH), exist_ok=True)
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )

        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )

        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(pem)

        pub_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(pub_pem)


def sign_firmware(file_path):
    _ensure_keys()

    with open(PRIVATE_KEY_PATH, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )

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

    return sig_path
