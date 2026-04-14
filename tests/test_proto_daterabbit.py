"""
Tests for DateRabbit proto landing page.
Verifies that the landing page prototype was correctly pushed to Hub DB
and passes all validation checks.
"""
import json
import urllib.request
import unittest
import re

PROJECT = "date-rabbit"
HUB_API = "https://proto.smartlaunchhub.com/hub/api"
PROTO_API = "https://proto.smartlaunchhub.com/api"

def api_get(url, timeout=30):
    resp = urllib.request.urlopen(url, timeout=timeout)
    return json.loads(resp.read())

class TestProtoLandingPage(unittest.TestCase):
    """Test that the landing page prototype exists and is valid."""

    @classmethod
    def setUpClass(cls):
        files = api_get(f"{HUB_API}/files?project={PROJECT}")
        cls.landing = next(
            (f for f in files if f.get("page_id") == "landing"), None
        )

    def test_landing_file_exists_in_hub(self):
        self.assertIsNotNone(self.landing, "Landing page file not found in Hub DB")
        self.assertEqual(self.landing["filename"], "landing.tsx")
        self.assertGreater(
            len(self.landing["content"]), 1000,
            "Landing page content too short",
        )

    def test_landing_has_four_states(self):
        content = self.landing["content"]
        self.assertIn("stateName", content)
        for state in ["DEFAULT", "LOADING", "BOOKING_FORM", "OTP_VERIFICATION"]:
            self.assertIn(
                f'title="{state}"', content, f"Missing {state} state"
            )

    def test_landing_ts_valid(self):
        result = api_get(
            f"{PROTO_API}/validate-ts?project={PROJECT}&pageId=landing"
        )
        self.assertTrue(result.get("valid"), f"TS errors: {result.get('errors')}")
        self.assertEqual(result.get("errorCount"), 0)

    def test_landing_no_emoji(self):
        content = self.landing["content"]
        emoji_pattern = re.compile(
            "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF"
            "\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF"
            "\U00002702-\U000027B0\U0001F900-\U0001F9FF"
            "\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]+",
            flags=re.UNICODE,
        )
        emojis = emoji_pattern.findall(content)
        self.assertEqual(len(emojis), 0, f"Found emoji: {emojis}")

    def test_landing_uses_brand_colors(self):
        content = self.landing["content"]
        self.assertIn("#FF2A5F", content, "Missing primary brand color")
        self.assertIn("#4DF0FF", content, "Missing accent brand color")
        self.assertIn("#F4F0EA", content, "Missing background brand color")

    def test_landing_responsive(self):
        content = self.landing["content"]
        self.assertIn("useWindowDimensions", content)
        self.assertIn("isDesktop", content)

    def test_landing_has_feather_icons(self):
        content = self.landing["content"]
        self.assertIn("@expo/vector-icons", content)
        self.assertIn("Feather", content)

    def test_landing_has_real_images(self):
        content = self.landing["content"]
        self.assertIn("picsum.photos", content)

class TestProtoProjectHealth(unittest.TestCase):
    """Test overall project proto health."""

    @classmethod
    def setUpClass(cls):
        files = api_get(f"{HUB_API}/files?project={PROJECT}")
        cls.page_ids = sorted(
            set(f["page_id"] for f in files if f.get("page_id"))
        )

    def test_all_pages_have_files(self):
        self.assertGreaterEqual(
            len(self.page_ids), 40,
            f"Only {len(self.page_ids)} pages have files, expected 40+",
        )

    def test_all_pages_ts_valid(self):
        failures = []
        for pid in self.page_ids:
            try:
                result = api_get(
                    f"{PROTO_API}/validate-ts?project={PROJECT}&pageId={pid}",
                    timeout=30,
                )
                if result.get("errorCount", 0) > 0:
                    failures.append(f"{pid}: {result['errorCount']} errors")
            except Exception as e:
                failures.append(f"{pid}: request failed ({e})")
        self.assertEqual(
            len(failures), 0,
            "TS validation failures:\n" + "\n".join(failures),
        )

if __name__ == "__main__":
    unittest.main()
