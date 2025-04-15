import WebApp from "../models/webapp.model.js";
import Test from "../models/test.model.js";

export const addWebAppInfo = async (req, res, next) => {
  const { wId } = req.params;

  try {
    const webApp = await WebApp.findOne({ _id: wId }).populate({ path: "tests" });
    req.webApp = webApp;
  } catch (error) {
    return res.json({ isSuccess: false, msg: 'Web App is not found!' });
  }
  return next();
};

export const addTestInfo = async (req, res, next) => {
  const { tId } = req.params;

  try {
    const test = await Test.findOne({ _id: tId }).populate({ path: 'webApp' });
    req.test = test;
  } catch (error) {
    return res.json({ isSuccess: false, msg: 'Test is not found!' });
  }
  return next();
};
