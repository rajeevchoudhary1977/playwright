require("dotenv").config();
export const API_HOST = process.env.API_HOST || "";
export const JWT_KEY = process.env.JWT_KEY;
export const DOMAIN = process.env.DOMAIN;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT;
export const FILE_SIZE_LIMIT = process.env.FILE_SIZE_LIMIT;
export const TESTS_LIMIT = process.env.TESTS_LIMIT;
export const ENVIRONMENT = process.env.ENVIRONMENT;

export const ENGAGEMENTS = JSON.parse(process.env.ENGAGEMENTS);

export const NOTIFY_REPORT_GENERATION_EMAIL = false;

export const TEST_STATUS_OPTS = {
  IN_PROGRESS: "IN PROGRESS",
  GENERATED: "GENERATED",
  FAILED: "FAILED",
};

export const TEST_CATEGORIES = {
  REGRESSION_TEST: "REGRESSION TEST",
  VISUAL_TEST: "VISUAL TEST",
  FUNCTIONAL_TEST: "FUNCTIONAL TEST",
  DATALAYER_TEST: "DATALAYER TEST",
  SANITY_TEST: "SANITY TEST",
  MLR_PKG: "MLR_PKG",
};

export const ENGAGEMENT_CONFIG = {
  PLATFORM: ["Web"],
  LATEST_UPDATES: [`Web App creation`],
  ENGAGEMENTS: ENGAGEMENTS,
  TEST_STATUS_OPTS: TEST_STATUS_OPTS,
  TEST_CATEGORIES: TEST_CATEGORIES,
  TESTS_LIMIT: TESTS_LIMIT,
  ENVIRONMENT: ENVIRONMENT,
  SHOW_RETRY_EXECUTION: false,
  SHOW_RETRY_EXECUTION_USERS: [
    "soumil.sarkar@indegene.com"
  ],
  POC: [
    "rajeev.choudhary@indegene.com",
    "soumil.sarkar@indegene.com",
  ]
};
