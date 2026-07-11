import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "5000";
const initialPort = Number(rawPort);

if (Number.isNaN(initialPort) || initialPort <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const listenWithFallback = (requestedPort: number, attempt = 0) => {
  const candidatePort = requestedPort + attempt;

  app.listen(candidatePort, (err?: Error) => {
    if (err) {
      const error = err as NodeJS.ErrnoException;

      if (error.code === "EADDRINUSE" && attempt < 10) {
        logger.warn(
          { attemptedPort: candidatePort, nextPort: candidatePort + 1 },
          "Port already in use, trying the next port",
        );
        listenWithFallback(requestedPort, attempt + 1);
        return;
      }

      logger.error({ err, port: candidatePort }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port: candidatePort }, "Server listening");
  });
};

listenWithFallback(initialPort);
