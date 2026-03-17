# Java Review: String / Char / Number Array Conversions

Quick reference for common Java conversions with multiple approaches.

## 1) String to `char[]`

### A. `toCharArray()` (most common)

```java
String s = "Hello";
char[] chars = s.toCharArray();
```

- Simple and fast for most cases.

### B. Using `charAt()` in a loop

```java
String s = "Hello";
char[] chars = new char[s.length()];
for (int i = 0; i < s.length(); i++) {
    chars[i] = s.charAt(i);
}
```

- Useful if you need custom logic while copying.

### C. Stream approach (not ideal for performance)

```java
String s = "Hello";
char[] chars = s.chars()
    .mapToObj(c -> (char) c)
    .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
    .toString()
    .toCharArray();
```

- Works, but `toCharArray()` is usually better.

---

## 2) `char[]` back to String

### A. `new String(char[])`

```java
char[] chars = {'H', 'e', 'l', 'l', 'o'};
String s = new String(chars);
```

### B. `String.valueOf(char[])`

```java
char[] chars = {'H', 'e', 'l', 'l', 'o'};
String s = String.valueOf(chars);
```

Both are common and readable.

---

## 3) `char[]` to `List<Character>`

### A. Loop (recommended)

```java
char[] chars = {'a', 'b', 'c'};
List<Character> list = new ArrayList<>(chars.length);
for (char c : chars) {
    list.add(c);
}
```

### B. `IntStream` + boxing

```java
char[] chars = {'a', 'b', 'c'};
List<Character> list = java.util.stream.IntStream.range(0, chars.length)
    .mapToObj(i -> chars[i]) // auto-boxes char -> Character
    .toList();
```

Note: `Arrays.asList(chars)` does **not** produce `List<Character>` for primitive `char[]`.

---

## 4) `List<Character>` to `char[]`

### A. Loop (recommended)

```java
List<Character> list = List.of('a', 'b', 'c');
char[] chars = new char[list.size()];
for (int i = 0; i < list.size(); i++) {
    chars[i] = list.get(i);
}
```

### B. Through `StringBuilder`

```java
List<Character> list = List.of('a', 'b', 'c');
StringBuilder sb = new StringBuilder(list.size());
for (char c : list) {
    sb.append(c);
}
char[] chars = sb.toString().toCharArray();
```

---

## 5) Numeric String to `int[]`

This can mean two different things:

1. `"12345"` -> `[1,2,3,4,5]` (digits)
2. `"10 20 30"` or `"10,20,30"` -> `[10,20,30]` (tokens)

### A. Digits string to `int[]`

```java
String s = "12345";
int[] arr = s.chars()
    .map(c -> c - '0')
    .toArray();
```

Safer version with validation:

```java
String s = "12345";
if (!s.matches("\\d+")) {
    throw new IllegalArgumentException("Only digits allowed");
}
int[] arr = s.chars().map(c -> c - '0').toArray();
```

### B. Delimited numbers to `int[]`

```java
String s = "10,20,30";
int[] arr = java.util.Arrays.stream(s.split(","))
    .map(String::trim)
    .mapToInt(Integer::parseInt)
    .toArray();
```

Whitespace-separated:

```java
String s = "10  20   30";
int[] arr = java.util.Arrays.stream(s.trim().split("\\s+"))
    .mapToInt(Integer::parseInt)
    .toArray();
```

---

## 6) `int[]` back to String

### A. Digits array to compact string

```java
int[] digits = {1, 2, 3, 4, 5};
String s = java.util.Arrays.stream(digits)
    .mapToObj(String::valueOf)
    .collect(java.util.stream.Collectors.joining());
// "12345"
```

### B. General int array to delimited string

```java
int[] nums = {10, 20, 30};
String csv = java.util.Arrays.stream(nums)
    .mapToObj(String::valueOf)
    .collect(java.util.stream.Collectors.joining(","));
// "10,20,30"
```

---

## 7) String to `List<Character>` and back

### String -> `List<Character>`

```java
String s = "hello";
List<Character> chars = s.chars()
    .mapToObj(c -> (char) c)
    .toList();
```

### `List<Character>` -> String

```java
List<Character> chars = List.of('h', 'e', 'l', 'l', 'o');
StringBuilder sb = new StringBuilder(chars.size());
for (char c : chars) {
    sb.append(c);
}
String s = sb.toString();
```

---

## 8) Quick pitfalls

- `Arrays.asList(charArray)` is not a `List<Character>` for primitive arrays.
- `String.split("")` can behave unexpectedly for Unicode and empties; use `toCharArray()` for simple char work.
- `char` is UTF-16 code unit, not always a full Unicode code point (emoji can need 2 chars).
- Always trim tokens when parsing delimited numbers.
- Validate input before `Integer.parseInt` if user input may be dirty.

---

## 9) Interview-style mini examples

### Reverse a String

```java
String s = "drawer";
char[] a = s.toCharArray();
for (int l = 0, r = a.length - 1; l < r; l++, r--) {
    char tmp = a[l];
    a[l] = a[r];
    a[r] = tmp;
}
String reversed = new String(a);
```

### Sum digits in a numeric String

```java
String s = "9381";
int sum = s.chars()
    .map(c -> c - '0')
    .sum();
```

### Parse signed integer list

```java
String s = "-1, 20, -300, 4";
int[] nums = java.util.Arrays.stream(s.split(","))
    .map(String::trim)
    .mapToInt(Integer::parseInt)
    .toArray();
```
