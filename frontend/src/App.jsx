import React, { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./App.scss";
import { postRequest } from "./helpers/request.js";
import { hideLoader } from "./helpers/utils.js";
import { TYPES, logoutUser, restoreUser } from "./redux/actions/userAction.js";

import Loader from "./components/Loader/Loader.jsx";
import AuthLayout from "./components/AuthLayout/AuthLayout.jsx";

const WebAppWrapper = lazy(() => import("./pages/WebAppWrapper/WebAppWrapper.jsx"));
const Signup = lazy(() => import("./pages/Signup/Signup.jsx"));
const Login = lazy(() => import("./pages/Login/Login.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword.jsx"));
const EmailVerifier = lazy(() => import("./pages/EmailVerifier/EmailVerifier.jsx"));
const TestReport = lazy(() => import("./pages/TestReport/TestReport.jsx"));

const App = () => {
  const userStore = useSelector((state) => state.userStore);
  const { appLoading } = userStore;

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (userStore.token || userStore.refreshToken) {
        dispatch({ type: TYPES.LOGIN_USER_START });
        const { data } = await postRequest(
          `user/verify-token`,
          { validation: true },
          {
            headers: {
              "x-access-token": localStorage.getItem("token"),
              "x-refresh-token": localStorage.getItem("refreshToken"),
              changeOrigin: true,
            },
          }
        );

        if (!data.isSuccess) {
          await logoutUser()(dispatch);
        } else {
          restoreUser(data)(dispatch);
          // await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    })();
  }, []);

  let routes;
  if (userStore.token) {
    hideLoader();
    routes = (
      <Routes>
        <Route path="/" element={<AuthLayout />} >
          <Route path="/" element={<Navigate replace to="/web" />} />
          <Route path="/web" element={<WebAppWrapper />} />
          <Route path="/web/:wId" element={<WebAppWrapper />} />
          <Route path="/web/:wId/:tc" element={<WebAppWrapper />} />
          <Route path="/view/web/:wId/test/:tId" element={<TestReport />} />
        </Route>

        <Route path="/*" element={<Navigate replace to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/user/auth/:token" element={<EmailVerifier />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={<Navigate replace to="/user/login" />} />
      </Routes>
    );
  }

  return <Suspense fallback={<Loader />}>{appLoading ? <Loader /> : routes}</Suspense>;
};

export default App;
