import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";

import { logger } from "../configs/logger.js";
import { clearTestLog, getTestService, updateTestLog, updateTestStatus } from "../services/web.services.js";
import { DOMAIN, ENVIRONMENT, NOTIFY_REPORT_GENERATION_EMAIL, TEST_CATEGORIES, TEST_STATUS_OPTS } from "../configs/config.js";
import { updateJSON } from "../utils/helpers.js";
import { testReportGenerateFailedHtml, testReportGenerateSuccessHtml } from "../utils/email-content.js";
import { sendEmail } from "../utils/sendgrid.js";

const notifyGeneration = async (testId) => {
  const test = await getTestService(testId);
  if (!test) {
    logger.info(`Test not found -> ${testId}`);
    return;
  }
  const { webApp, user } = test;

  const testStatusConfig = {
    [TEST_STATUS_OPTS.GENERATED]: {
      subject: "Web Test Studio: Test Report Generation Complete - Access Your Report Now",
      html: testReportGenerateSuccessHtml(`${DOMAIN}/views/webapp/${webApp._id}/test/${test._id}/view`, test.name),
    },
    [TEST_STATUS_OPTS.FAILED]: {
      subject: "Web Test Studio: Issue Encountered During Test Report Generation - Action Required",
      html: testReportGenerateFailedHtml(test.name),
    },
  };

  const email = {
    to: user.email,
    from: {
      name: "Web Test Studio Service",
      email: "noreply.web.test.studio@indegene.com",
    },
    subject: testStatusConfig[test.status].subject,
    html: testStatusConfig[test.status].html,
  };

  if (ENVIRONMENT === "PROD") {
    await sendEmail(email);
  } else {
    logger.info(`Sent email - ${email.subject}`);
  }
};

