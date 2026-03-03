.PHONY: install test lint typecheck check run

install:
	python -m pip install --upgrade pip
	pip install -e .
	pip install -e ".[dev]"

test:
	PYTHONPATH=src python -m unittest discover -s tests -v

lint:
	ruff check .

typecheck:
	mypy src

check: lint typecheck test

run:
	PYTHONPATH=src python -m sample_app.cli --text "Hello from sample project"
