import express from "express";

import { addTestInfo } from "../middlewares/web.middlewares.js";
import { filesForView } from "../controllers/web.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middlewares.js";

const viewRoute = express.Router();

viewRoute.get('/webapp/:wId/test/:tId/view', addTestInfo, asyncHandler(filesForView));

viewRoute.get('/webapp/:wId/test/:tId/*', addTestInfo, asyncHandler(filesForView));

export default viewRoute;