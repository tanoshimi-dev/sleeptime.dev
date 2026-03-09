FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 --ingroup spring spring

COPY --from=builder /app/build/libs/*.jar app.jar

USER spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
