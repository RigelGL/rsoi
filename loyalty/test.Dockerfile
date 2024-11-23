FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app
COPY pom.xml .

RUN apt-get update && apt-get install -y maven && mvn dependency:go-offline
COPY src .

RUN mvn test