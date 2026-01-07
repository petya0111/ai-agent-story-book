FROM eclipse-temurin:17-jre
WORKDIR /app
COPY app.jar /app/app.jar
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh
EXPOSE 8080
ENTRYPOINT ["/app/run.sh"]
