
```java
String message = switch (status) {
    case NEW -> "Not started";
    case DONE -> "Completed";
    case FAILED -> "Needs retry";
};
```