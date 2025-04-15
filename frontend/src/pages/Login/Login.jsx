import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";

import { validateEmail, validatePassword } from "../../helpers/validation";
import { userLogin, clearAlert } from "../../redux/actions/userAction";
import { showLoader, hideLoader } from "../../helpers/utils";

import "../Signup/Signup.scss";
import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const userStore = useSelector((state) => state.userStore);
  const { appLoading, error, msg } = userStore;

  const notifySuccessLogin = () => toast.success("Login Successfulll!!!");

  useEffect(() => {
    if (msg && error) {
      toast.error(msg);
      clearAlert()(dispatch);
    }
  }, [msg]);

  const loginHandler = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (validateEmail(email)) {
      setEmailError(false);
    } else {
      setEmailError(true);
      isValid = false;
    }

    if (validatePassword(password)) {
      setPwdError(false);
    } else {
      setPwdError(true);
      isValid = false;
    }

    if (isValid) {
      await userLogin({
        email: email,
        password: password,
      }, notifySuccessLogin)(dispatch);

    }
  };

  useEffect(() => {
    if (appLoading) showLoader();
    else hideLoader();
  }, [appLoading]);

  const preventRefreshOnEnter = (e) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      loginHandler(e);
      return false;
    }
  };

  return (
    <>
      <div className="container center-container">
        <section id="formHolder">
          <div className="row">
            <div className="col-sm-6 brand">
              <div className="logo"></div>
              <div className="heading">
                <h2>
                  <b className="pink">WEB TEST</b> <b className="sky-blue">STUDIO</b>
                </h2>
                <p>
                  <small>EASY WAY OF TESTING WEB APPS</small>
                </p>
              </div>
            </div>

            <div className="col-sm-6 form">
              <div className="signup form-peice">
                <form
                  className="mx-1 mx-md-4"
                  onKeyUp={preventRefreshOnEnter}
                >
                  <div className="d-flex flex-row align-items-center mb-4">
                    <i className="fa fa-envelope fa-lg mt-2 me-3 fa-fw"></i>
                    <div className="form-outline flex-fill mb-0">
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Email*"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.currentTarget.value);
                          setEmailError(!validateEmail(e.currentTarget.value));
                        }}
                      />
                      {emailError && (
                        <small className="form-text text-danger">
                          Please enter valid email address
                          <br />
                          It should end with "@indegene.com"
                        </small>
                      )}
                    </div>
                  </div>

                  <InputGroup className="d-flex flex-row align-items-center mb-4">
                    <i className="fa fa-lock fa-lg mt-2 me-3 fa-fw"></i>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control"
                      placeholder="Password*"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.currentTarget.value);
                        setPwdError(!validatePassword(e.currentTarget.value));
                      }}
                    />
                    <InputGroup.Text
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "rgb(187, 187, 187)",
                        cursor: "pointer"
                      }}
                    >
                      <span className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </InputGroup.Text>
                    {pwdError && (
                      <Form.Control.Feedback type="invalid" className="form-text d-block">
                        Please enter combination of uppercase, lowercase and number. Minimum length is 6.
                      </Form.Control.Feedback>
                    )}
                  </InputGroup>

                  <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <button
                      type="button"
                      className={`btn btn-primary btn-lg ${appLoading ? "disabled" : ""}`}
                      onClick={loginHandler}
                    >
                      {appLoading ? "Logging In" : "Login"}
                    </button>
                  </div>

                  <div className="form-check d-flex justify-content-center">
                    <p className="small fw-bold mt-2 pt-1 mb-0">
                      Don't have an account? <Link to={"/user/signup"}>Register</Link>
                    </p>
                  </div>
                  <div className="form-check d-flex justify-content-center">
                    <p className="small fw-bold mt-2 pt-1 mb-0">
                      <Link to={"/user/reset-password"}>Reset Password</Link>
                    </p>
                    {/* <p className="small fw-bold mt-2 pt-1 mb-0 help">
                      <span
                        className="navbar-brand text-secondary"
                        target="_blank"
                        rel="noreferrer"
                        // href="https://indegene123.sharepoint.com/sites/WPS/SitePages/DSP-Editor.aspx?OR=Teams-HL&CT=1680672205605&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiIyOC8yMzAzMDUwMTExMCIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D"
                        id="logo"
                      >
                        <u>Need Help?</u>
                      </span>
                    </p> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Login;