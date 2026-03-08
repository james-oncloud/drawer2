# Advanced Python Concepts with Examples

This file explains advanced Python concepts referenced in the cheatsheet, with
short code examples.

## Context managers

Manage resources with `with` blocks. Custom context managers define
`__enter__` and `__exit__`.

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc, tb):
        import time
        self.elapsed = time.time() - self.start

with Timer() as t:
    sum(range(100000))
print(t.elapsed)
```

## Decorators

Wrap a function to add behavior without changing its code.

```python
def log_call(fn):
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@log_call
def add(a, b):
    return a + b
```

## Generators and yield

Lazy sequences that produce values on demand.

```python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in count_up_to(3):
    print(x)
```

## Iterators and the iterator protocol

Objects implement `__iter__` and `__next__`.

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value
```

## Async/await and event loops

Async code uses `async def` and `await` for I/O concurrency.

```python
import asyncio

async def fetch():
    await asyncio.sleep(0.1)
    return "done"

async def main():
    result = await fetch()
    print(result)

asyncio.run(main())
```

## Metaclasses

Customize class creation. Use sparingly.

```python
class UpperAttrs(type):
    def __new__(mcls, name, bases, ns):
        ns = {k.upper(): v for k, v in ns.items()}
        return super().__new__(mcls, name, bases, ns)

class MyClass(metaclass=UpperAttrs):
    value = 1

print(MyClass.VALUE)  # 1
```

## Descriptors and @property

Descriptors customize attribute access. `@property` is the common form.

```python
class User:
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not value:
            raise ValueError("name required")
        self._name = value
```

## Dataclasses and immutability

`dataclass` reduces boilerplate; `frozen=True` makes fields immutable.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int
```

## Type system features

Use typing helpers for stricter contracts.

```python
from typing import Protocol, TypedDict, Literal, TypeVar

class Writer(Protocol):
    def write(self, msg: str) -> None: ...

class UserDict(TypedDict):
    id: int
    name: str

Mode = Literal["r", "w"]

T = TypeVar("T")
def first(items: list[T]) -> T:
    return items[0]
```

## Multiple inheritance and MRO

Python resolves methods using the method resolution order (MRO).

```python
class A:
    def hello(self): return "A"

class B(A):
    def hello(self): return "B"

class C(A):
    def hello(self): return "C"

class D(B, C):
    pass

print(D().hello())  # "B"
```

## Monkey patching and dynamic attributes

Modify objects at runtime (powerful but risky).

```python
class Greeter:
    def greet(self):
        return "hi"

g = Greeter()
g.greet = lambda: "patched"
print(g.greet())
```
