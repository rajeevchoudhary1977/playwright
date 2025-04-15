export const html = (link) => {
  return `
<!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
   </head>
   <body>
      <div style="background-color: #f5f5f5; padding: 20px; ">
         <p style="color: #777;">Thank you for signing up for our services at Web Test Studio. We are excited to have you as a new member of our community. Before we can proceed further, we kindly request you to validate your email address for account activation. This process helps us ensure the security and accuracy of our user information.
         </p>
         <div style="text-align: center;">
            <h1 style="color: #333;">Email Verification</h1>
            <p style="color: #777;">Please click the following link to verify your email address:</p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Verify Email</a>
         </div>
         <p style="color: #777;">Once you have successfully completed the email verification process, your account will be activated, and you will gain access to all the features and benefits of our services.</p>
         <p style="color: #777;">If you have any questions or encounter any issues during the verification process, please feel free to reach out to our support team. We are here to assist you and ensure a smooth onboarding experience.</p>
         <p style="color: #777;">Thank you for your cooperation. We look forward to serving you and providing you with a valuable and enjoyable user experience.</p>
      </div>
   </body>
</html>
`;
};

export const testReportGenerateSuccessHtml = (link, testName) => {
  return `
  <!DOCTYPE html>
  <html>
     <head>
        <meta charset="UTF-8">
        <title>Test Report Generation Complete - Access Your Report Now</title>
     </head>
     <body>
        <div style="background-color: #f5f5f5; padding: 20px; ">
           <p style="color: #777;">Dear User</p>
           <p style="color: #777;">We are pleased to inform you that the Test Report Generation of your Web App has been successfully completed. Your Test Report is now available for viewing.</p>
           <div style="text-align: center;">
              <p style="color: #777;">You can access your Test Report by clicking on the following link: :</p>
              <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">${testName}</a>
           </div>
           
           <p style="color: #777;">If you encounter any issues or have any questions regarding the generated report, please don't hesitate to contact our support team. We are here to assist you.</p>
           
           <p style="color: #777;">Thank you for choosing our services for your Test Report generation needs. We hope that this Test Report gives you further insight into your Web App.</p>
        </div>
     </body>
  </html>
  `;
};

export const testReportGenerateFailedHtml = (testName) => {
  return `
  <!DOCTYPE html>
  <html>
     <head>
        <meta charset="UTF-8">
        <title>Issue Encountered During Test Report Generation - Action Required</title>
     </head>
     <body>
        <div style="background-color: #f5f5f5; padding: 20px; ">
           <p style="color: #777;">Dear User</p>
           <p style="color: #777;">We regret to inform you that an error was encountered during generating Report for Test: ${testName}. Unfortunately, the Report generation could not be completed successfully at this time.</p>
           
           <p style="color: #777;">We apologize for any inconvenience this may have caused. Our technical team is actively working to resolve the issue and ensure a successful Report generation. We appreciate your understanding and patience as we work to rectify the situation.</p>
           
           <p style="color: #777;">If you have any urgent concerns or questions, please do not hesitate to contact our support teamTest Report Generation. We are here to assist you and address any inquiries you may have.</p>
        </div>
     </body>
  </html>
     `;
};
