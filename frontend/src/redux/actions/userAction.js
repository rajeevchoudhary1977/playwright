import { getRequest, postRequest } from "../../helpers/request.js";
import { setSelectUserInLS, setShowUserTestsInLS } from "../../helpers/utils.js";
import { resetWebAppStore } from "./webAppAction.js";

export const TYPES = {
  LOGIN_USER_START: "LOGIN_USER_START",
  LOGIN_USER_COMPLETE: "LOGIN_USER_COMPLETE",
  LOGIN_USER_ERROR: "LOGIN_USER_ERROR",

  USER_API_REQUEST: "USER_API_REQUEST",
  USER_API_ERROR: "USER_API_ERROR",
  USER_API_SUCCESS: "USER_API_SUCCESS",
  USER_CLEAR_ERROR: "USER_CLEAR_ERROR",

  FORGOT_PASS_EMAIL_VERIFY_START: "FORGOT_PASS_EMAIL_VERIFY_START",
  FORGOT_PASS_EMAIL_VERIFY_COMPLETE: "FORGOT_PASS_EMAIL_VERIFY_COMPLETE",
  FORGOT_PASS_EMAIL_VERIFY_ERROR: "FORGOT_PASS_EMAIL_VERIFY_ERROR",

  FORGOT_PASS_VERIFY_PASSWORD_START: "FORGOT_PASS_VERIFY_PASSWORD_START",
  FORGOT_PASS_VERIFY_PASSWORD_COMPLETE: "FORGOT_PASS_VERIFY_PASSWORD_COMPLETE",
  FORGOT_PASS_VERIFY_PASSWORD_ERROR: "FORGOT_PASS_VERIFY_PASSWORD_ERROR",

  USER_LIST: "USER_LIST",

  LOGOUT_USER: "LOGOUT_USER",
  SET_ALERT: "SET_ALERT",

  TOGGLE_SHOW_USER_TESTS: "TOGGLE_SHOW_USER_TESTS",

  SELECT_USER: "SELECT_USER",
};

export const clearAlert = () => async (dispatch) => {
  dispatch({ type: TYPES.USER_CLEAR_ERROR });
};

export const setAlert = (error, msg) => async (dispatch) => {
  dispatch({ type: TYPES.SET_ALERT, data: { error, msg } });
};

export const toggleShowUserTestsAction = (newValue) => (dispatch) => {
  dispatch({ type: TYPES.TOGGLE_SHOW_USER_TESTS, data: newValue });
  setShowUserTestsInLS(newValue);
}

export const selectUserAction = (newValue) => (dispatch) => {
  dispatch({ type: TYPES.SELECT_USER, data: newValue });
  setSelectUserInLS(newValue);
}

export const userLogin = (userBody, notifySuccessLogin) => async (dispatch) => {
  dispatch({ type: TYPES.LOGIN_USER_START });
  try {
    const { data } = await postRequest(`user/login`, userBody);

    if (data.isSuccess) {
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      dispatch({ type: TYPES.LOGIN_USER_COMPLETE, data: data });
      notifySuccessLogin();
    } else {
      dispatch({ type: TYPES.LOGIN_USER_ERROR, data: data.msg });
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: TYPES.LOGIN_USER_ERROR, msg: JSON.stringify(error) });
  }
};

export const restoreUser = (data) => (dispatch) => {
  dispatch({ type: TYPES.LOGIN_USER_COMPLETE, data: data });
};

export const logoutUser = () => async (dispatch) => {
  localStorage.clear();
  dispatch({ type: TYPES.LOGOUT_USER });

  resetWebAppStore()(dispatch);
};

export const userVerifyEmail =
  ({ userEmail }) =>
  async (dispatch) => {
    dispatch({ type: TYPES.FORGOT_PASS_EMAIL_VERIFY_START, data: userEmail });
    try {
      const { data } = await postRequest(`user/verifyEmail`, {
        email: userEmail,
      });
      if (data.isSuccess)
        dispatch({ type: TYPES.FORGOT_PASS_EMAIL_VERIFY_COMPLETE });
      else dispatch({ type: TYPES.FORGOT_PASS_EMAIL_VERIFY_ERROR });
      return data;
    } catch (err) {
      console.log(err);
      dispatch({ type: TYPES.FORGOT_PASS_EMAIL_VERIFY_ERROR });
      return err;
    }
  };

export const resetPassword =
  ({ userEmail, password }) =>
  async (dispatch) => {
    dispatch({
      type: TYPES.FORGOT_PASS_VERIFY_PASSWORD_START,
      data: { email: userEmail, password: password },
    });
    try {
      const { data } = await postRequest(`user/reset-password`, {
        email: userEmail,
        newPassword: password,
      });
      if (data.isSuccess)
        dispatch({ type: TYPES.FORGOT_PASS_VERIFY_PASSWORD_COMPLETE });
      else dispatch({ type: TYPES.FORGOT_PASS_VERIFY_PASSWORD_ERROR });
      return data;
    } catch (err) {
      console.log(err);
      dispatch({ type: TYPES.FORGOT_PASS_VERIFY_PASSWORD_ERROR });
      return err;
    }
  };

export const getUsersList = () => async (dispatch) => {
  dispatch({ type: TYPES.USER_API_REQUEST });
  try {
    const { data } = await getRequest(`user/userlist`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
        "x-refresh-token": localStorage.getItem("refreshToken"),
        changeOrigin: true,
      },
    });
    if (data.isSuccess) {
      dispatch({
        type: TYPES.USER_LIST,
        data: data.users,
      });
    } else {
      dispatch({ type: TYPES.USER_API_ERROR, data: data.msg });
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: TYPES.USER_API_ERROR, data: JSON.stringify(error) });
  }
};
