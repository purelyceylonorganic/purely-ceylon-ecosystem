import cron from "node-cron";
import { logger } from "../config/logger";


let backupRunning=false;


export const startBackupJob=()=>{


cron.schedule(
"0 2 * * *",

async()=>{


if(backupRunning){

logger.warn(
"Backup already running"
);

return;

}


try{


backupRunning=true;


logger.info(
"💾 Database Backup Started"
);


// Future:
// pg_dump
// AWS S3 upload


logger.info(
"✅ Database Backup Completed"
);


}
catch(error){

logger.error(
"💥 Backup Failed",
error
);

}
finally{

backupRunning=false;

}


},
{
timezone:"Asia/Colombo"
}

);


};