import { combineReducers } from "redux";

import userReducer from "./userReducer";
import webAppReducer from "./webAppReducer.js";

export default combineReducers({
  userStore: userReducer,
  webAppStore: webAppReducer,
});
