import { Agenda } from "agenda";

import { MONGO_URI } from "../configs/config.js";
import { logger } from "../configs/logger.js";
import generateTestReport from "./generate-test-report.js";
import { cleanTemp } from "./clean-temp.js";

const agenda = new Agenda({
  db: { address: MONGO_URI },
});

agenda.define("generate-test-report", generateTestReport);

agenda.define("clean-temp", cleanTemp);

(async () => {
  await agenda.start();

  agenda.on('start', (job) => {
    logger.info(`JOB START: ${job.attrs.name} - ${job.attrs._id}`);
  });

  agenda.on('success', (job) => {
    logger.info(`JOB SUCCESS: ${job.attrs.name} - ${job.attrs._id}`);
  });
  
  agenda.on('fail', (err, job) => {
    logger.info(`JOB FAIL: ${job.attrs.name} - ${job.attrs._id}`);
    logger.error(`JOB FAIL: ${job.attrs.name} - ${job.attrs._id}, Error: ${err}`);
  });

  await agenda.every('0 5 * * *', 'clean-temp');
})();

export default agenda;