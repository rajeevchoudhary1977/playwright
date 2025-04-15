import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  outputDir: "./test-results",

  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { open: "never", outputFolder: "./playwright-report" }] /* DO NOT CHANGE THIS */],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--ignore-certificate-errors"],
        },
      },
    },

    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },

    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: "Mobile Chrome",
    //   use: {
    //     ...devices["Pixel 5"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 11"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 11 Pro"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 11 Pro Max"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12 Pro"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12 Pro Max"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 13"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 13 Pro"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 13 Pro Max"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 14"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 14 Pro"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 14 Pro Max"],
    //     launchOptions: {
    //       args: ["--ignore-certificate-errors"],
    //     },
    //   },
    // },
  ],
});
