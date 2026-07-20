import cron from "node-cron";
import { updateCurrencyRates } from "../services/currency.service";
import { logger } from "../config/logger";

let running = false;

export const startCurrencyJob = () => {

  cron.schedule(
    "0 */6 * * *",
    async () => {

      if (running) {
        logger.warn(
          "Currency update skipped. Previous job still running"
        );
        return;
      }


      try {

        running = true;

        logger.info(
          "💱 Currency Update Started"
        );


        await updateCurrencyRates();


        logger.info(
          "✅ Currency Update Completed"
        );


      } catch(error){

        logger.error(
          "💥 Currency Job Failed:",
          error
        );

      }
      finally{

        running=false;

      }


    },
    {
      timezone:"Asia/Colombo"
    }
  );


};