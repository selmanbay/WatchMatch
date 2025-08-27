# ---- Build stage (Maven + JDK 17) ----
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app

# Bağımlılık cache için önce pom.xml
COPY backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline

# Kaynak kodu kopyala ve paketle
COPY backend/src ./src
RUN mvn -DskipTests package

# ---- Run stage (sadece JRE) ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# oluşan jar'ı kopyala (target altında tek jar varsayımı)
COPY --from=build /app/target/*.jar /app/app.jar

# uploads klasörü & env
RUN mkdir -p /app/uploads
ENV APP_UPLOAD_DIR=/app/uploads

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
