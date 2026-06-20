def version_tuple(version: str):
    return tuple(
        int(x)
        for x in version.split(".")
    )
