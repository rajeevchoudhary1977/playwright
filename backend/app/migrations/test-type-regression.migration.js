import mongoose from "mongoose";
import path from "path";
import fs from "fs-extra";

import WebApp from "../models/webapp.model.js";
import Test from "../models/test.model.js";

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

const makeRegressionTypeTest = async () => {
  console.log("--------Starting migration---------");
  const allWebApps = await WebApp.find({ deleted: false });
  for (const webApp of allWebApps) {
    const webAppPath = path.join(__dirname, "../../public/web_apps", webApp.engagement, webApp.name);

    const originalTestTypePath = path.join(webAppPath, "VISUAL TEST");
    const newTestTypePath = path.join(webAppPath, "REGRESSION TEST");

    if (fs.existsSync(originalTestTypePath)) {
      await fs.rename(originalTestTypePath, newTestTypePath);
      console.log(`Renamed ${webApp.engagement} - ${webApp.name}`);
    }
    else console.log(`Visual test not found - ${webApp.engagement} - ${webApp.name}`);
  }

  console.log("--------Web Apps updated-------");
  
  console.log("--------Starting test update-------");
  await Test.updateMany({ deleted: false, category: "VISUAL TEST" }, { $set: { category: "REGRESSION TEST" } });
  console.log("--------Test update completed-------");
};

makeRegressionTypeTest();