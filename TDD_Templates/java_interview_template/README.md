# Java Maven Starter

A very basic Java project using Maven, with:

- one small implementation (`GreetingService`)
- one app entry point (`Main`)
- unit tests with JUnit 5

## Project Structure

```
java-interview-template/
├── pom.xml
├── src/
│   ├── main/java/com/example/app/
│   │   ├── Main.java
│   │   └── GreetingService.java
│   └── test/java/com/example/app/
│       └── GreetingServiceTest.java
└── README.md
```

## Prerequisites

- Java 17+ installed
- Maven 3.9+ installed

## Build and Test

From the project root:

```bash
mvn clean test
```

## Run the App

Run with default input:

```bash
mvn exec:java -Dexec.mainClass="com.example.app.Main"
```

Run with a custom name:

```bash
mvn exec:java -Dexec.mainClass="com.example.app.Main" -Dexec.args="Taylor"
```

Expected output examples:

- `Hello, stranger!`
- `Hello, Taylor!`

## Typical Details

- **Language level:** Java 17 by default (`java.version=17`)
- **How to switch to Java 21:** set `java.version` to `21` in `pom.xml` (or run with `-Djava.version=21`)
- **Test framework:** JUnit Jupiter (JUnit 5)
- **Build tool:** Maven
- **Packaging:** Jar (default Maven behavior)

## Notes

- This project is intentionally minimal for interview prep and quick experiments.
- You can extend `GreetingService` and add more tests as practice tasks.
