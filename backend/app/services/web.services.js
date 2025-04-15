import WebApp from "../models/webapp.model.js";
import Test from "../models/test.model.js";
import TestLog from "../models/test-log.model.js";

export const listWebAppsService = async (userId, isAdmin, showUserTests, selectUser) => {
  let webApps = [];
  
  if (isAdmin && showUserTests) {
    webApps = await WebApp.find({ deleted: false })
    .sort({ createdAt: "desc" })
    .populate({
      path: "tests",
      match: { user: userId },
      populate: { path: "user" }
    })
    .populate({ path: "user" });

    webApps = webApps.filter((webApp) => {
      if(webApp.user._id.toString() === userId) return true;
      else return webApp.tests.length > 0;
    });

  } else if(isAdmin && selectUser) {
    webApps = await WebApp.find({ deleted: false })
    .sort({ createdAt: "desc" })
    .populate({
      path: "tests",
      match: { user: selectUser },
      populate: { path: "user" }
    })
    .populate({ path: "user" });

    webApps = webApps.filter((webApp) => {
      if(webApp.user._id.toString() === selectUser) return true;
      else return webApp.tests.length > 0;
    });
  
  } else if (isAdmin) {
    webApps = await WebApp.find({ deleted: false })
      .sort({ createdAt: "desc" })
      .populate({ path: "tests", populate: { path: "user" } })
      .populate({ path: "user" });

  } else {
    webApps = await WebApp
      .find({
        $and: [{ $or: [{ user: userId }, { sharedWith: userId }] }, { deleted: false }],
      })
      .sort({ createdAt: "desc" })
      .populate({ path: "tests", populate: { path: "user" } })
      .populate({ path: "user" });
  }
  return webApps;
};

export const getWebAppByNameService = async (webAppName, engagement) => {
  const nameRegex = new RegExp(`^${webAppName}$`, "i");
  const webApp = await WebApp.findOne({
    name: nameRegex,
    engagement: engagement,
    deleted: false,
  }).populate({ path: "user" });

  return webApp;
};

export const getTestByNameService = async (testName, testCategory, webAppId) => {
  const nameRegex = new RegExp(`^${testName}$`, "i");
  const test = await Test.findOne({
    name: nameRegex,
    webApp: webAppId,
    category: testCategory,
    deleted: false,
  })
    .populate({ path: "webApp" })
    .populate({ path: "user" });

  return test;
};

export const createWebAppService = async (webAppBody) => {
  const webApp = new WebApp(webAppBody);
  await webApp.save();
  return webApp;
};

export const createTestService = async (testBody, webAppId) => {
  const test = new Test(testBody);
  const testResponse = await test.save();
  await WebApp.findOneAndUpdate({ _id: webAppId }, { $push: { tests: testResponse._id } });
  return testResponse;
};

export const updateTestStatus = async (testId, newStatus) => {
  await Test.findOneAndUpdate({ _id: testId }, { $set: { status: newStatus } });
};

export const deleteTestService = async (testId, wId) => {
  await Test.findOneAndUpdate({ _id: testId }, { $set: { deleted: true } });
  await WebApp.findOneAndUpdate({ _id: wId }, { $pull: { tests: testId } });
  await TestLog.findOneAndDelete({ test: testId });
};

export const getUserTestsService = async (userId) => {
  return await Test.countDocuments({ user: userId, deleted: false });
};

export const getTotalTestsService = async () => {
  return await Test.countDocuments({ deleted: false });
};

export const getTestService = async (testId) => {
  const test = await Test.findOne({ _id: testId, deleted: false }).populate({ path: "user" }).populate({ path: "webApp" });
  return test;
};

export const updateTestLog = async (testId, newLog) => {
  await TestLog.findOneAndUpdate({ test: testId }, { $push: { logs: newLog } }, { upsert: true });
};

export const clearTestLog = async (testId) => {
  // await Test.findOneAndUpdate({ _id: testId}, { $set: { testLog: [] } } );
  await TestLog.findOneAndUpdate({ test: testId }, { $set: { logs: [] } });
};

export const getTestLogService = async (testId) => {
  const testLog = await TestLog.findOne({ test: testId });
  return testLog.logs;
  // const test = await Test.findOne({ _id: testId });
  // return {
  //   testLog: test.testLog,
  //   testStatus: test.status,
  // }
};

export const renameTestService = async (testId, newName) => {
  await Test.findOneAndUpdate({ _id: testId }, { $set: { name: newName } });
};

export const renameWebAppService = async (webAppId, newName) => {
  await WebApp.findOneAndUpdate({ _id: webAppId }, { $set: { name: newName } });
}

export const deleteWebAppService = async (webAppId, testIds) => {
  await WebApp.findOneAndUpdate({ _id: webAppId }, { $set: { deleted: true } });
  await Test.updateMany({ webApp: webAppId }, { $set: { deleted: true } })
  await TestLog.deleteMany({ test: { $in: testIds } });
}

export const updateWebAppEngagementService = async (wId, newEngagement) => {
  await WebApp.findOneAndUpdate({ _id: wId }, { $set: { engagement: newEngagement } });
};