const generateTestReport = async (job) => {
  logger.info("started generation");

  const { data } = job.attrs;
  const { webApp, test } = data;

  await clearTestLog(test._id);

  const testPath = path.join(__dirname, "../../public/web_apps", webApp.engagement, webApp.name, test.category, test.name);
  const configJSONPath = path.join(testPath, "config.json");

  const command = "npx",
    args = ["playwright", "test"];

  const testJobsCategoryWise = {
    [TEST_CATEGORIES.REGRESSION_TEST]: async () => {
      const runFinalTest = async () => {
        try {
          await updateTestLog(test._id, `Generating final comparison report - ${test.name}`);

          await updateJSON(configJSONPath, { mainUrl: test.refUrl });
          const child = spawn(command, args, { cwd: testPath, shell: true, windowsHide: true });

          child.stdout.on("data", async (data) => {
            // logger.info(`Script output: ${data}`);
            await updateTestLog(test._id, data);
          });

          child.stderr.on("data", async (data) => {
            // logger.info(`Script error: ${data}`);
            await updateTestLog(test._id, data);
          });

          child.on("exit", async (code) => {
            // logger.info(`Child process exited with code ${code} , Main URL done - ${test.name}`);
            await updateTestLog(test._id, `Child process exited with code ${code} , Final Report done - ${test.name}`);

            const isReportExists = fs.existsSync(path.join(testPath, "playwright-report/index.html"));
            await updateTestStatus(test._id, isReportExists ? TEST_STATUS_OPTS.GENERATED : TEST_STATUS_OPTS.FAILED);

            await job.remove();
            if (NOTIFY_REPORT_GENERATION_EMAIL) await notifyGeneration(test._id);
          });

          child.on("error", async (err) => {
            // logger.info(`Error in child process - ${err}`);
            await updateTestLog(test._id, `Error in child process - ${err}`);
          });
        } catch (err) {
          logger.error("Error", err);
          await updateTestLog(test._id, `${err}`);
          await updateTestStatus(test._id, TEST_STATUS_OPTS.FAILED);
        }
      };

      try {
        await updateTestStatus(test._id, TEST_STATUS_OPTS.IN_PROGRESS);

        await updateTestLog(test._id, `Generating report for main url - ${test.name}`);

        await updateJSON(configJSONPath, { mainUrl: test.mainUrl });

        const child = spawn(command, args, { cwd: testPath, shell: true, windowsHide: true });

        child.stdout.on("data", async (data) => {
          // logger.info(`Script output: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.stderr.on("data", async (data) => {
          // logger.info(`Script error: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.on("exit", async (code) => {
          // logger.info(`Child process exited with code ${code} , Main URL done - ${test.name}`);
          await updateTestLog(test._id, `Child process exited with code ${code} , Main URL done - ${test.name}`);
          await runFinalTest();
        });

        child.on("error", async (err) => {
          // logger.info(`Error in child process - ${err}`);
          await updateTestLog(test._id, `Error in child process - ${err}`);
          await runFinalTest();
        });
      } catch (err) {
        logger.error("Error", err);
        await updateTestLog(test._id, `${err}`);
      }
    },

    [TEST_CATEGORIES.VISUAL_TEST]: async () => {
      // const imagesPath = path.join(testPath, "ref-images");
      // const exampleSpecScreenshotsPath = path.join(testPath, "tests/example.spec.ts-snapshots");
      // await fs.copy(imagesPath, exampleSpecScreenshotsPath);
      
      try {
        await updateTestStatus(test._id, TEST_STATUS_OPTS.IN_PROGRESS);
        await updateTestLog(test._id, `Generating VISUAL TEST Report - ${test.name}`);

        // await updateJSON(configJSONPath, { mainUrl: test.refUrl one_trust_box_dev: true });
        const child = spawn(command, args, { cwd: testPath, shell: true, windowsHide: true });

        child.stdout.on("data", async (data) => {
          // logger.info(`Script output: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.stderr.on("data", async (data) => {
          // logger.info(`Script error: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.on("exit", async (code) => {
          // logger.info(`Child process exited with code ${code} , Main URL done - ${test.name}`);
          await updateTestLog(test._id, `Child process exited with code ${code} , Final Report done - ${test.name}`);

          const isReportExists = fs.existsSync(path.join(testPath, "playwright-report/index.html"));
          await updateTestStatus(test._id, isReportExists ? TEST_STATUS_OPTS.GENERATED : TEST_STATUS_OPTS.FAILED);

          await job.remove();
          if (NOTIFY_REPORT_GENERATION_EMAIL) await notifyGeneration(test._id);
        });

        child.on("error", async (err) => {
          // logger.info(`Error in child process - ${err}`);
          await updateTestLog(test._id, `Error in child process - ${err}`);
        });
      } catch (err) {
        logger.error("Error", err);
        await updateTestLog(test._id, `${err}`);
        await updateTestStatus(test._id, TEST_STATUS_OPTS.FAILED);
      }
    },

    [TEST_CATEGORIES.MLR_PKG]: async () => {
      try {
        await updateTestStatus(test._id, TEST_STATUS_OPTS.IN_PROGRESS);
        
        await updateTestLog(test._id, `Generating MLR PDF - ${test.name}`);

        await updateJSON(configJSONPath, { mainUrl: test.mainUrl });
        const child = spawn(command, args, { cwd: testPath, shell: true, windowsHide: true });

        child.stdout.on("data", async (data) => {
          // logger.info(`Script output: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.stderr.on("data", async (data) => {
          // logger.info(`Script error: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.on("exit", async (code) => {
          // logger.info(`Child process exited with code ${code} , Main URL done - ${test.name}`);
          await updateTestLog(test._id, `Child process exited with code ${code} , Final Report done - ${test.name}`);

          const isReportExists = fs.existsSync(path.join(testPath, "playwright-report/index.html")) && fs.existsSync(path.join(testPath, "tests/output/output.pdf"));
          await updateTestStatus(test._id, isReportExists ? TEST_STATUS_OPTS.GENERATED : TEST_STATUS_OPTS.FAILED);

          await job.remove();
          if (NOTIFY_REPORT_GENERATION_EMAIL) await notifyGeneration(test._id);
        });

        child.on("error", async (err) => {
          // logger.info(`Error in child process - ${err}`);
          await updateTestLog(test._id, `Error in child process - ${err}`);
        });
      } catch (err) {
        logger.error("Error", err);
        await updateTestLog(test._id, `${err}`);
        await updateTestStatus(test._id, TEST_STATUS_OPTS.FAILED);
      }
    },

    [TEST_CATEGORIES.FUNCTIONAL_TEST]: async () => {
      try {
        await updateTestStatus(test._id, TEST_STATUS_OPTS.IN_PROGRESS);
        
        await updateTestLog(test._id, `Generating FUNCTIONAL TEST Report - ${test.name}`);

        await updateJSON(configJSONPath, { mainUrl: test.mainUrl });
        const child = spawn(command, args, { cwd: testPath, shell: true, windowsHide: true });

        child.stdout.on("data", async (data) => {
          // logger.info(`Script output: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.stderr.on("data", async (data) => {
          // logger.info(`Script error: ${data}`);
          await updateTestLog(test._id, data);
        });

        child.on("exit", async (code) => {
          // logger.info(`Child process exited with code ${code} , Main URL done - ${test.name}`);
          await updateTestLog(test._id, `Child process exited with code ${code} , Final Report done - ${test.name}`);

          const isReportExists = fs.existsSync(path.join(testPath, "playwright-report/index.html"));
          await updateTestStatus(test._id, isReportExists ? TEST_STATUS_OPTS.GENERATED : TEST_STATUS_OPTS.FAILED);

          await job.remove();
          if (NOTIFY_REPORT_GENERATION_EMAIL) await notifyGeneration(test._id);
        });

        child.on("error", async (err) => {
          // logger.info(`Error in child process - ${err}`);
          await updateTestLog(test._id, `Error in child process - ${err}`);
        });
      } catch (err) {
        logger.error("Error", err);
        await updateTestLog(test._id, `${err}`);
        await updateTestStatus(test._id, TEST_STATUS_OPTS.FAILED);
      }
    }
  };

  await testJobsCategoryWise[test.category]();
};

export default generateTestReport;
