import cron from "node-cron";
import { logger } from "../config/logger";


let cleanupRunning=false;


export const startCleanupJob=()=>{


cron.schedule(

"0 3 * * *",

async()=>{


if(cleanupRunning){

logger.warn(
"Cleanup skipped"
);

return;

}


try{


cleanupRunning=true;


logger.info(
"🧹 Cleanup Started"
);


// Remove:
// expired OTP
// temp files
// old logs


logger.info(
"✅ Cleanup Completed"
);


}
catch(error){

logger.error(
"💥 Cleanup Failed",
error
);

}
finally{

cleanupRunning=false;

}


},

{
timezone:"Asia/Colombo"
}


);


};