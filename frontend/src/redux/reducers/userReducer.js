import { getSelectUserFromLS, getShowUserTestsFromLS } from "../../helpers/utils.js";
import { TYPES } from "../actions/userAction.js";

const {
  LOGIN_USER_START,
  LOGIN_USER_COMPLETE,
  LOGIN_USER_ERROR,
  FORGOT_PASS_EMAIL_VERIFY_START,
  FORGOT_PASS_EMAIL_VERIFY_COMPLETE,
  FORGOT_PASS_EMAIL_VERIFY_ERROR,
  FORGOT_PASS_CHANGE_PASSWORD_START,
  FORGOT_PASS_CHANGE_PASSWORD_COMPLETE,
  FORGOT_PASS_CHANGE_PASSWORD_ERROR,
  LOGOUT_USER,
  SET_ALERT,
  USER_LIST,
  USER_API_REQUEST,
  USER_API_ERROR,
  USER_API_SUCCESS,
  USER_CLEAR_ERROR,
  TOGGLE_SHOW_USER_TESTS,
  SELECT_USER,
} = TYPES;

const initialState = {
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  engagement: null,
  email: null,
  name: null,
  config: null,
  isAdmin: null,
  isLoading: false,
  error: false,
  msg: null,
  users: null,
  appLoading: false,
  showingUserTests: getShowUserTestsFromLS(),
  selectUser: getSelectUserFromLS(),
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_SHOW_USER_TESTS:
      return {
        ...state,
        showingUserTests: action.data
      }
    
      case SELECT_USER:
      return {
        ...state,
        selectUser: action.data
      }

    case USER_API_REQUEST:
      return { ...state, isLoading: true };
    
    case USER_API_ERROR:
      return {
        ...state,
        isLoading: false,
        error: true,
        msg: action.data,
      };

    case USER_API_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: false,
        msg: action.data || "Success",
      };

    case USER_CLEAR_ERROR:
      return {
        ...state,
        error: false,
        msg: null,
      };

    case SET_ALERT:
      return {
        ...state,
        error: action.data.error,
        msg: action.data.msg,
      };

    case LOGIN_USER_START:
      return { ...state, appLoading: true };
    case LOGIN_USER_COMPLETE:
      return {
        ...state,
        token: action.data.token,
        refreshToken: action.data.refreshToken,
        email: action.data.email,
        name: action.data.name,
        config: action.data.config,
        engagement: action.data.engagement,
        isAdmin: action.data.isAdmin,
        appLoading: false,
      };
    case LOGIN_USER_ERROR:
      return { ...state, appLoading: false, error: true, msg: action.data };
    case FORGOT_PASS_EMAIL_VERIFY_START:
      return { ...state, email: action.data.email, isLoading: true };
    case FORGOT_PASS_EMAIL_VERIFY_COMPLETE:
      return { ...state, isLoading: false };
    case FORGOT_PASS_EMAIL_VERIFY_ERROR:
      return { ...state, isLoading: false };
    case FORGOT_PASS_CHANGE_PASSWORD_START:
      return {
        ...state,
        email: action.data.email,
        password: action.data.password,
        isLoading: true,
      };
    case FORGOT_PASS_CHANGE_PASSWORD_COMPLETE:
      return { ...state, isLoading: false };
    case FORGOT_PASS_CHANGE_PASSWORD_ERROR:
      return { ...state, isLoading: false };
    case LOGOUT_USER:
      return {
        ...initialState,
        token: null,
        refreshToken: null,
      };
    case USER_LIST:
      return {
        ...state,
        isLoading: false,
        users: action.data,
      };

    default:
      return state;
  }
};

export default userReducer;
