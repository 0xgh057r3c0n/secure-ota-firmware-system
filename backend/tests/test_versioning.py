import unittest

from backend.app.utils.version import generate_release_version, is_newer_version


class VersioningTests(unittest.TestCase):
    def test_newer_release_is_accepted(self):
        self.assertTrue(is_newer_version("20260630.002", "20260630.001"))

    def test_same_release_is_rejected(self):
        self.assertFalse(is_newer_version("20260630.001", "20260630.001"))

    def test_generate_release_version_bumps_build_for_same_day(self):
        version = generate_release_version("20260630.001")
        self.assertEqual(version, "20260630.002")


if __name__ == "__main__":
    unittest.main()
