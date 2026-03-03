# Sample Python 3 Project

A complete Python 3 starter project using:

- `src/` package layout
- CLI entrypoint
- test suite
- linting and type-checking setup

## Project Structure

```
sample/
├── pyproject.toml
├── README.md
├── Makefile
├── .gitignore
├── src/
│   └── sample_app/
│       ├── __init__.py
│       ├── cli.py
│       └── core.py
└── tests/
    ├── test_cli.py
    └── test_core.py
```

## Quick Start

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
pip install -e ".[dev]"
```

## What Is `pip`?

`pip` is Python's package installer. The name is commonly expanded as **"Pip Installs Packages."**

In the Quick Start commands:

- `python -m pip install --upgrade pip` updates `pip` itself inside your virtual environment.
- `pip install -e .` installs this project in editable mode, so code changes are picked up without reinstalling.
- `pip install -e ".[dev]"` installs the optional `dev` extras from `pyproject.toml` (tools like linting/type-checking dependencies).

## How Package Install Works With `pip`

When you run `pip install <package>`:

1. `pip` checks package indexes (usually PyPI) for a matching package/version.
2. It resolves dependencies listed by that package.
3. It downloads wheels (preferred) or source distributions.
4. It installs files into your current Python environment (your `.venv` here).
5. It records installed package metadata so upgrades/removals work later.

For this project, `pip install -e .` is special:

- `-e` means **editable install**.
- Instead of copying your package code into site-packages, `pip` links the environment to your local project directory.
- Changes you make under `src/sample_app/` are immediately used the next time you run Python, without reinstalling.

## Why `PYTHONPATH=src`?

This project uses a `src/` layout, so the package code lives in `src/sample_app` instead of the repo root.

- `PYTHONPATH=src` tells Python to include the `src/` directory when importing modules.
- It is useful for local runs without installing the package first.
- If you already ran `pip install -e .`, you can usually skip `PYTHONPATH=src`.

Run the CLI:

```bash
# Works even without installation:
PYTHONPATH=src python -m sample_app.cli --text "Hello world from Python"
PYTHONPATH=src python -m sample_app.cli --file README.md

# After pip install -e .:
sample --text "Hello world from Python"
```

Run tests:

```bash
PYTHONPATH=src python -m unittest discover -s tests -v
```

Run quality checks:

```bash
ruff check .
mypy src
```

## What This App Does

The CLI computes basic text statistics:

- lines
- words
- characters

Example output:

```json
{
  "lines": 1,
  "words": 4,
  "characters": 23
}
```

## License

MIT
