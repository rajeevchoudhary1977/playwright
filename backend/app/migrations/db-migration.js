import mongoose from "mongoose";
import path from "path";
import fs from "fs-extra";

import User from "../models/user.model.js";
import WebApp from "../models/webapp.model.js";
import Test from "../models/test.model.js";
import TestLog from "../models/test-log.model.js";

const ENGAGEMENT = "INCYTE";
const DB_MIGRATION_DIR = path.join(
  __dirname,
  "../../db-migration",
  ENGAGEMENT
);
const USER_EMAILS = [
  "amrendra.mourya@indegene.com",
  "ashis.monteiro@indegene.com",
  "pallavi.autade@indegene.com",
  "jeevan.singh@indegene.com",
  "akash.nagariya@indegene.com",
  "abinash.mishra@indegene.com",
  "leela.krishna@indegene.com",
  "ridhi.bhutani@indegene.com",
  "rahul.karrthik@indegene.com",
  "sangeeta.rai@indegene.com",
  "soumya.dey@indegene.com",
];

mongoose.connect(
  process.env.MONGO_URI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);

const writeJSON = async (path, json, opt = { spaces: 2 }) => {
  await fs.writeJson(path, json, opt);
}

const dbMigration = async () => {
  console.log("------------Starting migration-------------");

  await fs.ensureDir(DB_MIGRATION_DIR);

  const resultIdsJson = {};

  const users = await User.find({ email: { $in: USER_EMAILS } }).lean();
  const userIds = users.map((user) => user._id);
  resultIdsJson.users = userIds;
  console.log("------------Retrieved users collection------");

  const webApps = await WebApp.find({ engagement: ENGAGEMENT }).lean();
  const webAppsIds = webApps.map((webApp) => webApp._id);
  resultIdsJson.webApps = webAppsIds;
  console.log("-----------Retrieved webapps collection------------");
  
  const tests = await Test.find({ webApp: { $in: webAppsIds } }).lean();
  const testsIds = tests.map((test) => test._id);
  resultIdsJson.tests = testsIds;
  console.log("-----------Retrieved tests collection------------");
  
  const testLogs = await TestLog.find({ test: { $in: testsIds } }).lean();
  const testLogsIds = testLogs.map((testLog) => testLog._id);
  resultIdsJson.testLogs = testLogsIds;
  console.log("-----------Retrieved test logs collection------------");
  
  await writeJSON(path.join(DB_MIGRATION_DIR, "result.json"), resultIdsJson);
  console.log("-----------Migration Completed------------");
}

dbMigration();