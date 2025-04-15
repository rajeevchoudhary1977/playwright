import download from "downloadjs";

import { deleteRequest, getRequest, postRequest } from "../../helpers/request.js";
import { API_HOST } from "../../configs/api.js";
import { getSelectUserFromLS, getShowUserTestsFromLS } from "../../helpers/utils.js";

export const TYPES = {
  RESET_WEBAPP_STORE: "RESET_WEBAPP_STORE",

  API_REQUEST: "API_REQUEST",
  API_ERROR: "API_ERROR",
  API_SUCCESS: "API_SUCCESS",
  CLEAR_ERROR: "CLEAR_ERROR",

  GET_WEBAPP_LIST_SUCCESS: "GET_WEBAPP_LIST_SUCCESS",
  CREATE_WEBAPP_SUCCESS: "CREATE_WEBAPP_SUCCESS",
  DELETE_WEBAPP: "DELETE_WEBAPP",
  SHARE_WEBAPP_SUCCESS: "SHARE_WEBAPP_SUCCESS",

  CREATE_TEST_SUCCESS: "CREATE_TEST_SUCCESS",
  UPDATE_TEST_SUCCESS: "UPDATE_TEST_SUCCESS",
  DELETE_TEST: "DELETE_TEST",
};

export const resetWebAppStore = () => (dispatch) => {
  dispatch({ type: TYPES.RESET_WEBAPP_STORE });
}

export const clearError = () => async (dispatch) => {
  dispatch({ type: TYPES.CLEAR_ERROR });
};

export const apiResponse = (error, msg) => (dispatch) => {
  dispatch({ type: error ? TYPES.API_ERROR : TYPES.API_SUCCESS, data: msg });
};

export const getWebAppList = () => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const { data } = await getRequest(`webapp?show_user_tests=${getShowUserTestsFromLS()}${getSelectUserFromLS() ? `&select_user=${getSelectUserFromLS()}` : ""}`);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.GET_WEBAPP_LIST_SUCCESS,
        data: {
          webApps: data.webApps,
          userTests: data.userTests,
          totalTests: data.totalTests,
        },
      });
      return data.webApps;
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg });
    }
  } catch (error) {
    dispatch({ type: TYPES.API_ERROR, data: JSON.stringify(error) });
  }
};

export const createWebApp = (formData, closeModal) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });

  try {
    const { data } = await postRequest("webapp", formData);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.CREATE_WEBAPP_SUCCESS,
        data: data.msg,
      });

      closeModal();
      getWebAppList()(dispatch);
    } else if (data.preExistingWebApp) {
      const { preExistingWebApp } = data;
      alert(`A web app with the same name already exists.
      Please find the details about the pre-existing web app below:
      Engagement: ${preExistingWebApp.engagement}
      WebApp: ${preExistingWebApp.name}
      Creator: ${preExistingWebApp.user.name} | ${preExistingWebApp.user.email}`);

      dispatch({ type: TYPES.API_ERROR, data: "Error" });
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg || data.error });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: TYPES.API_ERROR,
      data: "Something went wrong, Please contact admin!!",
    });
  }
};

export const renameWebAppAction = (wId, formData, closeModal) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });

  try {
    const { data } = await postRequest(`webapp/${wId}/rename`, formData);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.API_SUCCESS,
        data: data.msg,
      });

      closeModal();
      getWebAppList()(dispatch);
    } else if (data.preExistingWebApp) {
      const { preExistingWebApp } = data;
      alert(`A web app with the same name already exists.
      Please find the details about the pre-existing web app below:
      Engagement: ${preExistingWebApp.engagement}
      WebApp: ${preExistingWebApp.name}
      Creator: ${preExistingWebApp.user.name} | ${preExistingWebApp.user.email}`);

      dispatch({ type: TYPES.API_ERROR, data: "Error" });
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg || data.error });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: TYPES.API_ERROR,
      data: "Something went wrong, Please contact admin!!",
    });
  }
};

