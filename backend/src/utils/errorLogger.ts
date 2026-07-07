import { logger } from "../config/logger";

export const logError = (
  error: any,
  context?: string
) => {

  logger.error({
    context,
    message: error.message,
    stack: error.stack,
  });

};