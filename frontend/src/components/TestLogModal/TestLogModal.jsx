import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Badge, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { API_HOST } from "../../configs/api.js";
import { getWebAppList } from "../../redux/actions/webAppAction.js";

import "./TestLogModal.scss";
import MonacoEditor from "react-monaco-editor";
/*
- Need to show status in header
- Need to use un-editable monaco editor to render logs - to make it more scrollable and user friendly
*/

const TestLogModal = ({ testStatusConfig, shouldOpenModal, webAppId, testId, closeModal }) => {
  const [testLog, setTestLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const webAppStore = useSelector((state) => state.webAppStore);
  const [currentWebApp, currentTest] = useMemo(() => {
    console.log("Re-computed");
    const { webApps } = webAppStore;
    const cWebApp = webApps.find((w) => w._id === webAppId);
    const cTest = cWebApp.tests.find((t) => t._id === testId);
    return [cWebApp, cTest];
  }, [webAppId, testId]);

  const userStore = useSelector((state) => state.userStore);
  const { config } = userStore;

  const isTestInProgressOnModalOpen = currentTest.status === config.TEST_STATUS_OPTS.IN_PROGRESS;
  const [testStatus, setTestStatus] = useState(currentTest.status);

  const dispatch = useDispatch();

  let controller;
  const closeModalWithAbort = () => {
    if (controller) controller.abort("User exited test logs modal");
    closeModal();
  };

  const handleMonacoEditorLoad = (editor) => {
    editor.getAction("editor.action.formatDocument").run();
  };

  useEffect(() => {
    let interval = null;

    const setFetchLogsInterval = async () => {
      const fetchLogs = async () => {
        controller = new AbortController();
        const signal = controller.signal;
        try {
          setIsLoading(true);
          const url = `${API_HOST}webapp/${currentWebApp._id}/test/${currentTest._id}/test-log`;
          const { data } = await axios.get(url, { signal: signal });
          if (data.isSuccess) {
            setTestLog(data.testLog);
            setTestStatus(data.testStatus);

            if (data.testStatus !== config.TEST_STATUS_OPTS.IN_PROGRESS) {
              clearInterval(interval);
              interval = null;

              if (isTestInProgressOnModalOpen) {
                closeModalWithAbort();
                getWebAppList()(dispatch);

                if (data.testStatus === config.TEST_STATUS_OPTS.GENERATED) toast.success("Report generated successfully!!!");
                else if (data.testStatus === config.TEST_STATUS_OPTS.FAILED) toast.error("Report generation failed!!!");
              }
            }
          } else {
            console.log(data.msg);
          }
        } catch (err) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      };

      interval = setInterval(fetchLogs, 2000);
    };

    setFetchLogsInterval();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <Modal
      keyboard={false}
      show={shouldOpenModal}
      onHide={closeModalWithAbort}
      size="lg"
      id="test-log-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Test Logs</Modal.Title>
        <div className="text-primary small ms-3">
          <b>WebApp</b>: {currentWebApp.name}
          <b>{" | "}</b>
          <b>Test Category</b>: {currentTest.category}
          <br />
          <b>Test Name</b>: {currentTest.name}
          <br />
          <Badge
            bg={testStatusConfig[testStatus].bg}
            className={`${testStatusConfig[testStatus].className} ms-1`}
          >
            {testStatus}
          </Badge>
        </div>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? "Loading..." : "Rendered"}
        <div className="test-logs-container">
          {testLog && Array.isArray(testLog) && (
            <MonacoEditor
              height="100%"
              width="100%"
              language={null}
              value={testLog.join("\n").replaceAll("ESC", "")}
              theme="vs-dark"
              options={{
                readOnly: true,
                readOnlyMessage: "This editor is read only.",
                domReadOnly: true,
                folding: false,
              }}
              editorDidMount={handleMonacoEditorLoad}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TestLogModal;
