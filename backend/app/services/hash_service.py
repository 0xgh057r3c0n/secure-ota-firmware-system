import hashlib


def calculate_sha256(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:

        while chunk := f.read(4096):
            sha256.update(chunk)

    return sha256.hexdigest()


def verify_hash(file_path, expected_hash):   

    actual_hash = calculate_sha256(file_path)

    return actual_hash == expected_hash