export const updateWebAppEngagementAction = (wId, formData, closeModal) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });

  try {
    const { data } = await postRequest(`webapp/${wId}/update-engagement`, formData);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.API_SUCCESS,
        data: data.msg,
      });

      closeModal();
      getWebAppList()(dispatch);
    } else if (data.preExistingWebApp) {
      const { preExistingWebApp } = data;
      alert(`A web app with the same name already exists.
      Please find the details about the pre-existing web app below:
      Engagement: ${preExistingWebApp.engagement}
      WebApp: ${preExistingWebApp.name}
      Creator: ${preExistingWebApp.user.name} | ${preExistingWebApp.user.email}`);

      dispatch({ type: TYPES.API_ERROR, data: "Error" });
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg || data.error });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: TYPES.API_ERROR,
      data: "Something went wrong, Please contact admin!!",
    });
  }
};

export const deleteWebAppAction = (wId) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const { data } = await deleteRequest(`webapp/${wId}`);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.API_SUCCESS,
        data: data.msg,
      });

      getWebAppList()(dispatch);
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg });
    }
  } catch (error) {
    dispatch({ type: TYPES.API_ERROR, data: JSON.stringify(error) });
  }
};

export const createTest = (formData, wId, closeModal) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });

  try {
    const { data } = await postRequest(`webapp/${wId}/test`, formData);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.CREATE_TEST_SUCCESS,
        data: data.msg,
      });

      closeModal();
      getWebAppList()(dispatch);
    } else if (data.preExistingTest) {
      const { preExistingTest } = data;
      alert(`A test with the same name already exists in the web app.
      Please find the details about the pre-existing web page below:
      Engagement: ${preExistingTest.webApp.engagement}
      WebApp: ${preExistingTest.webApp.name}
      Web Page: ${preExistingTest.name}
      Creator: ${preExistingTest.user.name} | ${preExistingTest.user.email}`);

      dispatch({ type: TYPES.API_ERROR, data: "Error" });
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg || data.error });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: TYPES.API_ERROR,
      data: "Something went wrong, Please contact admin!!",
    });
  }
};

export const updateTestNameAction = (formData, wId, tId, closeModal) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const { data } = await postRequest(`webApp/${wId}/test/${tId}/rename`, formData);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.CREATE_TEST_SUCCESS,
        data: data.msg,
      });

      closeModal();
      getWebAppList()(dispatch);
    } else if (data.preExistingTest) {
      const { preExistingTest } = data;
      alert(`A test with the same name already exists in the web app.
      Please find the details about the pre-existing web page below:
      Engagement: ${preExistingTest.webApp.engagement}
      WebApp: ${preExistingTest.webApp.name}
      Web Page: ${preExistingTest.name}
      Creator: ${preExistingTest.user.name} | ${preExistingTest.user.email}`);

      dispatch({ type: TYPES.API_ERROR, data: "Error" });
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg || data.error });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: TYPES.API_ERROR,
      data: "Something went wrong, Please contact admin!!",
    });
  }
};

export const deleteTest = (wId, tId) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const { data } = await deleteRequest(`webapp/${wId}/test/${tId}`);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.API_SUCCESS,
        data: data.msg,
      });

      getWebAppList()(dispatch);
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg });
    }
  } catch (error) {
    dispatch({ type: TYPES.API_ERROR, data: JSON.stringify(error) });
  }
};

export const reExecuteTest = (wId, tId) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const { data } = await postRequest(`webapp/${wId}/test/${tId}/generate`);
    if (data.isSuccess) {
      dispatch({
        type: TYPES.API_SUCCESS,
        data: data.msg,
      });

      getWebAppList()(dispatch);
    } else {
      dispatch({ type: TYPES.API_ERROR, data: data.msg });
    }
  } catch (error) {
    dispatch({ type: TYPES.API_ERROR, data: JSON.stringify(error) });
  }
};

export const downloadTestReport = (wId, tId, tName) => async (dispatch) => {
  dispatch({ type: TYPES.API_REQUEST });
  try {
    const response = await fetch(`${API_HOST}webapp/${wId}/test/${tId}/download-report`);

    if (response.status === 404) {
      const data = await response.json();
      dispatch({ type: TYPES.API_ERROR, data: data.msg });
    } else {
      const blob = await response.blob();
      download(blob, `${tName}.zip`);
      dispatch({
        type: TYPES.API_SUCCESS,
        data: "Successfully initiated Test Report download!!!",
      });
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: TYPES.API_ERROR, data: JSON.stringify(error) });
  }
};
