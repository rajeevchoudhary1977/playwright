import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import App from './App.jsx';
import reportWebVitals from './reportWebVitals.js';
import DataProvider from "./redux/store.js";

import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.min.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
        <ToastContainer
          pauseOnFocusLoss={false}
          autoClose={2500}
          position="bottom-right"
        />
      </DataProvider>
    </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
