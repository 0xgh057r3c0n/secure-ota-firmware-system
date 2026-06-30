import re


_VERSION_PATTERN = re.compile(r"^(?P<date>\d{8})\.(?P<build>\d{3})$")


def version_tuple(version: str):
    match = _VERSION_PATTERN.fullmatch(version.strip())
    if not match:
        raise ValueError("version must use YYYYMMDD.BBB format")

    return (
        int(match.group("date")),
        int(match.group("build")),
    )


def is_newer_version(candidate: str, current: str) -> bool:
    return version_tuple(candidate) > version_tuple(current)


def generate_release_version(current_version: str | None = None):
    if current_version is None:
        current_version = "19700101.001"

    match = _VERSION_PATTERN.fullmatch(current_version.strip())
    if not match:
        raise ValueError("current_version must use YYYYMMDD.BBB format")

    date = match.group("date")
    build = int(match.group("build")) + 1
    return f"{date}.{build:03d}"
