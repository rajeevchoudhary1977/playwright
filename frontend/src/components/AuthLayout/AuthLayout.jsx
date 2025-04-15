import { Outlet } from "react-router-dom";

import Header from "../Header/Header.jsx";

const AuthLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default AuthLayout;
