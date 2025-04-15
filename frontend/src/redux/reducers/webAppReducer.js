import { TYPES } from "../actions/webAppAction.js";

const {
  RESET_WEBAPP_STORE,

  API_REQUEST,
  API_SUCCESS,
  API_ERROR,
  CLEAR_ERROR,

  GET_WEBAPP_LIST_SUCCESS,
  CREATE_WEBAPP_SUCCESS,
  DELETE_WEBAPP,

  CREATE_TEST_SUCCESS,
  UPDATE_TEST_SUCCESS,
  DELETE_TEST,
} = TYPES;

const initialState = {
  loading: false,
  webApps: null,
  error: false,
  msg: null,
  userTests: null,
  totalTests: null,
};

const webAppReducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_WEBAPP_STORE: {
      return initialState;
    }

    case CLEAR_ERROR:
      return {
        ...state,
        error: false,
        loading: false,
        msg: null,
      };

    case API_REQUEST:
      return { ...state, loading: true };

    case API_ERROR:
      return {
        ...state,
        loading: false,
        error: true,
        msg: action.data,
      };

    case API_SUCCESS:
      return {
        ...state,
        loading: false,
        error: false,
        msg: action.data || "Success",
      };

    case CREATE_WEBAPP_SUCCESS:
      return {
        ...state,
        loading: false,
        msg: action.msg || "Web App created successfully",
      };

    case GET_WEBAPP_LIST_SUCCESS:
      return {
        ...state,
        webApps: action.data.webApps,
        userTests: action.data.userTests,
        totalTests: action.data.totalTests,
        loading: false,
      };

    case DELETE_WEBAPP:
      return {
        ...state,
        loading: false,
        msg: "Web App deleted successfully",
      };

    case CREATE_TEST_SUCCESS:
      return {
        ...state,
        loading: false,
        msg: action.data || "Test created successfully",
      };

    case DELETE_TEST:
      return {
        ...state,
        loading: false,
        error: false,
        msg: "Test deleted successfully",
      };

    case UPDATE_TEST_SUCCESS: {
      const { msg } = action.payload;
      return {
        ...state,
        loading: false,
        error: false,
        msg: msg || "Success"
      };
    }

    default:
      return state;
  }
};

export default webAppReducer;