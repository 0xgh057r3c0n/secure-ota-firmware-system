import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from backend.app.services import signing_service
from backend.app.services.signing_service import sign_firmware
from backend.app.services.verify_signature import verify_signature


class VerifySignatureTests(unittest.TestCase):
    def test_verify_signature_accepts_valid_signature(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "firmware.bin"
            file_path.write_bytes(b"firmware payload")

            signature_path = sign_firmware(str(file_path))

            self.assertTrue(os.path.exists(signature_path))
            self.assertTrue(verify_signature(str(file_path), signature_path))

    def test_sign_firmware_uses_environment_keys_without_writing_local_key_files(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            private_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            ).decode("utf-8")
            public_pem = private_key.public_key().public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ).decode("utf-8")

            file_path = Path(tmpdir) / "firmware.bin"
            file_path.write_bytes(b"firmware payload")

            with patch.dict(os.environ, {"PRIVATE_KEY": private_pem, "PUBLIC_KEY": public_pem}, clear=False):
                with patch.object(signing_service, "DEFAULT_PRIVATE_KEY_PATH", str(Path(tmpdir) / "private.pem")), patch.object(signing_service, "DEFAULT_PUBLIC_KEY_PATH", str(Path(tmpdir) / "public.pem")):
                    signature_path = sign_firmware(str(file_path))

            self.assertTrue(os.path.exists(signature_path))
            self.assertFalse(os.path.exists(Path(tmpdir) / "private.pem"))
            self.assertFalse(os.path.exists(Path(tmpdir) / "public.pem"))


if __name__ == "__main__":
    unittest.main()
