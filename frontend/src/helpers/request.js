import axios from "axios";
import { API_HOST } from "../configs/api.js";

export const getRequest = async (
  url,
  headerContent = {
    headers: {
      "x-access-token": localStorage.getItem("token"),
      "x-refresh-token": localStorage.getItem("refreshToken"),
      changeOrigin: true,
    },
  }
) => {
  let response = await axios.get(`${API_HOST}${url}`, headerContent);

  if (response.data.msg === "Invalid token") {
    localStorage.clear();
  } else {
    const token = response.headers["x-access-token"];
    if (token) {
      const accesstoken = localStorage.getItem("token");
      if (token !== accesstoken) {
        localStorage.setItem("token", token);
      }
    }
  }
  return response;
};

export const postRequest = async (
  url,
  data = {},
  headerContent = {
    headers: {
      "x-access-token": localStorage.getItem("token"),
      "x-refresh-token": localStorage.getItem("refreshToken"),
      changeOrigin: true,
    },
  }
) => {
  let response = await axios.post(`${API_HOST}${url}`, data, headerContent);

  if (response.data.msg === "Invalid token") {
    localStorage.clear();
  } else {
    const token = response.headers["x-access-token"];
    if (token) {
      const accesstoken = localStorage.getItem("token");
      if (token !== accesstoken) {
        localStorage.setItem("token", token);
      }
    }
  }
  return response;
};

export const deleteRequest = async (
  url,
  data = {},
  headerContent = {
    headers: {
      "x-access-token": localStorage.getItem("token"),
      "x-refresh-token": localStorage.getItem("refreshToken"),
      changeOrigin: true,
    },
  }
) => {
  let response = await axios.delete(`${API_HOST}${url}`, {
    data,
    ...headerContent,
  });

  if (response.data.msg === "Invalid token") {
    localStorage.clear();
  } else {
    const token = response.headers["x-access-token"];
    if (token) {
      const accesstoken = localStorage.getItem("token");
      if (token !== accesstoken) {
        localStorage.setItem("token", token);
      }
    }
  }
  return response;
};
