# Python Cheatsheet for Java Developers

This is a quick, practical reference for Java developers switching to Python.
It focuses on syntax and key differences.

## Quick mapping

- `System.out.println(...)` → `print(...)`
- `public static void main` → `if __name__ == "__main__":`
- `new Class()` → `Class()`
- `null` → `None`
- `this` → `self`
- `true/false` → `True/False`

## Files, modules, packages

- A `.py` file is a module.
- A folder is a package when it contains `__init__.py`.
- Import syntax: `import module` or `from module import name`.

## Variables and types

Python is dynamically typed but supports optional type hints.

```python
x = 10
name: str = "Ada"
price: float = 19.95
```

No `int`, `String`, `double` declarations unless you add type hints.

## Conditionals

```python
if x > 10:
    print("big")
elif x == 10:
    print("ten")
else:
    print("small")
```

No parentheses required, and indentation defines scope.

## Loops

```python
for i in range(3):
    print(i)

while x < 5:
    x += 1
```

No `for (int i=0; i<...; i++)` style loop.

## Functions

```python
def add(a: int, b: int) -> int:
    return a + b
```

No method overloading. Use default args or `*args`.

## Classes

```python
class User:
    def __init__(self, name: str):
        self.name = name

    def greet(self) -> str:
        return f"Hi {self.name}"
```

- `__init__` is the constructor.
- Always include `self` as first parameter.
- No `public/private` keywords (use `_name` by convention).

## Interfaces / abstract classes

Use `abc` for abstract base classes.

```python
from abc import ABC, abstractmethod

class Repo(ABC):
    @abstractmethod
    def save(self, item): ...
```

## Exceptions

```python
try:
    risky()
except ValueError as exc:
    print(exc)
finally:
    cleanup()
```

- `throw` → `raise`
- Exceptions are unchecked by default.

## Collections

```python
numbers = [1, 2, 3]          # list
unique = {1, 2, 3}           # set
user = {"name": "Ada"}       # dict
pair = ("a", "b")            # tuple (immutable)
```

List comprehension replaces many loops:

```python
evens = [n for n in numbers if n % 2 == 0]
```

## Strings

```python
name = "Ada"
msg = f"Hello {name}"  # f-string
```

Strings are immutable like Java.

## Null checks

```python
if value is None:
    ...
```

Use `is` for `None` and identity checks.

## Boolean operators

- `and`, `or`, `not`
- `==` for equality, `is` for identity

## Collections vs Java

- `list` ≈ `ArrayList`
- `dict` ≈ `HashMap`
- `set` ≈ `HashSet`

## File I/O

```python
with open("data.txt", "r") as f:
    content = f.read()
```

The `with` block auto-closes the file (like try-with-resources).

## Date/time

```python
from datetime import datetime, timezone

now = datetime.now(timezone.utc)
```

## Async vs threads

- `async def` defines a coroutine.
- `await` pauses until completion.
- Async is for I/O, not CPU-heavy tasks.

## Packaging and dependencies

- Java: Maven/Gradle
- Python: pip + requirements.txt or Poetry

## Testing

- Java: JUnit
- Python: pytest

## Common pitfalls (Java devs)

- Indentation is syntax.
- Everything is an object, even numbers.
- Mutability: lists/dicts are mutable.
- Default args are evaluated once.
- No method overloading.

## Advanced Python concepts

- Context managers (`with`, custom `__enter__`/`__exit__`)
- Decorators (function/class wrapping)
- Generators and `yield`
- Iterators and the iterator protocol (`__iter__`, `__next__`)
- Async/await and event loops (`asyncio`)
- Metaclasses and class customization
- Descriptors (`@property`, `__get__`, `__set__`)
- `dataclasses` and immutability patterns
- Type system features: `Protocol`, `TypedDict`, `Literal`, `TypeVar`
- Multiple inheritance and MRO
- Monkey patching and dynamic attributes

## Check your understanding

1. How do you write the Python equivalent of `public static void main`?
2. What is the Python keyword for `null`?
3. How do you declare a function with type hints in Python?
4. What replaces Java’s `for (int i=0; i<...; i++)` loop?
5. How do you define a class constructor in Python?
6. What does `self` represent in a class method?
7. How do you raise an exception in Python?
8. What’s the difference between `==` and `is`?
9. How do you create a dictionary and a set?
10. What does `with open(...)` do for file handling?
11. How do you check for `None` safely?
12. What is the Python equivalent of a Java `HashMap`?
13. What is a list comprehension, and when would you use it?
14. Why can default function arguments be surprising?
15. How do you run async code in Python (keywords)?
