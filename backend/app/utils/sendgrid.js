import sgMail from '@sendgrid/mail';

import { SENDGRID_API_KEY } from '../configs/config.js';

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async (email) => {
  return await sgMail.send(email);
};
