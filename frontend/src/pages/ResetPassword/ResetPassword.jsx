import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, InputGroup } from "react-bootstrap";

import { validateEmail, validatePassword } from "../../helpers/validation.js";
import { userVerifyEmail, resetPassword } from "../../redux/actions/userAction.js";

import { showLoader, hideLoader } from "../../helpers/utils";

import "../Signup/Signup.scss";
import "../Login/Login.scss";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const defaultResetPasswordState = {
    emailError: false,
    pwdError: false,
    cnfPwdError: false,
    emailExists: false,
    emailMessage: "",
    passwordSuccess: false,
    passwordMessage: "",
  };

  const [resetPasswordState, setResetPasswordState] = useState(defaultResetPasswordState);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const userStore = useSelector((state) => state.userStore);
  const { appLoading } = userStore;

  const navigate = useNavigate();

  const verifyEmailHandler = async (e) => {
    e.preventDefault();

    let isEmailValid = true;

    if (validateEmail(email)) {
      // setEmailError(false);
      setResetPasswordState({
        ...resetPasswordState,
        emailError: false,
      });
    } else {
      // setEmailError(true);
      setResetPasswordState({
        ...resetPasswordState,
        emailError: true,
      });
      isEmailValid = false;
    }

    if (isEmailValid) {
      const emailVerification = await userVerifyEmail({
        userEmail: email,
      })(dispatch);

      if (emailVerification && typeof emailVerification === "object") {
        const { isSuccess, message } = emailVerification;
        setResetPasswordState({
          ...resetPasswordState,
          emailExists: isSuccess,
          emailMessage: message,
          passwordSuccess: true,
          passwordMessage: "",
        });
      }
    }
  };

  const verifyPasswordHandler = async (e) => {
    let isPasswordValid = true;

    if (validatePassword(password)) {
      setResetPasswordState({
        ...resetPasswordState,
        pwdError: false,
      });

      if (password === confirmPassword) {
        setResetPasswordState({
          ...resetPasswordState,
          cnfPwdError: false,
        });
      } else {
        setResetPasswordState({
          ...resetPasswordState,
          cnfPwdError: true,
        });
        isPasswordValid = false;
      }
    } else {
      setResetPasswordState({
        ...resetPasswordState,
        pwdError: true,
      });
      isPasswordValid = false;
    }

    if (isPasswordValid) {
      const passwordChange = await resetPassword({
        userEmail: email,
        password: password,
      })(dispatch);
      if (passwordChange && typeof passwordChange === "object") {
        const { isSuccess, message } = passwordChange;
        if (isSuccess) {
          setResetPasswordState({
            ...resetPasswordState,
            emailExists: false,
            emailMessage: false,
            passwordSuccess: true,
            passwordMessage: message,
          });

          toast.success(message);
          navigate("/login");
        } else {
          setResetPasswordState({
            ...resetPasswordState,
            passwordSuccess: false,
            passwordMessage: message,
          });
        }
      }
    }
  };

  const resetFormValues = () => {
    setResetPasswordState(defaultResetPasswordState);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  useEffect(() => {
    if (appLoading) showLoader();
    else hideLoader();
  }, [appLoading]);

  return (
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
              <form className="mx-1 mx-md-4">
                <div className="d-flex flex-row align-items-center mb-4">
                  <i className="fa fa-envelope fa-lg mt-2 me-3 fa-fw" />
                  <div className="form-outline flex-fill mb-0">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Email*"
                      disabled={resetPasswordState.emailExists}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.currentTarget.value);
                        setResetPasswordState({
                          ...resetPasswordState,
                          emailError: !validateEmail(e.currentTarget.value),
                        });
                      }}
                    />
                    {resetPasswordState.emailError && <small className="form-text text-danger">Please enter valid email address</small>}
                  </div>
                </div>
                {resetPasswordState.emailExists && (
                  <>
                    <InputGroup className="d-flex flex-row align-items-center mb-4">
                      <i className="fa fa-lock fa-lg mt-2 me-3 fa-fw" />
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control"
                        placeholder="Password*"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.currentTarget.value);
                          setResetPasswordState({
                            ...resetPasswordState,
                            pwdError: !validatePassword(e.currentTarget.value),
                            cnfPwdError: e.currentTarget.value !== confirmPassword,
                          });
                        }}
                      />
                      <InputGroup.Text
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "rgb(187, 187, 187)",
                          cursor: "pointer",
                        }}
                      >
                        <span className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </InputGroup.Text>
                      {resetPasswordState.pwdError && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="form-text small d-block"
                        >
                          Please enter combination of uppercase, lowercase and number. Minimum length is 6.
                        </Form.Control.Feedback>
                      )}
                    </InputGroup>

                    <InputGroup className="d-flex flex-row align-items-center mb-4">
                      <i className="fa fa-key fa-lg mt-2 me-3 fa-fw"></i>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Confirm Password*"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.currentTarget.value);
                          setResetPasswordState({
                            ...resetPasswordState,
                            cnfPwdError: password !== e.currentTarget.value,
                          });
                        }}
                      />
                      <InputGroup.Text
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "rgb(187, 187, 187)",
                          cursor: "pointer",
                        }}
                      >
                        <span className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </InputGroup.Text>
                      {resetPasswordState.cnfPwdError && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="small form-text d-block"
                        >
                          Password and confirm password are not matching
                        </Form.Control.Feedback>
                      )}
                      {resetPasswordState.passwordMessage && (
                        <Form.Control.Feedback
                          type={resetPasswordState.passwordSuccess ? "valid" : "invalid"}
                          className="small form-text d-block"
                        >
                          {resetPasswordState.passwordMessage}
                        </Form.Control.Feedback>
                      )}
                    </InputGroup>
                  </>
                )}
                {resetPasswordState.emailMessage && (
                  <div className="mb-2">
                    <small className={`form-text text-${resetPasswordState.emailExists ? "success" : "danger"}`}>
                      {resetPasswordState.emailMessage}
                    </small>{" "}
                    <small
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={resetFormValues}
                    >
                      Re-enter email
                    </small>
                  </div>
                )}
                {!resetPasswordState.emailExists && (
                  <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <button
                      type="button"
                      className={`btn btn-primary btn-lg`}
                      onClick={verifyEmailHandler}
                    >
                      Verify Email address
                    </button>
                  </div>
                )}
                {resetPasswordState.emailExists && (
                  <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <button
                      type="button"
                      className={`btn btn-primary btn-lg`}
                      onClick={verifyPasswordHandler}
                    >
                      Set Password
                    </button>
                  </div>
                )}

                <div className="form-check d-flex justify-content-center mb-3">
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account? <Link to={"/user/signup"}>Register</Link>
                  </p>
                </div>
                <div className="form-check d-flex justify-content-center mb-5">
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Already have an account? <Link to={"/user/login"}>Login</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;