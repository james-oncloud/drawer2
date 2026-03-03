import json
import unittest
from io import StringIO
from unittest.mock import patch

from sample_app.cli import run


class TestCLI(unittest.TestCase):
    def test_cli_with_text(self) -> None:
        with patch("sys.stdout", new_callable=StringIO) as fake_out:
            exit_code = run(["--text", "a b c"])
        self.assertEqual(exit_code, 0)
        self.assertEqual(
            json.loads(fake_out.getvalue()),
            {"lines": 1, "words": 3, "characters": 5},
        )

    def test_cli_file_not_found(self) -> None:
        with patch("sys.stderr", new_callable=StringIO):
            with self.assertRaises(SystemExit):
                run(["--file", "does-not-exist.txt"])
