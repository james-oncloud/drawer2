# Stage 1: build the fat JAR with Maven (needs JDK + Maven toolchain).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy POM first so dependency downloads are cached when only source changes.
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q package -DskipTests

# Stage 2: minimal runtime image (JRE only — no Maven or JDK).
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/monitoring-demo-1.0.0.jar app.jar

# Matches App.java HTTP server port; published by docker-compose.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
