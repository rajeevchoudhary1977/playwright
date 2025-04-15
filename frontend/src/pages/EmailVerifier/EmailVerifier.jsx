import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { showLoader, hideLoader } from "../../helpers/utils.js";
import { getRequest } from "../../helpers/request.js";

import "../Signup/Signup.scss";

const EmailVerifier = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState("Please wait");

  const { token } = useParams();

  useEffect(() => {
    // document.body.classList.add("login-page");
    (async () => {
      const { data } = await getRequest(`user/auth/${token}`, {
        headers: {
          changeOrigin: true,
        },
      });
      setIsLoading(false);
      setMsg(data.msg);
    })();

    // return () => {
    //   document.body.classList.remove("login-page");
    // };
  }, [token]);

  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading]);

  return (
    <div className="container center-container">
      <section id="formHolder">
        <div className="row">
          <div className="col-sm-6 brand">
            <div className="logo"></div>
            <div className="heading">
              <h2>
                <span className="pink">WEB TEST</span>{" "}
                <span className="sky-blue">STUDIO</span>
              </h2>
              <p>
                <small>EASY WAY OF TESTING WEBAPPS</small>
              </p>
            </div>
          </div>

          <div className="col-sm-6 form">
            <div className="signup form-peice">
              <form className="mx-1 mx-md-4">
                <div className="form-check d-flex justify-content-center mb-5">
                  <h4>{msg}</h4>
                  <p className="small fw-bold mt-2 pt-1 mb-0"></p>
                </div>
                <div className="form-check d-flex justify-content-center mb-5">
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    <Link to={"/user/login"}>Login Here</Link>
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

export default EmailVerifier;
