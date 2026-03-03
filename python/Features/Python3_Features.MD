# Python 3 Features

This document lists major Python 3 features and language/runtime improvements from Python 3.0 through modern releases.

## Core Language Changes in Python 3.0

- `print` is a function: `print(...)`
- Text model split:
  - `str` = Unicode text
  - `bytes` = binary data
- Integer unification: no separate `long` type
- True division by default: `5 / 2 == 2.5`, floor division with `//`
- Iterators returned by many built-ins (`range`, `map`, `filter`, `zip`)
- Dictionary view objects (`dict.keys()`, `dict.items()`, `dict.values()`)
- New exception syntax: `except Exception as e`
- Removal of old Python 2 syntax (`<>`, old `print` statement, etc.)
- Reorganized standard library

## Syntax and Language Features (Python 3.x)

- Function annotations
- Keyword-only arguments
- Extended iterable unpacking
- `nonlocal` statement
- Set and dict comprehensions
- F-strings for string interpolation
- Async/await syntax for asynchronous programming
- Type hinting support (`typing` module)
- Positional-only parameters (`/`)
- Assignment expressions (walrus operator `:=`)
- Structural pattern matching (`match` / `case`)
- Parenthesized context managers
- Exception groups and `except*`
- Precise error locations and clearer tracebacks

## Data Model and Built-ins

- `range` object (lazy, efficient sequence)
- Ordered `dict` insertion behavior guaranteed by language spec
- `memoryview` improvements
- Richer `pathlib` for object-oriented filesystem paths
- `enum` module for enumerations
- `dataclasses` for boilerplate-free classes
- `collections` enhancements (`ChainMap`, `Counter`, `deque` improvements)
- `functools` improvements (`lru_cache`, `cached_property`, `singledispatch`)

## Functional and Iteration Improvements

- `yield from` for generator delegation
- Generator return values and enhanced coroutine semantics
- New itertools additions and performance improvements
- `zip(..., strict=True)` to enforce equal lengths
- `anext()` and `aiter()` for async iteration

## Async and Concurrency

- `asyncio` framework in stdlib
- `async def`, `await`, async context managers, async iterators
- Task groups (`asyncio.TaskGroup`)
- High-level async APIs and improved event loop tools
- Concurrent futures and multiprocessing improvements

## Typing and Static Analysis Support

- Type hint syntax (`x: int`, `-> str`)
- `typing` module ecosystem:
  - `Optional`, `Union`, `Literal`, `Final`, `TypedDict`, `Protocol`
  - `TypeVar`, generics, overloads
- Postponed/modernized annotation behaviors across versions
- Built-in generic types (`list[int]`, `dict[str, int]`)
- `Self` type and advanced typing utilities

## Error Handling and Debugging

- Exception chaining (`raise ... from ...`)
- Better `SyntaxError` and `TypeError` messages
- Traceback enhancements with exact expression spans
- `breakpoint()` built-in
- Exception groups (`ExceptionGroup`) and parallel error handling

## Security and Runtime Improvements

- Hash randomization enabled by default
- SSL/TLS defaults and certificate handling improvements
- Startup/runtime performance enhancements in multiple releases
- Bytecode/interpreter optimizations
- Ongoing memory management improvements

## Standard Library Additions and Notable Modules

- `pathlib`
- `venv`
- `asyncio`
- `concurrent.futures`
- `ipaddress`
- `statistics`
- `secrets`
- `dataclasses`
- `zoneinfo`
- `tomllib`

## Packaging, Tooling, and Developer Experience

- `venv` for virtual environments
- `pip` ecosystem became standard workflow
- `pyproject.toml` packaging standards (PEP 517/518/621 ecosystem)
- Improved REPL and developer diagnostics
- Better Unicode handling throughout stdlib
- Cross-platform consistency improvements

## Version-by-Version Highlights

### Python 3.3

- `yield from`
- `venv`
- Improved Unicode and I/O behavior

### Python 3.4

- `asyncio` introduced
- `pathlib` added
- `enum` module added

### Python 3.5

- `async` / `await` syntax
- Type hints (PEP 484)

### Python 3.6

- F-strings
- Underscores in numeric literals
- `secrets` module

### Python 3.7

- `dataclasses`
- `breakpoint()`
- Dict insertion order guaranteed

### Python 3.8

- Walrus operator `:=`
- Positional-only parameters (`/`)

### Python 3.9

- Built-in generic types (`list[int]`)
- Dictionary merge operators (`|`, `|=`)
- `zoneinfo` groundwork expanded in later versions

### Python 3.10

- Structural pattern matching (`match` / `case`)
- Better error messages
- `X | Y` union type syntax

### Python 3.11

- Major performance gains
- Exception groups and `except*`
- Fine-grained error locations in tracebacks

### Python 3.12

- Continued performance and typing improvements
- Better f-string parsing and diagnostics

### Python 3.13+

- Ongoing interpreter speedups and quality-of-life updates
- Continued typing and error-reporting enhancements

---

If you want, this file can be expanded into a **truly exhaustive PEP-indexed list** (feature -> PEP -> version -> short example).
