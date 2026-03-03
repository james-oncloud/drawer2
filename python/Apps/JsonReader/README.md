# JsonReader (Python 3)

Small, clean Python app that reads a Missive-style JSON export using a generator.

## Why this design

- **Single responsibility:** each module has one clear purpose.
- **Domain model:** message structure is represented by a typed dataclass.
- **Streaming parser:** reads a JSON array incrementally, so large files are handled efficiently.
- **Thin CLI:** argument parsing and output are isolated from business logic.

## Project layout

- `main.py` - executable entry point
- `src/json_reader/models.py` - domain entities
- `src/json_reader/streaming.py` - generator-based JSON array streaming
- `src/json_reader/missive_reader.py` - Missive adapter
- `src/json_reader/service.py` - application service/statistics
- `data/sample_missive.json` - sample input file

## Compile and Run

From the project root:

```bash
cd /Users/jamesking/work/drawer2/python/Apps/JsonReader
```

Optional: create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Compile check (verifies Python syntax):

```bash
python3 -m compileall src main.py
```

Run with the sample file:

```bash
PYTHONPATH=src python3 main.py data/sample_missive.json
```

Run with a custom message limit:

```bash
PYTHONPATH=src python3 main.py data/sample_missive.json --limit 2
```

