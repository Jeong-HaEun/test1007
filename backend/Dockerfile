# Render 배포용. Render 가 이 파일을 읽어 빌드·실행한다. (로컬에서는 쓰지 않음)

# 1) 빌드: Java 21 JDK 로 실행 파일(jar) 만들기
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
# Windows 에서 커밋해 실행 권한이 빠져 있으므로 붙여 준다
RUN chmod +x gradlew
# 테스트는 로컬 MySQL 이 필요해 여기서는 건너뛴다 (로컬에서 ./gradlew test 로 실행)
RUN ./gradlew bootJar -x test --no-daemon

# 2) 실행: 가벼운 Java 21 JRE 에 jar 만 옮겨 실행
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Render 무료 플랜 메모리(512MB) 안에서 돌도록 힙을 75% 로 제한
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
