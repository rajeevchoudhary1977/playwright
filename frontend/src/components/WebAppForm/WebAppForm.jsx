import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";

import { createWebApp, renameWebAppAction, updateWebAppEngagementAction } from "../../redux/actions/webAppAction.js";
import { getUsersList } from "../../redux/actions/userAction.js";
import { validateContentName } from "../../helpers/validation.js";
import { WEB_APP_FORM_TYPES } from "../../pages/WebApp/WebApp.jsx";

const WebAppForm = ({ closeModal, shouldOpenForm, formType, webAppId }) => {
  const webAppStore = useSelector((state) => state.webAppStore);
  const { webApps } = webAppStore;

  const userStore = useSelector((state) => state.userStore);
  const { config, users } = userStore;

  const currentWebApp = webAppId ? webApps.find((webApp) => webApp._id === webAppId) : null;

  const defaultName = [WEB_APP_FORM_TYPES.UPDATE_WEB_APP_NAME].includes(formType) && currentWebApp ? currentWebApp.name : "";

  const [name, setName] = useState(defaultName);
  const [isNameValid, setIsNameValid] = useState(true);

  const nameInputRef = useRef();

  const dispatch = useDispatch();

  const [engagement, setEngagement] = useState({
    value: currentWebApp ? currentWebApp.engagement : config.ENGAGEMENTS.at(0),
    label: currentWebApp ? currentWebApp.engagement : config.ENGAGEMENTS.at(0),
  });
  const [isEngagementValid, setIsEngagementValid] = useState(true);

  const createHandler = async () => {
    let isFormValid = true;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      nameInputRef.current.focus();
    }

    if (config.ENGAGEMENTS.includes(engagement.value)) {
      setIsEngagementValid(true);
    } else {
      setIsEngagementValid(false);
      isFormValid = false;
    }

    if (!isFormValid) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("engagement", engagement.value);

    createWebApp(formData, closeModal)(dispatch);
  };

  const renameWebAppHandler = (e) => {
    e.preventDefault();

    let isFormValid = true;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      nameInputRef.current.focus();
    }

    if (!isFormValid) return;

    const formData = new FormData();
    formData.append("name", name);

    renameWebAppAction(currentWebApp._id, formData, closeModal)(dispatch);
  };
  
  const updateWebAppEngagementHandler = (e) => {
    e.preventDefault();

    let isFormValid = true;

    if (config.ENGAGEMENTS.includes(engagement.value)) {
      setIsEngagementValid(true);
    } else {
      setIsEngagementValid(false);
      isFormValid = false;
    }

    if (!isFormValid) return;

    const formData = new FormData();
    formData.append("engagement", engagement.value);

    updateWebAppEngagementAction(currentWebApp._id, formData, closeModal)(dispatch);
  };

  const formViews = {
    [WEB_APP_FORM_TYPES.CREATE_WEB_APP]: () => (
      <Modal
        keyboard={false}
        show={shouldOpenForm}
        onHide={closeModal}
        size="lg"
        id="create-web-app-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Web Application</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="name"
            >
              <Form.Label>Web App Name</Form.Label>
              <Form.Control
                type="text"
                ref={nameInputRef}
                placeholder="Web App Name"
                value={name}
                isInvalid={!isNameValid}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsNameValid(validateContentName(e.target.value));
                }}
              />
              {!isNameValid && (
                <Form.Control.Feedback type="invalid">
                  Please provide a valid name.
                  <br />
                  {name.length >= 25 && <>The name exceeds the maximum limit: 25 characters!!</>}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Engagement</Form.Label>
              <Select
                value={engagement}
                options={config.ENGAGEMENTS.map((engagement) => ({ value: engagement, label: engagement }))}
                placeholder="Search Engagements"
                onChange={(selected) => {
                  setEngagement(selected);
                  setIsEngagementValid(config.ENGAGEMENTS.includes(selected.value));
                }}
              />
              {!isEngagementValid && <div className="border border-danger text-danger">Please select engagement from the dropdown!!</div>}
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeModal}
          >
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={createHandler}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    ),
    [WEB_APP_FORM_TYPES.UPDATE_WEB_APP_NAME]: () => (
      <Modal
        keyboard={false}
        show={shouldOpenForm}
        onHide={closeModal}
        size="lg"
        id="rename-web-app-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Rename Web Application</Modal.Title>
          <div className="text-primary small ms-3">
            <b>Engagement</b>: {currentWebApp.engagement}
            <br />
            <b>WebApp</b>: {currentWebApp.name}
          </div>
        </Modal.Header>
        <Form
          onSubmit={renameWebAppHandler}
          autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}
        >
          <Modal.Body>
            <Form.Group
              className="mb-3"
              controlId="name"
            >
              <Form.Label>Web App Name</Form.Label>
              <Form.Control
                type="text"
                ref={nameInputRef}
                placeholder="Web App Name"
                value={name}
                isInvalid={!isNameValid}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsNameValid(validateContentName(e.target.value));
                }}
              />
              {!isNameValid && (
                <Form.Control.Feedback type="invalid">
                  Please provide a valid name.
                  <br />
                  {name.length >= 25 && <>The name exceeds the maximum limit: 25 characters!!</>}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={currentWebApp.name.toLowerCase() === name.toLowerCase()}
            >
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    ),
    [WEB_APP_FORM_TYPES.UPDATE_WEB_APP_ENGAGEMENT]: () => (
      <Modal
        keyboard={false}
        show={shouldOpenForm}
        onHide={closeModal}
        size="lg"
        id="update-web-app-engagement-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Web Application Engagement</Modal.Title>
          <div className="text-primary small ms-3">
            <b>Engagement</b>: {currentWebApp.engagement}
            <br />
            <b>WebApp</b>: {currentWebApp.name}
          </div>
        </Modal.Header>
        <Form
          onSubmit={updateWebAppEngagementHandler}
          autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}
        >
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Engagement</Form.Label>
              <Select
                value={engagement}
                options={config.ENGAGEMENTS.map((engagement) => ({ value: engagement, label: engagement }))}
                placeholder="Search Engagements"
                onChange={(selected) => {
                  setEngagement(selected);
                  setIsEngagementValid(config.ENGAGEMENTS.includes(selected.value));
                }}
              />
              {!isEngagementValid && <div className="border border-danger text-danger">Please select engagement from the dropdown!!</div>}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              disabled={currentWebApp.engagement === engagement.value}
              type="submit"
            >
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    ),
  };

  return formViews[formType]();
};

export default WebAppForm;
