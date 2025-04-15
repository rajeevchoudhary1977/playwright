// Dont change following import lines --- from here ---
import { test, expect } from "@playwright/test";
import config from "../config.json";

const MAIN_URL = config.mainUrl;
test.setTimeout(config.testTimeout);
test.use({
  ignoreHTTPSErrors: true,
});
// ---- till here ----

// Refer/Modify following code for testing functionality
 
// Test: Password Restricted Functionality --- start here -----

// test("Test Password Restricted Page", async ({ page }) => {
//   await page.goto(MAIN_URL);

//   page.waitForSelector('.yes-qutenza-pop-up-btn');
//   page.click('.yes-qutenza-pop-up-btn');
//   page.waitForSelector('#patient-keyName');
//   page.fill('#patient-keyName','Qconnect');
//   page.waitForSelector('#patient-pw-submit-btn');
//   page.click('#patient-pw-submit-btn');

// });

// Test: Login functinoality -- End ----

// Refer/Modify following code for testing functionality
 
// // Test: login Functionality --- start here -----

// const SALESFORCE_LOGIN_URL = 'https://test.salesforce.com';

// test("Test Salesforce Login", async ({ page }) => {
//   // Navigate to the Salesforce login page
//   await page.goto(SALESFORCE_LOGIN_URL);

//   // Fill in the username and password fields
//   await page.fill('#username', 'your_username');
//   await page.fill('#password', 'your_password');

//   // Click the login button
// Click the login button and wait for navigation to complete
// await page.click('#Login', { waitUntil: 'networkidle' });

//   // Verify that the login is successful
//   const loggedInText = await page.textContent('.loggedInUser');
//   expect(loggedInText).toContain('Welcome'); // Adjust this expectation based on your Salesforce instance
// });

// // Test: Login functinoality -- End ----




//const FORM_URL = 'https://www.mappbc.com/connect-with-a-rep';

//test("Test Form Submission", async ({ page }) => {
  // Navigate to the form page
 // await page.goto(FORM_URL);
 
  // if(config.hcp_box){
  //   await page.click(config.hcp_box_selector);
  // }
  // if(config.one_trust_box){
  //   await page.click(config.one_trust_selector);
  // }
  // Fill in the form fields
//   await page.selectOption('#main-content', { label: 'Physician' });
//   await page.selectOption('#edit-specialty', { label: 'Family Medicine' });
//   await page.fill('#edit-prefix', 'Dr.');
//   await page.fill('#edit-first-name', 'John');
//   await page.fill('#edit-last-name', 'Doe');
//   await page.fill('#edit-email', 'john.doe@example.com');
//   await page.fill('#edit-practice-zip-code', '12345');
//   await page.fill('#edit-phone-number', '1234567890');

//   // Execute JavaScript to check the checkbox
//   await page.evaluate(() => {
//     const checkbox = document.querySelector('input[name="i_would_also_like_to_sign_up"]') as HTMLInputElement;
//     if (checkbox) {
//       checkbox.checked = true;
//     }
//   });

//   // Click the submit button
//  // await page.click('#edit-actions-submit');

//  const submitButton = await page.$('.webform-button--submit');
//  if (submitButton) {
//   console.error('Submit button not found');
//     // await submitButton.scrollIntoViewIfNeeded();
//     // await page.waitForTimeout(1000); // Wait for stability
//     // await submitButton.click();
//     await submitButton.evaluate((button) => button.click());

//  } else {
//      console.error('Submit button not found');
//  }
 

// // Wait for navigation to complete
// await Promise.all([
//   page.waitForNavigation(), // Deprecated, but still functional
//   page.waitForLoadState('networkidle'), // Alternative
// ]);

//   // Verify successful form submission
//   const successMessage: string | null = await page.textContent('.success-message');
//   if (successMessage && successMessage.includes('Form submitted successfully')) {
//     console.log('Form submitted successfully!');
//   } else {
//     console.error('Form submission failed.');
//   }

