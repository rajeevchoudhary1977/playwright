import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { getUsersList, logoutUser } from "../../redux/actions/userAction";

import "./Header.scss";
import webTestStudioLogo from "../../images/webstudio_test-logo.png";
import { getSelectUserFromLS, getShowUserTestsFromLS } from "../../helpers/utils.js";
import { useEffect } from "react";

const Header = () => {
  const userStore = useSelector((state) => state.userStore);
  const { email, name, isAdmin, config, users } = userStore;

  const dispatch = useDispatch();
  const currentLocation = useLocation();

  useEffect(() => {
    if (!users) {
      getUsersList()(dispatch);
    }
  }, []);

  if (!config || !users) return <></>;

  const { POC } = config;

  const logoutHandler = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutUser()(dispatch);
    }
  };

  const shouldShowUserCreatedTestsText = !!(currentLocation.pathname.startsWith("/web") && isAdmin && getShowUserTestsFromLS());
  const shouldShowSelectUserText = !!(currentLocation.pathname.startsWith("/web") && isAdmin && getSelectUserFromLS());
  const selectedUser = shouldShowSelectUserText ? users.find((user) => user._id === getSelectUserFromLS()).name : null;
  const shouldShowAllTestsText = !!(isAdmin && currentLocation.pathname.startsWith("/web") && !shouldShowUserCreatedTestsText && !shouldShowSelectUserText);

  return (
    <header id="header">
      <div className="container-fluid d-flex align-items-center justify-content-between navbar-light bg-light">
        <nav className="navbar navbar-expand-lg ">
          <NavLink
            className="navbar-brand fst-italic"
            to={"/web"}
          >
            {/* <b className="blue-header">WEB TEST</b> <b className="pink-header">STUDIO</b> */}
            <img
              width="120%"
              src={webTestStudioLogo}
              alt="Web Test Studio Logo"
            />
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse"
            id="navbarNavDropdown"
          >
            <ul className="navbar-nav"></ul>
          </div>

          <form className="form-inline logout-btn">
            {shouldShowUserCreatedTestsText ? (
              <span
                className="me-4"
                style={{ color: "#034ea2" }}
              >
                You are viewing tests created only by <strong>you</strong>.
              </span>
            ) : shouldShowSelectUserText ? (
              <span
                className="me-4"
                style={{ color: "#034ea2" }}
              >
                You are viewing tests created only by <strong>{selectedUser}</strong>.
              </span>
            ) : shouldShowAllTestsText ? (
              <span
                className="me-4"
                style={{ color: "#034ea2" }}
              >
                You are viewing tests created by <strong>all users</strong>.
              </span>
            ) : (
              <></>
            )}
            <span title={`${email}${isAdmin ? ": You're an admin" : ""}`}>
              <span className={`fa-solid fa-lg ${isAdmin ? "fa-user-gear" : "fa-user"} me-2`} />
              <span>{name}</span>
            </span>
            <a
              style={{ color: "rgb(3, 78, 162)" }}
              className="mx-3"
              title="Contact Us"
              href={`mailto:${POC.join(", ")} ?subject=Web Test Studio Concern`}
            >
              <span className={`fa-solid fa-lg fa-circle-question`} />
            </a>
            <button
              className="btn btn-outline-danger my-2 my-sm-0 logout"
              type="button"
              onClick={logoutHandler}
            >
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
};

export default Header;
