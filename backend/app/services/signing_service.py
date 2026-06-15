from cryptography.hazmat.primitives import hashes

from cryptography.hazmat.primitives.asymmetric import padding

from cryptography.hazmat.primitives import serialization


PRIVATE_KEY_PATH = "keys/private.pem"


def sign_firmware(file_path):

    with open(
        PRIVATE_KEY_PATH,
        "rb"
    ) as key_file:

        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )

    with open(file_path, "rb") as f:
        data = f.read()

    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(
                hashes.SHA256()
            ),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    sig_path = file_path + ".sig"

    with open(sig_path, "wb") as f:
        f.write(signature)

    return sig_path
