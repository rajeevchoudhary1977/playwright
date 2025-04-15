import { exec } from 'child_process';
import { promisify } from 'util';
import path from "path";
import fs from "fs-extra";

import { logger } from "../configs/logger.js";
import { getTestService, updateTestStatus } from '../services/web.services.js';
import { DOMAIN, ENVIRONMENT, TEST_STATUS_OPTS } from '../configs/config.js';
import { updateJSON } from '../utils/helpers.js';
import { testReportGenerateFailedHtml, testReportGenerateSuccessHtml } from '../utils/email-content.js';
import { sendEmail } from '../utils/sendgrid.js';

const execAsync = promisify(exec);

const notifyGeneration = async (testId) => {
  const test = await getTestService(testId);
  if(!test) {
    logger.info(`Test not found -> ${testId}`);
    return;
  }
  const { webApp, user } = test;

  const testStatusConfig = {
    [TEST_STATUS_OPTS.GENERATED] : {
      subject: "Web Test Studio: Test Report Generation Complete - Access Your Report Now",
      html: testReportGenerateSuccessHtml(`${DOMAIN}/views/webapp/${webApp._id}/test/${test._id}/view`, test.name)
    },
    [TEST_STATUS_OPTS.FAILED] : {
      subject: "Web Test Studio: Issue Encountered During Test Report Generation - Action Required",
      html: testReportGenerateFailedHtml(test.name)
    }
  }

  const email = {
    to: user.email,
    from: {
      name: 'Web Test Studio Service',
      email: 'noreply.web.test.studio@indegene.com',
    },
    subject: testStatusConfig[test.status].subject,
    html: testStatusConfig[test.status].html,
  };

  if(ENVIRONMENT === "PROD") {
    await sendEmail(email);
  }  
}

const generateTestReport = async (job) => {
  logger.info("started generation");

  const { data } = job.attrs;
  const { webApp, test } = data;
  
  const testPath = path.join(
    __dirname,
    "../../public/web_apps",
    webApp.engagement,
    webApp.name,
    test.category,
    test.name
  );

  const configJSONPath = path.join(testPath, "config.json");

  try {
    logger.info(`Generating report for main url - ${test.name}`);

    await updateJSON(configJSONPath, { mainUrl: test.mainUrl });
    const { stdout, stderr } = await execAsync(`npx playwright test`, { cwd: testPath, windowsHide: true });

    if(stderr) {
      logger.error("stderr", stderr);
    } else {
      logger.info(`Completed generating report for main url - ${test.name}`);
    }
  } catch(err) {
    logger.error("Error", err);
  }

  try {
    logger.info(`Generating final comparison report - ${test.name}`);
    
    await updateJSON(configJSONPath, { mainUrl: test.refUrl });
    const { stdout, stderr } = await execAsync(`npx playwright test`, { cwd: testPath, windowsHide: true });

    if(stderr) {
      logger.error("stderr", stderr);
      // await updateTestStatus(test._id, TEST_STATUS_OPTS.FAILED);
      // await notifyGeneration(test._id);
      // return;
    }
    
    logger.info(`Completed generating final comparison report - stdErr: ${!!stderr} - ${test.name}`);

    await updateTestStatus(test._id, TEST_STATUS_OPTS.GENERATED);

  } catch(err) {
    logger.error("Error", err);

    const isReportExists = fs.existsSync(path.join(testPath, "playwright-report/index.html"));

    await updateTestStatus(test._id, isReportExists ? TEST_STATUS_OPTS.GENERATED : TEST_STATUS_OPTS.FAILED);
  } finally {
    await job.remove();
    await notifyGeneration(test._id);
  }

}

export default generateTestReport;