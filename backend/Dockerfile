
# Stage 1: build the jar with Gradle
FROM gradle:8-jdk17 AS builder
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .
# Use Gradle wrapper if present, otherwise gradle installed in image
RUN gradle bootJar --no-daemon -x test

# Stage 2: run the app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]