// Fill out the form
// await page.selectOption('.js-form-item-provider-type select', { label: 'Physician' });
// await page.selectOption('.js-form-item-specialty select', { label: 'Family Medicine' });
// await page.fill('#edit-prefix', 'Dr.');
// await page.fill('#edit-first-name', 'John');
// await page.fill('#edit-last-name', 'Doe');
// await page.fill('#edit-email', 'johndoe@example.com');
// await page.fill('#edit-practice-zip-code', '12345');
// await page.fill('#edit-phone-number', '1234567890');
// await page.check('#edit-i-would-also-like-to-sign-up');

// Submit the form
//await page.click('.webform-button--submit',{force: true});


// Submit the form using JavaScript
// await page.evaluate(() => {
//   const submitButton = document.querySelector('.webform-button--submit');
//   if (submitButton) {
//     submitButton.click({force: true});
//   } else {
//     console.error('Submit button not found');
//   }
// });
// Wait for navigation or any other indicator that the form has been submitted successfully
//await page.waitForNavigation();

// Capture screenshot for validation or debugging
//await page.screenshot({ path: 'single_form_submission.png' });


//console.log('Form submitted successfully!');

//});

//---------Multistep Form Sample Code ------
const MULTISTEP_FORM_URL = 'https://www.opzelura.com/vitiligo/get-copay-savings-card';

test("Test Multi-step Form Submission", async ({ page }) => {
  // Navigate to the form page
  await page.goto(MULTISTEP_FORM_URL);
 
  // if(config.hcp_box){
  //   await page.click(config.hcp_box_selector);
  // }
   if(config.one_trust_box){
     await page.click(config.one_trust_selector);
   }

   if(config.isi_tray_exist){
    await page.click(config.isi_tray_selector);
  }


  // Fill out the first step of the form

  const radioButton1 = await page.$('[data-drupal-selector="edit-i-reside-in-the-united-states-yes"]');

  // Click the radio button to select it
  if (radioButton1) {
    await radioButton1.click();
  }

  const radioButton2 = await page.$('[data-drupal-selector="edit-i-am-18-years-or-older-yes"]');

  // Click the radio button to select it
  if (radioButton2) {
    await radioButton2.click();
  }

  const radioButton3 = await page.$('[data-drupal-selector="edit-i-am-enrolled-no"]');

  // Click the radio button to select it
  if (radioButton3) {
    await radioButton3.click();
  }

  const radioButton4 = await page.$('[data-drupal-selector="edit-i-have-read-the-a-id-termsopen-href-terms-conditions-class-text-yes"]');

  // Click the radio button to select it
  if (radioButton4) {
    await radioButton4.click();
  }
  
  // Submit the first step
  await page.click('#edit-wizard-next');

  // Wait for the second step to load if applicable
  await page.waitForSelector('#edit-how-would-you-like-to-receive-your-copay-savings-card-download', { timeout: 5000 });

// Capture screenshot for validation or debugging
  await page.screenshot({ path: 'tests/multi_form_submission1.png', fullPage: true,timeout: 5000 });


  const radioButton5 = await page.$('[data-drupal-selector="edit-how-would-you-like-to-receive-your-copay-savings-card-download"]');

  // Click the radio button to select it
  if (radioButton5) {
    await radioButton5.click();
  }

  

  await page.waitForSelector('#edit-first-name', { timeout: 5000 });
  
  //await page.fill('#edit-first-name', 'John');

  await page.fill('#edit-first-name', 'John');
  await page.fill('#edit-last-name', 'Doe');
  await page.fill('#edit-email-address-optional-', 'john.doe@example.com');

  // Check the checkbox
  await page.check('input[data-drupal-selector="edit-crm-enable"]');
  

  const radioButton6 = await page.$('[data-drupal-selector="edit-i-am-yes"]');

  // Click the radio button to select it
  if (radioButton6) {
    await radioButton6.click();
  }

  const radioButton7 = await page.$('[data-drupal-selector="edit-already-prescription-brand-yes"]');

  // Click the radio button to select it
  if (radioButton7) {
    await radioButton7.click();
  }

  //edit-how-long-have-you-been-living-with-vitiligo-less-than-1-year

  const radioButton8 = await page.$('[data-drupal-selector="edit-how-long-have-you-been-living-with-vitiligo-less-than-1-year"]');

  // Click the radio button to select it
  if (radioButton8) {
    await radioButton8.click();
  }

  // Submit the second step
  await page.click('#edit-actions-submit');

  await page.waitForSelector('#edit-actions-submit', { timeout: 5000 });

  
  
  // Capture screenshot for validation or debugging
   await page.screenshot({ path: 'tests/multi_form_submission2.png', fullPage: true,timeout: 5000 });

});

