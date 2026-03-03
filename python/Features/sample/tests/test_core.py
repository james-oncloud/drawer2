import tempfile
import unittest
from pathlib import Path

from sample_app.core import TextStats, analyze_file, analyze_text


class TestCore(unittest.TestCase):
    def test_analyze_text_empty(self) -> None:
        self.assertEqual(analyze_text(""), TextStats(lines=0, words=0, characters=0))

    def test_analyze_text_content(self) -> None:
        stats = analyze_text("Hello world\nfrom Python")
        self.assertEqual(stats.lines, 2)
        self.assertEqual(stats.words, 4)
        self.assertEqual(stats.characters, 23)

    def test_analyze_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            file_path = Path(tmp_dir) / "sample.txt"
            file_path.write_text("one two\nthree", encoding="utf-8")
            stats = analyze_file(file_path)
        self.assertEqual(stats.lines, 2)
        self.assertEqual(stats.words, 3)
