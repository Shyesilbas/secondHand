# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml to download dependencies and cache them
COPY pom.xml .

# Download dependencies (this step will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application package, skipping tests for speed
RUN mvn clean package -DskipTests -B

# Stage 2: Production runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-privileged system user for running the application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built JAR file from the builder stage
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

# Expose port 8080 (Spring Boot default port)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
