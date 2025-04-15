import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  validateName,
  validateEmail,
  validatePassword,
} from "../../helpers/validation.js";

import { clearAlert, setAlert } from "../../redux/actions/userAction.js";
import { postRequest } from "../../helpers/request";

import "./Signup.scss";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [cnfPwdError, setCnfPwdError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userStore = useSelector((state) => state.userStore);
  const { error, msg } = userStore;

  const dispatch = useDispatch();

  useEffect(() => {
    if (msg) {
      if(error) toast.error(msg);
      else toast.success(msg);
      clearAlert()(dispatch);
    }
  }, [msg]);

  const signupHandler = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (validateName(name)) {
      setNameError(false);
    } else {
      setNameError(true);
      isValid = false;
    }

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

    if (password === confirmPassword) {
      setCnfPwdError(false);
    } else {
      setCnfPwdError(true);
      isValid = false;
    }

    if (isValid) {
      try {
        const { data } = await postRequest(`user/signup`, {
          name: name,
          email: email,
          password: password,
        });

        setAlert(!data.isSuccess, data.msg)(dispatch);
      } catch (error) {
        setAlert(true, error)(dispatch);
      }
    }
  };

  return (
    <>
      {/* {msg && <ToastAlert error={error} msg={msg} />} */}
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
                    <i className="fa fa-user fa-lg mt-2 me-3 fa-fw"></i>
                    <div className="form-outline flex-fill mb-0">
                      <input
                        type="text"
                        id="name"
                        placeholder="Full Name*"
                        className="form-control"
                        value={name}
                        onChange={(e) => {
                          setName(e.currentTarget.value);
                          setNameError(!validateName(e.currentTarget.value));
                        }}
                      />
                      {nameError && (
                        <small className="form-text text-danger">
                          Name must have at least 6 characters.
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-row align-items-center mb-4">
                    <i className="fa fa-envelope fa-lg mt-2 me-3 fa-fw"></i>
                    <div className="form-outline flex-fill mb-0">
                      <input
                        type="email"
                        id="email"
                        placeholder="Email*"
                        className="form-control"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.currentTarget.value);
                          setEmailError(!validateEmail(e.currentTarget.value));
                        }}
                      />
                      {emailError && (
                        <small className="form-text text-danger">
                          Please enter valid email address.
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
                      placeholder="Password*"
                      className="form-control"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.currentTarget.value);
                        setPwdError(!validatePassword(e.currentTarget.value));
                        setCnfPwdError(e.currentTarget.value !== confirmPassword);
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
                      <Form.Control.Feedback type="invalid" className="form-text small d-block">
                        Uppercase, lowercase, 0-9 & min 6 chars
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
                        setCnfPwdError(password !== e.currentTarget.value);
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
                    {cnfPwdError && (
                      <Form.Control.Feedback type="invalid" className="form-text small d-block">
                        Password and confirm password are not matching
                      </Form.Control.Feedback>
                    )}
                  </InputGroup>
                  <div className="form-check  mb-2">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      value="true"
                      id="agree"
                      checked={true}
                      disabled={true}
                    />
                    <label className="form-check-label" htmlFor="form2Example3">
                      I agree all statements in{" "}
                      <a
                        href="https://www.indegene.com/privacy-policy"
                        target={"_blank"}
                        rel="noreferrer"
                      >
                        Terms of service
                      </a>
                    </label>
                  </div>

                  <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={signupHandler}
                    >
                      Register
                    </button>
                  </div>

                  <div className="form-check d-flex justify-content-center mb-5">
                    <p className="small fw-bold mt-2 pt-1 mb-0">
                      Already have an account?{" "}
                      <Link to={"/user/login"}>Login</Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Signup;