package com.example.logsample;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.UUID;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public final class LogSampleGeneratorApplication {

    private static final String SERVICE_NAME = "log-sample-generator";
    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").withZone(ZoneId.systemDefault());

    private static final Logger LOGGER = Logger.getLogger(LogSampleGeneratorApplication.class.getName());
    private static final Random RANDOM = new Random();

    private LogSampleGeneratorApplication() {
    }

    public static void main(String[] args) throws Exception {
        Path logDir = Paths.get("log-samples");
        Files.createDirectories(logDir);

        configureLogging(logDir.resolve("app.log"));

        int cycles = args.length > 0 ? Integer.parseInt(args[0]) : 20;

        LOGGER.info("Starting sample log generator for Kibana demos");

        for (int i = 1; i <= cycles; i++) {
            String traceId = randomId(32);
            String spanId = randomId(16);
            String orderId = "ORD-" + (1000 + i);

            log(Level.INFO, traceId, spanId, "Received request for order " + orderId);
            log(Level.INFO, traceId, spanId, "Loading order " + orderId + " at " + Instant.now());

            if (i % 4 == 0) {
                log(Level.WARNING, traceId, spanId,
                        "Slow downstream dependency detected for order " + orderId);
            }

            if (i % 7 == 0) {
                log(Level.SEVERE, traceId, spanId,
                        "Failed to process order " + orderId + " due to simulated timeout");
            } else {
                log(Level.INFO, traceId, spanId, "Successfully processed order " + orderId);
            }

            Thread.sleep(250L + RANDOM.nextInt(250));
        }

        LOGGER.info("Finished generating sample logs in ./log-samples/app.log");
    }

    private static void configureLogging(Path logFile) throws IOException {
        LOGGER.setUseParentHandlers(false);
        LOGGER.setLevel(Level.ALL);

        for (Handler handler : LOGGER.getHandlers()) {
            LOGGER.removeHandler(handler);
        }

        Formatter formatter = new SampleLogFormatter();

        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.ALL);
        consoleHandler.setFormatter(formatter);

        FileHandler fileHandler = new FileHandler(logFile.toString(), true);
        fileHandler.setLevel(Level.ALL);
        fileHandler.setFormatter(formatter);

        LOGGER.addHandler(consoleHandler);
        LOGGER.addHandler(fileHandler);
    }

    private static void log(Level level, String traceId, String spanId, String message) {
        LogRecord record = new LogRecord(level, message);
        record.setLoggerName(LOGGER.getName());
        record.setParameters(new Object[]{traceId, spanId});
        LOGGER.log(record);
    }

    private static String randomId(int length) {
        String value = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        return value.substring(0, length);
    }

    private static final class SampleLogFormatter extends Formatter {

        @Override
        public String format(LogRecord record) {
            Object[] parameters = record.getParameters();
            String traceId = parameters != null && parameters.length > 0 ? String.valueOf(parameters[0]) : "-";
            String spanId = parameters != null && parameters.length > 1 ? String.valueOf(parameters[1]) : "-";

            return String.format(
                    "%s %5s [service=%s,traceId=%s,spanId=%s] [%s] %s - %s%n",
                    TIMESTAMP_FORMAT.format(Instant.ofEpochMilli(record.getMillis())),
                    toLevel(record.getLevel()),
                    SERVICE_NAME,
                    traceId,
                    spanId,
                    Thread.currentThread().getName(),
                    record.getLoggerName(),
                    formatMessage(record)
            );
        }

        private String toLevel(Level level) {
            if (level == Level.SEVERE) {
                return "ERROR";
            }
            if (level == Level.WARNING) {
                return "WARN";
            }
            return "INFO";
        }
    }
}
