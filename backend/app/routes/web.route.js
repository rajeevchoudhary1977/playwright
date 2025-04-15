import express from "express";

import { verifyToken } from "../middlewares/auth.middlewares.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlewares.js";

import { createTest, createWebApp, deleteTest, deleteWebApp, downloadTestReport, generateTestReportController, getConfigJson, getImage, getSampleFunctionalSpecTsCode, getSamplePlaywrightConfigCode, getTestBrowserJSON, getTestConfigJsonCode, getTestFunctionalSpecTsCode, getTestLog, getTestPlaywrightConfigCode, getTestUploadedImages, listWebApps, renameTest, renameWebApp, updateWebAppEngagement } from "../controllers/web.controller.js";
import { addTestInfo, addWebAppInfo } from "../middlewares/web.middlewares.js";

const webRoute = express.Router();

webRoute.get(
  "/",
  verifyToken,
  asyncHandler(listWebApps)
);

webRoute.get(
  "/sample-config-json/:category",
  verifyToken,
  asyncHandler(getConfigJson)
);

webRoute.get(
  "/sample-playwright-config/:category",
  verifyToken,
  asyncHandler(getSamplePlaywrightConfigCode)
);

webRoute.get(
  "/sample-functional-spec/:category",
  verifyToken,
  asyncHandler(getSampleFunctionalSpecTsCode)
);

webRoute.post(
  "/",
  verifyToken,
  asyncHandler(createWebApp)
);

webRoute.post(
  "/:wId/update-engagement",
  verifyToken,
  addWebAppInfo,
  asyncHandler(updateWebAppEngagement)
);

webRoute.post(
  "/:wId/rename",
  verifyToken,
  addWebAppInfo,
  asyncHandler(renameWebApp)
);

webRoute.delete(
  "/:wId",
  verifyToken,
  addWebAppInfo,
  asyncHandler(deleteWebApp)
);

webRoute.post(
  "/:wId/test",
  verifyToken,
  addWebAppInfo,
  asyncHandler(createTest)
);

webRoute.post(
  "/:wId/test/:tId/rename",
  verifyToken,
  addTestInfo,
  asyncHandler(renameTest)
);

webRoute.post(
  "/:wId/test/:tId/generate",
  verifyToken,
  addTestInfo,
  asyncHandler(generateTestReportController)
);

webRoute.get(
  "/:wId/test/:tId/download-report",
  addTestInfo,
  asyncHandler(downloadTestReport)
);

webRoute.get(
  "/:wId/test/:tId/config-json",
  addTestInfo,
  asyncHandler(getTestConfigJsonCode)
);

webRoute.get(
  "/:wId/test/:tId/playwright-config",
  addTestInfo,
  asyncHandler(getTestPlaywrightConfigCode)
);

webRoute.get(
  "/:wId/test/:tId/browser-json",
  addTestInfo,
  asyncHandler(getTestBrowserJSON)
);

webRoute.get(
  "/:wId/test/:tId/uploaded-images",
  addTestInfo,
  asyncHandler(getTestUploadedImages)
);

webRoute.get(
  "/:wId/test/:tId/get-image/*",
  addTestInfo,
  asyncHandler(getImage)
)

webRoute.get(
  "/:wId/test/:tId/functional-spec",
  addTestInfo,
  asyncHandler(getTestFunctionalSpecTsCode)
);

webRoute.get(
  "/:wId/test/:tId/test-log",
  addTestInfo,
  asyncHandler(getTestLog)
);

webRoute.delete(
  "/:wId/test/:tId",
  verifyToken,
  addTestInfo,
  asyncHandler(deleteTest)
);

export default webRoute;
