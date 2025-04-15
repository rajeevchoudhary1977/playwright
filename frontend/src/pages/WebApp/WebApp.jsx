import React, { useEffect, useState } from "react";
import { Col, Container, Row, OverlayTrigger, Popover, Card, ListGroup, Badge, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";

import WebAppForm from "../../components/WebAppForm/WebAppForm.jsx";
import TestForm from "../../components/TestForm/TestForm.jsx";
import CustomOverlayTrigger from "../../components/CustomOverlayTrigger/CustomOverlayTrigger.jsx";
import TestLogModal from "../../components/TestLogModal/TestLogModal.jsx";
import MoreOptions from "../../components/MoreOptions/MoreOptions.jsx";

import {
  showLoader,
  hideLoader,
  getCurrentEngagementFromLocalStorage,
  setCurrentEngagementFromLocalStorage,
  formatDate,
} from "../../helpers/utils.js";

import { TYPES, clearError, deleteTest, reExecuteTest, downloadTestReport, deleteWebAppAction } from "../../redux/actions/webAppAction.js";

import { getUsersList } from "../../redux/actions/userAction.js";

import "./WebApp.scss";

export const WEB_APP_FORM_TYPES = {
  CREATE_WEB_APP: "CREATE_WEB_APP",
  UPDATE_WEB_APP_ENGAGEMENT: "UPDATE_WEB_APP_ENGAGEMENT",
  SHARE_WEB_APP: "SHARE_WEB_APP",
  UPDATE_WEB_APP_NAME: "UPDATE_WEB_APP_NAME",
};

export const TEST_FORM_TYPES = {
  CREATE_TEST: "CREATE_TEST",
  UPDATE_TEST_NAME: "UPDATE_TEST_NAME",
  VIEW_TEST_CONFIG: "VIEW_TEST_CONFIG",
  CLONE_TEST_CONFIG: "CLONE_TEST_CONFIG",
};

const WebApp = () => {
  const [webAppFormState, setWebAppFormState] = useState({
    openForm: false,
    formType: WEB_APP_FORM_TYPES.CREATE_WEB_APP,
    wId: null,
  });

  const [testFormState, setTestFormState] = useState({
    openForm: false,
    formType: TEST_FORM_TYPES.CREATE_TEST,
    testId: null,
  });

  const [testLogModalState, setTestLogModalState] = useState({
    openModal: false,
    webAppId: null,
    testId: null,
  });

  const [moreOptionsModalState, setMoreOptionsModalState] = useState({
    openModal: false,
  });

  const dispatch = useDispatch();

  const webAppStore = useSelector((state) => state.webAppStore);
  const userStore = useSelector((state) => state.userStore);

  const { webApps, userTests, totalTests, error, msg, loading } = webAppStore;
  const { email, users, config, isAdmin } = userStore;

  const { wId, tc } = useParams();

  const currentWebAppId = wId || null;
  const currentTestCategory = tc || null;

  const navigate = useNavigate();

  const currentEngagement = getCurrentEngagementFromLocalStorage();
  const [engagementToFilter, setEngagementToFilter] = useState(
    currentEngagement
      ? {
          value: currentEngagement,
          label: `${currentEngagement} - ${webApps.filter((webApp) => webApp.engagement === currentEngagement).length}`,
        }
      : {
          value: config.ENGAGEMENTS.at(0),
          label: `${config.ENGAGEMENTS.at(0)} - ${webApps.filter((webApp) => webApp.engagement === config.ENGAGEMENTS.at(0))}`,
        }
  );

  const filteredWebApps =
    engagementToFilter && webApps ? webApps.filter((webApp) => webApp.engagement === engagementToFilter.value) : webApps ? webApps : null;

  const testStatusConfig = config
    ? {
        [config.TEST_STATUS_OPTS.IN_PROGRESS]: {
          bg: "warning",
          className: "text-dark",
        },
        [config.TEST_STATUS_OPTS.GENERATED]: {
          bg: "success",
          className: "",
        },
        [config.TEST_STATUS_OPTS.FAILED]: {
          bg: "danger",
          className: "",
        },
      }
    : {};

  useEffect(() => {
    if (loading) showLoader();
    else hideLoader();
  }, [loading]);

  useEffect(() => {
    (async () => {
      if (!users) {
        await getUsersList()(dispatch);
      }
    })();
  }, []);

  useEffect(() => {
    setEngagementToFilter(
      currentEngagement
        ? {
            value: currentEngagement,
            label: `${currentEngagement} - ${webApps.filter((webApp) => webApp.engagement === currentEngagement).length}`,
          }
        : {
            value: config.ENGAGEMENTS.at(0),
            label: `${config.ENGAGEMENTS.at(0)} - ${webApps.filter((webApp) => webApp.engagement === config.ENGAGEMENTS.at(0))}`,
          }
    );
  }, [webApps.length]);

  useEffect(() => {
    if (msg) {
      if (error) toast.error(msg);
      else toast.success(msg);

      clearError()(dispatch);
    }
  }, [error, msg]);

  const handleEngagementFilter = (selected) => {
    navigate(`/web`, { replace: true });
    setCurrentEngagementFromLocalStorage(selected.value);
    setEngagementToFilter(selected);
  };

  const openCreateWebAppForm = () => {
    setWebAppFormState({
      ...webAppFormState,
      openForm: true,
      formType: WEB_APP_FORM_TYPES.CREATE_WEB_APP,
      wId: null,
    });
  };

  const openUpdateWebAppNameForm = (e) => {
    const { wId } = e.currentTarget.dataset;
    setWebAppFormState({
      ...webAppFormState,
      openForm: true,
      formType: WEB_APP_FORM_TYPES.UPDATE_WEB_APP_NAME,
      wId: wId,
    });
  };

  const openUpdateWebAppEngagementForm = (e) => {
    const { wId } = e.currentTarget.dataset;
    setWebAppFormState({
      ...webAppFormState,
      openForm: true,
      formType: WEB_APP_FORM_TYPES.UPDATE_WEB_APP_ENGAGEMENT,
      wId: wId,
    });
  };

  const openShareWebAppForm = (e) => {
    toast.warning("Under development!!!");
    return;
    const { wId } = e.currentTarget.dataset;
    setWebAppFormState({
      ...webAppFormState,
      openForm: true,
      formType: WEB_APP_FORM_TYPES.SHARE_WEB_APP,
      wId: wId,
    });
  };

  const closeWebAppForm = () => {
    setWebAppFormState({
      ...webAppFormState,
      openForm: false,
      formType: WEB_APP_FORM_TYPES.CREATE_WEB_APP,
      wId: null,
    });
  };

  const openCreateNewTestForm = () => {
    if (userTests >= config.TESTS_LIMIT) {
      toast.error("Tests limit per user reached. Please delete a test and retry.");
    } else {
      setTestFormState({
        ...testFormState,
        openForm: true,
        formType: TEST_FORM_TYPES.CREATE_TEST,
        testId: null,
      });
    }
  };

  const openViewTestConfigForm = (e) => {
    const { tId } = e.currentTarget.dataset;
    setTestFormState({
      ...testFormState,
      openForm: true,
      formType: TEST_FORM_TYPES.VIEW_TEST_CONFIG,
      testId: tId,
    });
  };

  const openCloneTestConfigForm = (e) => {
    if (userTests >= config.TESTS_LIMIT) {
      toast.error("Tests limit per user reached. Please delete a test and retry.");
    } else {
      const { tId } = e.currentTarget.dataset;
      setTestFormState({
        ...testFormState,
        openForm: true,
        formType: TEST_FORM_TYPES.CLONE_TEST_CONFIG,
        testId: tId,
      });
    }
  };

  const openUpdateTestNameReportForm = (e) => {
    const { tId } = e.currentTarget.dataset;
    setTestFormState({
      ...testFormState,
      openForm: true,
      formType: TEST_FORM_TYPES.UPDATE_TEST_NAME,
      testId: tId,
    });
  };

  const closeTestForm = () => {
    setTestFormState({
      ...testFormState,
      openForm: false,
      formType: TEST_FORM_TYPES.CREATE_TEST,
      testId: null,
    });
  };

  const deleteWebAppHandler = (e) => {
    const { wId, wName } = e.currentTarget.dataset;
    if (window.confirm(`Are you sure you wish to delete this Web App?\nWeb App: ${wName}`)) {
      deleteWebAppAction(wId)(dispatch);
    }
  };

  const openTestLogModal = (webAppId, testId) => {
    setTestLogModalState({
      ...testLogModalState,
      openModal: true,
      webAppId: webAppId,
      testId: testId,
    });
  };

  const closeTestLogModal = () => {
    setTestLogModalState({
      ...testLogModalState,
      openModal: false,
      webAppId: null,
      testId: null,
    });
  };

  const viewTestLogHandler = (e) => {
    const { wId, tId } = e.currentTarget.dataset;
    openTestLogModal(wId, tId);
  };

  const openMoreOptionsModalHandler = () => {
    setMoreOptionsModalState({
      ...moreOptionsModalState,
      openModal: true,
    });
  };
  const closeMoreOptionsModal = () => {
    setMoreOptionsModalState({
      ...moreOptionsModalState,
      openModal: false,
    });
  };

  const deleteTestHandler = async (e) => {
    const { tId, tName } = e.currentTarget.dataset;
    if (window.confirm(`Are you sure you wish to delete this test?\nTest: ${tName}`)) {
      deleteTest(currentWebAppId, tId)(dispatch);
    }
  };

  const reExecuteTestHandler = async (e) => {
    const { tId } = e.currentTarget.dataset;
    reExecuteTest(currentWebAppId, tId)(dispatch);
  };

  const downloadTestReportHandler = async (e) => {
    const { tId, tName } = e.currentTarget.dataset;
    downloadTestReport(currentWebAppId, tId, tName)(dispatch);
  };

  return (
    <>
      {webAppFormState.openForm && (
        <WebAppForm
          shouldOpenForm={webAppFormState.openForm}
          formType={webAppFormState.formType}
          webAppId={webAppFormState.wId}
          closeModal={closeWebAppForm}
        />
      )}
      {testFormState.openForm && (
        <TestForm
          shouldOpenForm={testFormState.openForm}
          formType={testFormState.formType}
          testId={testFormState.testId}
          webAppId={currentWebAppId}
          testCategory={currentTestCategory}
          closeModal={closeTestForm}
        />
      )}
      {testLogModalState.openModal && (
        <TestLogModal
          testStatusConfig={testStatusConfig}
          shouldOpenModal={testLogModalState.openModal}
          webAppId={testLogModalState.webAppId}
          testId={testLogModalState.testId}
          closeModal={closeTestLogModal}
        />
      )}
      {moreOptionsModalState.openModal && (
        <MoreOptions
          shouldOpenModal={moreOptionsModalState.openModal}
          closeModal={closeMoreOptionsModal}
        />
      )}
      {filteredWebApps && (
        <Container
          fluid
          className="web-app-page"
        >
          <Row>
            <Col
              xs={2}
              style={{ borderBottom: "1px solid #d0d0cf" }}
            >
              <Row style={{ marginRight: "0" }}>
                <Col>
                  <div className="modal-header mb-4">
                    <h3 className="modal-title">Web Applications</h3>
                    <button
                      className="btn btn-primary create-web-app-btn"
                      onClick={openCreateWebAppForm}
                    >
                      + New Web App
                    </button>
                  </div>
                </Col>
                {engagementToFilter && (
                  <Col
                    className="engagement-filter-container"
                    title={`${engagementToFilter.value} - ${webApps.filter((webApp) => webApp.engagement === engagementToFilter.value).length}`}
                  >
                    <Select
                      value={engagementToFilter}
                      options={config.ENGAGEMENTS.map((engagement) => ({
                        value: engagement,
                        label: `${engagement} - ${webApps.filter((webApp) => webApp.engagement === engagement).length}`,
                      }))}
                      placeholder="Search Engagements"
                      onChange={handleEngagementFilter}
                      styles={{
                        container: (baseStyles) => ({
                          ...baseStyles,
                          width: "100%",
                          height: "100%",
                          paddingBottom: "10px",
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          fontSize: "11px",
                          borderRadius: "0px",
                          height: "100%",
                          color: "#000",
                          cursor: "pointer",
                          ":hover": {
                            backgroundColor: "#034ea2",
                            border: "1px solid #034ea2 !important",
                            color: "#fff",
                          },
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: "inherit",
                        }),
                        option: (baseStyles) => ({
                          ...baseStyles,
                          fontSize: "11px",
                        }),
                        dropdownIndicator: (baseStyles, state) => {
                          const styles = {
                            ...baseStyles,
                            padding: "0px",
                            ":hover": {
                              color: "hsl(0, 0%, 80%)",
                            },
                          };
                          if (state.isFocused) {
                            styles.color = "hsl(0, 0%, 80%)";
                          }
                          return styles;
                        },
                        indicatorSeparator: (baseStyles) => ({
                          ...baseStyles,
                          display: "none",
                        }),
                      }}
                    />
                  </Col>
                )}
              </Row>
            </Col>
            <Col xs={10}>
              {currentWebAppId && filteredWebApps.find((webApp) => webApp._id === currentWebAppId) && (
                <div className="test-category-container">
                  {Object.keys(config.TEST_CATEGORIES).map((key) => (
                    <Link
                      key={key}
                      to={`/web/${currentWebAppId}/${key}`}
                      className={`btn ${currentTestCategory && currentTestCategory === key ? "active" : ""}`}
                    >
                      {config.TEST_CATEGORIES[key]} -{" "}
                      {
                        filteredWebApps
                          .find((webApp) => webApp._id === currentWebAppId)
                          .tests.filter((test) => test.category === config.TEST_CATEGORIES[key]).length
                      }
                    </Link>
                  ))}
                </div>
              )}
              <div className="ms-auto d-flex">
                {isAdmin && totalTests && (
                  <div className="total-test-num-container me-2 p-2">
                    <span className="me-2 fa-solid fa-chart-column" />
                    <span className="total-test-num">{totalTests}</span>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip>
                          Total no. of tests created by all users: <b>{totalTests}</b>.
                        </Tooltip>
                      }
                    >
                      <span className="ms-2 fa-solid fa-circle-info" />
                    </OverlayTrigger>
                  </div>
                )}
                <div className="user-test-num-container me-2 p-2">
                  <span className="me-2 fa-solid fa-user" />
                  <span className="user-test-num">{userTests}</span>
                  <span> / </span>
                  <span className="test-limit">{config.TESTS_LIMIT}</span>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip>
                        Total tests created by you: <b>{userTests}</b>.
                        <br />
                        You can create only <b>{config.TESTS_LIMIT}</b> tests.
                        <br />
                        If you wish to create more than <b>{config.TESTS_LIMIT}</b> tests, take backup of any one test and delete it to free more
                        space.
                      </Tooltip>
                    }
                  >
                    <span className="ms-2 fa-solid fa-circle-info" />
                  </OverlayTrigger>
                </div>
                <button
                  className="btn more-options"
                  title="More Options"
                  onClick={openMoreOptionsModalHandler}
                >
                  <span className="fa-solid fa-gear" />
                </button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <div className="web-apps-container bg-white text-dark p-2">
                <div className="web-apps-collection d-grid gap-2">
                  {filteredWebApps.map((webApp) => (
                    <Link
                      key={webApp._id}
                      data-web-app-id={webApp._id}
                      title={webApp.name}
                      className={`btn btn-light d-flex justify-content-between ${currentWebAppId === webApp._id ? "active" : ""}`}
                      to={`/web/${webApp._id}/${currentTestCategory ? currentTestCategory : Object.keys(config.TEST_CATEGORIES).at(0)}`}
                    >
                      <div className="small web-app-name">{webApp.name}</div>
                      <div className="d-flex align-items-center">
                        <span
                          className="badge text-bg-primary me-2"
                          title={`${webApp.tests.length} test${webApp.tests.length === 1 ? "" : "s"}`}
                        >
                          {webApp.tests.length}
                        </span>
                        {currentWebAppId === webApp._id && !webAppFormState.openForm && (
                          <CustomOverlayTrigger
                            prefix="web-app"
                            actions={
                              <>
                                <div
                                  data-w-id={webApp._id}
                                  className="web-app-menu-item update-web-app-name px-2 py-1"
                                  onClick={openUpdateWebAppNameForm}
                                >
                                  <span className="fa-solid fa-pen-to-square"></span>
                                  <span className="ms-2">Update Web App Name</span>
                                </div>
                                <div
                                  data-w-id={webApp._id}
                                  className="web-app-menu-item share-web-app px-2 py-1"
                                  onClick={openShareWebAppForm}
                                >
                                  <span className="fa-solid fa-share-nodes"></span>
                                  <span className="ms-2">Share Web App</span>
                                </div>
                                <div
                                  data-w-id={webApp._id}
                                  data-w-name={webApp.name}
                                  className="web-app-menu-item delete-web-app px-2 py-1"
                                  onClick={deleteWebAppHandler}
                                >
                                  <span className="fa fa-trash"></span>
                                  <span className="ms-2">Delete Web App</span>
                                </div>
                                <div
                                  data-w-id={webApp._id}
                                  className="web-app-menu-item px-2 py-1"
                                  style={{ cursor: isAdmin ? "pointer" : "auto" }}
                                  onClick={(e) => {
                                    if (isAdmin) {
                                      openUpdateWebAppEngagementForm(e);
                                    }
                                  }}
                                  title={`${isAdmin ? "Update Engagement" : "Current Engagement"}`}
                                >
                                  <span className="fa fa-sitemap"></span>
                                  <span className="ms-2">{webApp.engagement}</span>
                                </div>
                                <div
                                  className="web-app-menu-item d-flex px-2 py-1"
                                  onClick={async () => {
                                    document.body.click();
                                    await navigator.clipboard.writeText(webApp.user.email);
                                    dispatch({ type: TYPES.API_SUCCESS, data: "Copied creator email!" });
                                  }}
                                  title={`Creator${webApp.user.isAdmin ? " (Admin)" : ""}:\n${webApp.user.name}\n${webApp.user.email}`}
                                >
                                  <span className={`fa-solid ${webApp.user.isAdmin ? "fa-user-gear" : "fa-user"} d-flex align-items-center`}></span>
                                  <span className="ms-2 web-app-creator-name">{webApp.user.name}</span>
                                </div>
                                <div
                                  className="web-app-menu-item web-app-date px-2 py-1"
                                  style={{ cursor: "auto" }}
                                  title="Created On"
                                >
                                  <span className="fa-regular fa-calendar"></span>
                                  <span className="ms-2">{formatDate(webApp.createdAt)}</span>
                                </div>
                              </>
                            }
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Col>
            <Col xs={10}>
              <div className="tests-container bg-secondary-subtle text-dark rounded p-2">
                {(() => {
                  const newTestBtn = (
                    <>
                      {currentWebAppId && filteredWebApps.find((webApp) => webApp._id === currentWebAppId) && (
                        <div
                          className="btn_sec"
                          style={{ paddingBottom: "10px" }}
                        >
                          <button
                            style={{ height: "100%" }}
                            className="btn create-web-app-btn"
                            // disabled={currentTestCategory && !Object.keys(config.TEST_CATEGORIES).slice(0, 2).includes(currentTestCategory)}
                            disabled={
                              currentTestCategory && !["REGRESSION_TEST", "VISUAL_TEST", "MLR_PKG", "FUNCTIONAL_TEST"].includes(currentTestCategory)
                            }
                            onClick={openCreateNewTestForm}
                          >
                            + New Test
                          </button>
                        </div>
                      )}
                    </>
                  );

                  if (filteredWebApps.length === 0)
                    return (
                      <h5>
                        No Web Apps found matching the selected filter.
                        <br />
                        Please choose some other filter or create a new web app.
                      </h5>
                    );

                  if (!currentWebAppId) return <h5>Please select a Web App.</h5>;

                  if (!filteredWebApps.find((webApp) => webApp._id === currentWebAppId))
                    return (
                      <h5>
                        Web App not found in your collection.
                        <br />
                        Please select a Web App from your collection or create a new one.
                      </h5>
                    );

                  if (!currentTestCategory) return <h5>Please select a test category.</h5>;

                  if (!config.TEST_CATEGORIES[currentTestCategory])
                    return (
                      <h5>
                        Invalid test category selected.
                        <br />
                        Please select a valid test category.
                      </h5>
                    );

                  const currentWebApp = filteredWebApps.find((webApp) => webApp._id === currentWebAppId);

                  const filteredTests = currentWebApp.tests.filter((test) => test.category === config.TEST_CATEGORIES[currentTestCategory]);
                  if (filteredTests.length === 0) {
                    return (
                      <>
                        {newTestBtn}
                        <h5>
                          No Tests found. <br />
                          Please create a Test.
                        </h5>
                      </>
                    );
                  }

                  return (
                    <>
                      <div>{newTestBtn}</div>
                      <Row style={{ width: "100%" }}>
                        {filteredTests.map((test) => {
                          const isViewReportDisabled = [config.TEST_STATUS_OPTS.IN_PROGRESS].includes(test.status);
                          const isViewTestConfigDisabled = false;
                          const isCopyTestConfigToCurrentTestConfigDisabled = false;
                          const isRenameReportDisabled = [config.TEST_STATUS_OPTS.IN_PROGRESS].includes(test.status);
                          const isDownloadReportDisabled = [config.TEST_STATUS_OPTS.IN_PROGRESS].includes(test.status);
                          const isDeleteReportDisabled = [config.TEST_STATUS_OPTS.IN_PROGRESS].includes(test.status);
                          const isTestLogDisabled = false;
                          const isInfoReportDisabled = false;
                          const isShowRetryExecutionEnabled =
                            config.SHOW_RETRY_EXECUTION &&
                            config.SHOW_RETRY_EXECUTION_USERS.includes(email) &&
                            ![config.TEST_STATUS_OPTS.IN_PROGRESS].includes(test.status);

                          return (
                            <div
                              key={test._id}
                              className="col-2 mb-2 test-card"
                            >
                              <Card>
                                <Card.Body>
                                  <div className="thumbnail">
                                    <div className="small mb-1 test-name px-1 pt-1">{test.name}</div>
                                    <Badge
                                      bg={testStatusConfig[test.status].bg}
                                      className={`${testStatusConfig[test.status].className} ms-1`}
                                    >
                                      {test.status}
                                    </Badge>
                                    <div
                                      id={`options-${test._id}`}
                                      className="options"
                                    >
                                      <Link
                                        target="_blank"
                                        rel="noreferrer"
                                        to={`/view/web/${currentWebAppId}/test/${test._id}`}
                                        title="View Test Report"
                                        className={isViewReportDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-eye"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-t-id={`${test._id}`}
                                        title="View Test Config"
                                        onClick={openViewTestConfigForm}
                                        className={isViewTestConfigDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-gear"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-t-id={`${test._id}`}
                                        title="Clone Test Config"
                                        onClick={openCloneTestConfigForm}
                                        className={isCopyTestConfigToCurrentTestConfigDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-clone"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-t-id={`${test._id}`}
                                        onClick={openUpdateTestNameReportForm}
                                        title="Rename Report"
                                        className={isRenameReportDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-pen-to-square"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-t-id={`${test._id}`}
                                        data-t-name={`${test.name}`}
                                        title="Download Report"
                                        onClick={downloadTestReportHandler}
                                        className={isDownloadReportDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-download"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-w-id={`${currentWebApp._id}`}
                                        data-t-id={`${test._id}`}
                                        title="View Test Logs"
                                        onClick={viewTestLogHandler}
                                        className={isTestLogDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-list"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      <Link
                                        to="#"
                                        data-t-id={`${test._id}`}
                                        data-t-name={`${test.name}`}
                                        title="Delete Report"
                                        onClick={deleteTestHandler}
                                        className={isDeleteReportDisabled ? "disabled" : ""}
                                      >
                                        <button>
                                          <i
                                            className="fa-solid fa-trash"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </Link>
                                      {!isInfoReportDisabled && (
                                        <OverlayTrigger
                                          trigger={["click"]}
                                          rootClose
                                          placement="auto-start"
                                          overlay={
                                            <Popover>
                                              <Popover.Header as="h6">{test.name}</Popover.Header>
                                              <Popover.Body style={{ padding: "0px" }}>
                                                <ListGroup cariant="flush">
                                                  <ListGroup.Item>
                                                    <div
                                                      style={{ cursor: "pointer" }}
                                                      title={`Creator${test.user.isAdmin ? " (Admin)" : ""}:\n${test.user.name}\n${test.user.email}`}
                                                      onClick={async () => {
                                                        document.body.click();
                                                        await navigator.clipboard.writeText(test.user.email);
                                                        dispatch({ type: TYPES.API_SUCCESS, data: "Copied creator email!" });
                                                      }}
                                                    >
                                                      <span className={`fa ${test.user.isAdmin ? "fa-user-gear" : "fa-user"} me-2`} />
                                                      <span>{test.user.name}</span>
                                                    </div>
                                                  </ListGroup.Item>
                                                  <ListGroup.Item>
                                                    <div>
                                                      <span className="fa-regular fa-calendar me-2" />
                                                      <span>{formatDate(test.createdAt)}</span>
                                                    </div>
                                                  </ListGroup.Item>
                                                  {isShowRetryExecutionEnabled && (
                                                    <ListGroup.Item>
                                                      <div
                                                        style={{ cursor: "pointer" }}
                                                        data-t-id={`${test._id}`}
                                                        title="Re-execute Test"
                                                        onClick={reExecuteTestHandler}
                                                      >
                                                        <span className="fa-solid fa-rotate-left me-2" />
                                                        <span>Re-execute Test</span>
                                                      </div>
                                                    </ListGroup.Item>
                                                  )}
                                                </ListGroup>
                                              </Popover.Body>
                                            </Popover>
                                          }
                                        >
                                          <button>
                                            <i
                                              className="fa fa-info-circle"
                                              aria-hidden="true"
                                            />
                                          </button>
                                        </OverlayTrigger>
                                      )}
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                          );
                        })}
                      </Row>
                    </>
                  );
                })()}
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default WebApp;