test("Test Multi-step Form Submission Option2", async ({ page }) => {
  // Navigate to the form page
  await page.goto(MULTISTEP_FORM_URL);
 
  // if(config.hcp_box){
  //   await page.click(config.hcp_box_selector);
  // }
   if(config.one_trust_box){
     await page.click(config.one_trust_selector);
   }

   if(config.isi_tray_exist){
    await page.click(config.isi_tray_selector);
  }


  // Fill out the first step of the form

  const radioButton1 = await page.$('[data-drupal-selector="edit-i-reside-in-the-united-states-yes"]');

  // Click the radio button to select it
  if (radioButton1) {
    await radioButton1.click();
  }

  const radioButton2 = await page.$('[data-drupal-selector="edit-i-am-18-years-or-older-yes"]');

  // Click the radio button to select it
  if (radioButton2) {
    await radioButton2.click();
  }

  const radioButton3 = await page.$('[data-drupal-selector="edit-i-am-enrolled-no"]');

  // Click the radio button to select it
  if (radioButton3) {
    await radioButton3.click();
  }

  const radioButton4 = await page.$('[data-drupal-selector="edit-i-have-read-the-a-id-termsopen-href-terms-conditions-class-text-yes"]');

  // Click the radio button to select it
  if (radioButton4) {
    await radioButton4.click();
  }
  
  // Submit the first step
  await page.click('#edit-wizard-next');

  // Wait for the second step to load if applicable
  await page.waitForSelector('#edit-how-would-you-like-to-receive-your-copay-savings-card-email', { timeout: 5000 });

// Capture screenshot for validation or debugging
  await page.screenshot({ path: 'tests/multi_form_submission_option1.png', fullPage: true,timeout: 5000 });


  const radioButton5 = await page.$('[data-drupal-selector="edit-how-would-you-like-to-receive-your-copay-savings-card-email"]');

  // Click the radio button to select it
  if (radioButton5) {
    await radioButton5.click();
  }

  

  await page.waitForSelector('#edit-first-name', { timeout: 5000 });
  
  //await page.fill('#edit-first-name', 'John');

  await page.fill('#edit-first-name', 'John');
  await page.fill('#edit-last-name', 'Doe');
  await page.fill('#edit-email-address', 'john.doe@example.com');

  // Check the checkbox
  await page.check('input[data-drupal-selector="edit-crm-enable"]');
  

  const radioButton6 = await page.$('[data-drupal-selector="edit-i-am-yes"]');

  // Click the radio button to select it
  if (radioButton6) {
    await radioButton6.click();
  }

  const radioButton7 = await page.$('[data-drupal-selector="edit-already-prescription-brand-yes"]');

  // Click the radio button to select it
  if (radioButton7) {
    await radioButton7.click();
  }

  //edit-how-long-have-you-been-living-with-vitiligo-less-than-1-year

  const radioButton8 = await page.$('[data-drupal-selector="edit-how-long-have-you-been-living-with-vitiligo-less-than-1-year"]');

  // Click the radio button to select it
  if (radioButton8) {
    await radioButton8.click();
  }

  // Submit the second step
  await page.click('#edit-actions-submit');

  await page.waitForSelector('#edit-actions-submit', { timeout: 5000 });

  
  
  // Capture screenshot for validation or debugging
   await page.screenshot({ path: 'tests/multi_form_submission2_option2.png', fullPage: true,timeout: 5000 });

});



