import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Carousel, Col, Form, Image, InputGroup, Modal, Row } from "react-bootstrap";
import MonacoEditor, { monaco } from "react-monaco-editor";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
import Select from "react-select";
import axios from "axios";

import VisualTestInfoModal from "../VisualTestInfoModal/VisualTestInfoModal.jsx";
import {
  TooltipIsMobile,
  TooltipMainURL,
  TooltipPageByPage,
  ModalReferenceImgs,
  TooltipReferenceURL,
  TooltipScreenWidth,
  TooltipTestTimeout,
} from "../TestFormTooltips/TestFormTooltips.jsx";
import { TEST_FORM_TYPES } from "../../pages/WebApp/WebApp.jsx";
import { validateContentName, validateUrl } from "../../helpers/validation.js";
import { hideLoader, showLoader } from "../../helpers/utils.js";
import { getRequest } from "../../helpers/request.js";
import { createTest, updateTestNameAction } from "../../redux/actions/webAppAction.js";
import { DOMAIN } from "../../configs/api.js";
import DEVICES from "../../helpers/devices.json";

import "./TestForm.scss";

const TestForm = ({ closeModal, shouldOpenForm, formType, webAppId, testId, testCategory }) => {
  const webAppStore = useSelector((state) => state.webAppStore);
  const { webApps } = webAppStore;

  const userStore = useSelector((state) => state.userStore);
  const { config } = userStore;

  const currentWebApp = webAppId ? webApps.find((webApp) => webApp._id === webAppId) : null;

  const currentTest = testId ? currentWebApp.tests.find((test) => test._id === testId) : null;

  const defaultName = [TEST_FORM_TYPES.UPDATE_TEST_NAME, TEST_FORM_TYPES.VIEW_TEST_CONFIG].includes(formType) && currentTest ? currentTest.name : "";
  const defaultMainUrl =
    [TEST_FORM_TYPES.VIEW_TEST_CONFIG, TEST_FORM_TYPES.CLONE_TEST_CONFIG].includes(formType) && currentTest && currentTest.mainUrl
      ? currentTest.mainUrl
      : "";
  const defaultRefUrl =
    [TEST_FORM_TYPES.VIEW_TEST_CONFIG, TEST_FORM_TYPES.CLONE_TEST_CONFIG].includes(formType) && currentTest && currentTest.refUrl
      ? currentTest.refUrl
      : "";

  const defaultScreenWidth = "";

  const [name, setName] = useState(defaultName);
  const [isNameValid, setIsNameValid] = useState(true);

  const [regressionPageByPage, setRegressionPageByPage] = useState(false);

  const [mlrPageByPage, setMlrPageByPage] = useState(false);

  const [mainUrl, setMainUrl] = useState(defaultMainUrl);
  const [isMainUrlValid, setIsMainUrlValid] = useState(true);

  const [refUrl, setRefUrl] = useState(defaultRefUrl);
  const [isRefUrlValid, setIsRefUrlValid] = useState(true);

  const [jsonCode, setJsonCode] = useState("");
  const [playwrightConfigTsCode, setPlaywrightConfigTsCode] = useState("");
  const [functionalSpecTsCode, setFunctionalSpecTsCode] = useState("");

  const configJsonTab = "config-json",
    playwrightConfigTab = "playwright-config-ts";
  const [codeTab, setCodeTab] = useState(configJsonTab);

  const switchTab = (newTab) => setCodeTab(newTab);

  const [refImgs, setRefImgs] = useState([]);
  const [isRefImgsValid, setIsRefImgsValid] = useState(true);
  const [showImgsPreview, setShowImgsPreview] = useState(false);

  const [pageByPage, setPageByPage] = useState(false);
  const [pageByPageUrls, setPageByPageUrls] = useState([]);

  const [isMobile, setIsMobile] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSelectedDeviceValid, setIsSelectedDeviceValid] = useState(true);

  const [screenWidth, setScreenWidth] = useState(defaultScreenWidth);
  const [isScreenWidthValid, setIsScreenWidthValid] = useState(true);

  const testTimeoutOptions = [
    { value: 400000, label: "400000ms - 6 Minutes and 40 seconds" },
    { value: 450000, label: "450000ms - 7 Minutes and 30 seconds" },
    { value: 500000, label: "500000ms - 8 Minutes and 20 seconds" },
    { value: 4000000, label: "4000000ms - 1 Hours 6 Minutes 40 Seconds" },
  ];

  const defaultTestTimeout = testTimeoutOptions.at(0);
  const [testTimeout, setTestTimeout] = useState(defaultTestTimeout);
  const [isTestTimeoutValid, setIsTestTimeoutValid] = useState(true);

  const filteredDevices = useMemo(() => DEVICES.filter((device) => device.isMobile === isMobile), [isMobile]);

  const nameInputRef = useRef(null);
  const mainUrlInputRef = useRef(null);
  const refUrlInputRef = useRef(null);
  const refImgsInputRef = useRef(null);
  const deviceSelectRef = useRef(null);
  const screenWidthInputRef = useRef(null);
  const testTimeoutSelectRef = useRef(null);

  const dispatch = useDispatch();

  const handleMlrPageByPageChange = () => {
    const newMlrPageByPage = !mlrPageByPage;
    setMlrPageByPage((prev) => !prev);
    setIsMainUrlValid(true);
    if (newMlrPageByPage) {
      setMainUrl([]);
    } else {
      setMainUrl("");
    }
  };

  const handleMlrMainUrlChange = (e) => {
    if (mlrPageByPage) {
      const newMainUrls = e.currentTarget.value.split("\n");
      setMainUrl(newMainUrls);

      const areAllMainUrlsValid = newMainUrls.length > 0 && newMainUrls.every((url) => validateUrl(url));
      setIsMainUrlValid(areAllMainUrlsValid);
    } else {
      setMainUrl(e.currentTarget.value);
      setIsMainUrlValid(validateUrl(e.currentTarget.value));
    }
  };

  const handleRegressionPageByPageChange = () => {
    const newRegressionPageByPage = !regressionPageByPage;
    setRegressionPageByPage((prev) => !prev);
    setIsMainUrlValid(true);
    setIsRefUrlValid(true);
    if (newRegressionPageByPage) {
      setMainUrl([]);
      setRefUrl([]);
    } else {
      setMainUrl("");
      setRefUrl("");
    }
  };

  const handleRegressionMainUrlChange = (e) => {
    if (regressionPageByPage) {
      const newMainUrls = e.currentTarget.value.split("\n");
      setMainUrl(newMainUrls);

      const areAllMainUrlsValid = newMainUrls.length > 0 && newMainUrls.every((url) => validateUrl(url));
      const areAllRefUrlsValid = refUrl.length > 0 && refUrl.every((url) => validateUrl(url));

      setIsMainUrlValid(areAllMainUrlsValid && areAllRefUrlsValid && newMainUrls.length === refUrl.length);
      setIsRefUrlValid(areAllMainUrlsValid && areAllRefUrlsValid && newMainUrls.length === refUrl.length);
    } else {
      setMainUrl(e.currentTarget.value);
      setIsMainUrlValid(validateUrl(e.currentTarget.value));
    }
  };

  const handleRegressionRefUrlChange = (e) => {
    if (regressionPageByPage) {
      const newRefUrls = e.currentTarget.value.split("\n");
      setRefUrl(newRefUrls);

      const areAllRefUrlsValid = newRefUrls.length > 0 && newRefUrls.every((url) => validateUrl(url));
      const areAllMainUrlsValid = mainUrl.length > 0 && mainUrl.every((url) => validateUrl(url));

      setIsRefUrlValid(areAllMainUrlsValid && areAllRefUrlsValid && mainUrl.length === newRefUrls.length);
      setIsMainUrlValid(areAllMainUrlsValid && areAllRefUrlsValid && mainUrl.length === newRefUrls.length);
    } else {
      setRefUrl(e.currentTarget.value);
      setIsRefUrlValid(validateUrl(e.currentTarget.value));
    }
  };

  const handleTestTimeoutChange = (selected) => {
    if (selected && selected.value) {
      setTestTimeout(selected);
      setIsTestTimeoutValid(true);
    } else {
      setTestTimeout(null);
      setIsTestTimeoutValid(false);
    }
  };

  const handleScreenWidthChange = (e) => {
    if (e.currentTarget.value) {
      setScreenWidth(parseInt(e.currentTarget.value));
      setIsScreenWidthValid(true);
    } else {
      setScreenWidth(defaultScreenWidth);
      setIsScreenWidthValid(false);
    }
  };

  const validateSelectedDevice = (selected = selectedDevice) =>
    !!(selected?.value && filteredDevices.find((device) => device.device === selected.value));

  const handleDeviceChange = (selected) => {
    setSelectedDevice(selected);
    setIsSelectedDeviceValid(validateSelectedDevice(selected));

    const device = filteredDevices.find((d) => d.device === selected.value);
    if (device?.screen?.width) setScreenWidth(device.screen.width);
    else if (device?.viewport?.width) setScreenWidth(device.viewport.width);
    setIsScreenWidthValid(true);
  };

  const handleIsMobileChange = () => {
    setIsMobile((prev) => !prev);

    setSelectedDevice(null);
    setIsSelectedDeviceValid(true);

    setScreenWidth(defaultScreenWidth);
    setIsScreenWidthValid(true);
  };

  const handlePageByPageChange = (e) => {
    setPageByPage((prev) => !prev);
    setPageByPageUrls([]);
  };

  const handlePageByPageUrlsChange = (e) => {
    const { value } = e.currentTarget;
    const newPageByPageUrls = value.split("\n");
    setPageByPageUrls(newPageByPageUrls);
    // setIsRefImgsValid(newPageByPageUrls.length === refImgs.length);
  };

  const handleRefImgChange = (e) => {
    setRefImgs(Array.from(e.currentTarget.files));
    // if (pageByPage) {
    // setIsRefImgsValid(pageByPageUrls.length === e.currentTarget.files.length);
    // } else setIsRefImgsValid(e.currentTarget.files.length !== 0);
    setIsRefImgsValid(e.currentTarget.files.length !== 0);
  };

  const handleJsonCodeEditorChange = (newValue, e) => {
    setJsonCode(newValue);
  };

  const handlePlaywrightConfigCodeEditorChange = (newValue, e) => {
    setPlaywrightConfigTsCode(newValue);
  };

  const handleFunctionalSpecTsCodeEditorChange = (newValue, e) => {
    setFunctionalSpecTsCode(newValue);
  };

  const handleMonacoEditorLoad = (editor) => {
    editor.getAction("editor.action.formatDocument").run();
  };

  const fetchTestConfigJson = async ({ updateJson = false, loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/${currentWebApp._id}/test/${currentTest._id}/config-json`);
      if (data.isSuccess) {
        if (updateJson) setJsonCode(data.jsonText);
        return data.jsonText;
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const setRegressionPageByPageFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);
    console.log(json);

    if (Object.hasOwn(json, "regressionPageByPage")) {
      setRegressionPageByPage(JSON.parse(json.regressionPageByPage));
    } else {
      setRegressionPageByPage(false);
    }

    setMainUrl(json.mainUrl);
    setIsMainUrlValid(true);

    setRefUrl(json.refUrl);
    setIsRefUrlValid(true);
  };

  const setMlrPageByPageFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);
    console.log(json);

    if (Object.hasOwn(json, "mlrPageByPage")) {
      setMlrPageByPage(JSON.parse(json.mlrPageByPage));
    } else {
      setMlrPageByPage(false);
    }

    setMainUrl(json.mainUrl);
    setIsMainUrlValid(true);
  };

  const setPageByPageFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);

    if (json.pageByPage === "true" || json.pageByPage === true) {
      setPageByPage(true);
    } else setPageByPage(false);

    if (json.pageByPageUrls && Array.isArray(json.pageByPageUrls)) {
      setPageByPageUrls(json.pageByPageUrls);
    } else setPageByPageUrls([]);
  };

  const setIsMobileFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);

    if (json.isMobile && (json.isMobile === "true" || json.isMobile === true)) {
      setIsMobile(true);
    } else setIsMobile(false);
  };

  const setScreenWidthFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);

    if (json.screen_width) {
      setScreenWidth(json.screen_width);
      setIsScreenWidthValid(true);
    } else {
      setScreenWidth(defaultScreenWidth);
      setIsScreenWidthValid(false);
    }
  };

  const setTestTimeoutFromConfigJson = async (fetchOpts) => {
    const jsonText = await fetchTestConfigJson(fetchOpts);
    const json = JSON.parse(jsonText);

    const matchingTestTimeout = testTimeoutOptions.find((opt) => opt.value === json.testTimeout);
    if (json.testTimeout && matchingTestTimeout) {
      const optIndex = testTimeoutOptions.map((opt) => opt.value).indexOf(matchingTestTimeout.value);
      setTestTimeout(testTimeoutOptions.at(optIndex));
    } else {
      setTestTimeout({ value: null, label: "Test Timeout not found!!! Please check config.json" });
    }
    setIsTestTimeoutValid(true);
  };

  const setTestValuesFromConfigJson = async () => {
    await setPageByPageFromConfigJson({ loader: false });
    await setIsMobileFromConfigJson({ loader: false });
    await setScreenWidthFromConfigJson({ loader: false });
  };

  const resetTestDeviceSelections = async ({ loader = true }) => {
    if (loader) showLoader();
    await setIsMobileFromConfigJson({ loader: false });
    await fetchTestBrowserDevice({ loader: false });
    await setScreenWidthFromConfigJson({ loader: false });
    if (loader) hideLoader();
  };

  const fetchTestPlaywrightConfigTsCode = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/${currentWebApp._id}/test/${currentTest._id}/playwright-config`);
      if (data.isSuccess) {
        setPlaywrightConfigTsCode(data.codeText);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchTestUploadedImages = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/${currentWebApp._id}/test/${currentTest._id}/uploaded-images`);
      if (data.isSuccess) {
        setRefImgs(data.imageNames);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchTestFunctionalTsCode = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/${currentWebApp._id}/test/${currentTest._id}/functional-spec`);
      if (data.isSuccess) {
        setFunctionalSpecTsCode(data.codeText);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchTestBrowserDevice = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/${currentWebApp._id}/test/${currentTest._id}/browser-json`);
      if (data.isSuccess) {
        setSelectedDevice(data.device);

        const device = filteredDevices.find((d) => d.device === data.device.value);
        if (device?.screen?.width) setScreenWidth(device.screen.width);
        else if (device?.viewport?.width) setScreenWidth(device.viewport.width);
        setIsScreenWidthValid(true);
      } else if (data.deviceError) {
        setSelectedDevice({ value: null, label: "Device configuration not found!!! Please check playwright.config.ts" });
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchDefaultConfigJson = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/sample-config-json/${testCategory}`);
      if (data.isSuccess) {
        setJsonCode(data.jsonText);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchDefaultPlaywrightConfigTsCode = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/sample-playwright-config/${testCategory}`);
      if (data.isSuccess) {
        setPlaywrightConfigTsCode(data.codeText);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  const fetchDefaultFunctionalTsCode = async ({ loader = true }) => {
    if (loader) showLoader();
    try {
      const { data } = await getRequest(`webapp/sample-functional-spec/${testCategory}`);
      if (data.isSuccess) {
        setFunctionalSpecTsCode(data.codeText);
      } else {
        console.log(data.msg);
        toast.error(data.msg);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error");
    } finally {
      if (loader) hideLoader();
    }
  };

  useEffect(() => {
    (async () => {
      const categorizationForDefaultCodeFetch = {
        [config.TEST_CATEGORIES.REGRESSION_TEST]: {
          [TEST_FORM_TYPES.CREATE_TEST]: async () => {
            await fetchDefaultConfigJson({ loader: false });
            await fetchDefaultPlaywrightConfigTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.VIEW_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setRegressionPageByPageFromConfigJson({ loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await fetchTestPlaywrightConfigTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.CLONE_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setRegressionPageByPageFromConfigJson({ loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await fetchTestPlaywrightConfigTsCode({ loader: false });
          },
        },
        [config.TEST_CATEGORIES.VISUAL_TEST]: {
          [TEST_FORM_TYPES.CREATE_TEST]: async () => {
            await fetchDefaultConfigJson({ loader: false });
            // fetchDefaultPlaywrightConfigTsCode();
          },
          [TEST_FORM_TYPES.VIEW_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await fetchTestPlaywrightConfigTsCode({ loader: false });
            await fetchTestUploadedImages({ loader: false });
            await resetTestDeviceSelections({ loader: false });
          },
          [TEST_FORM_TYPES.CLONE_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await setTestValuesFromConfigJson({ loader: false });
            await resetTestDeviceSelections({ loader: false });
            // fetchTestPlaywrightConfigTsCode();
          },
        },
        [config.TEST_CATEGORIES.MLR_PKG]: {
          [TEST_FORM_TYPES.CREATE_TEST]: async () => {
            await fetchDefaultConfigJson({ loader: false });
            await fetchDefaultPlaywrightConfigTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.VIEW_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setMlrPageByPageFromConfigJson({ loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await fetchTestPlaywrightConfigTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.CLONE_TEST_CONFIG]: async () => {
            await fetchTestConfigJson({ updateJson: true, loader: false });
            await setMlrPageByPageFromConfigJson({ loader: false });
            await setTestTimeoutFromConfigJson({ loader: false });
            await fetchTestPlaywrightConfigTsCode({ loader: false });
          },
        },
        [config.TEST_CATEGORIES.FUNCTIONAL_TEST]: {
          [TEST_FORM_TYPES.CREATE_TEST]: async () => {
            await fetchDefaultFunctionalTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.VIEW_TEST_CONFIG]: async () => {
            await fetchTestFunctionalTsCode({ loader: false });
          },
          [TEST_FORM_TYPES.CLONE_TEST_CONFIG]: async () => {
            await fetchTestFunctionalTsCode({ loader: false });
          },
        },
      };

      try {
        showLoader();
        await categorizationForDefaultCodeFetch[config.TEST_CATEGORIES[testCategory]]?.[formType]?.();
      } catch (err) {
        console.log(err);
      } finally {
        hideLoader();
      }
    })();
  }, []);

 /* useMemo(() => {
    (async () => {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      const playwrightTypesURL = "https://cdn.jsdelivr.net/npm/playwright@1.40.1/types/test.d.ts";
      const { data: playwrightTypesCode } = await axios.get(playwrightTypesURL);

      const playwrightCoreTypesURL = "https://cdn.jsdelivr.net/npm/playwright-core@1.43.1/types/types.d.ts";
      const { data: playwrightCoreTypesCode } = await axios.get(playwrightCoreTypesURL);

      const processTypesURL = "https://cdn.jsdelivr.net/npm/@types/node@20.12.7/process.d.ts";
      const { data: processTypesCode } = await axios.get(processTypesURL);

      monaco.languages.typescript.typescriptDefaults.addExtraLib(playwrightTypesCode, playwrightTypesURL);

      monaco.languages.typescript.typescriptDefaults.addExtraLib(playwrightCoreTypesCode, playwrightCoreTypesURL);

      monaco.languages.typescript.typescriptDefaults.addExtraLib(processTypesCode, processTypesURL);

      const tsCompilerOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
      tsCompilerOptions.paths = {
        "@playwright/test": [playwrightTypesURL],
        "playwright-core": [playwrightCoreTypesURL],
      };

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsCompilerOptions);
    })();
  }, []);*/

  const updateTestNameHandler = (e) => {
    e.preventDefault();

    let isFormValid = true,
      firstIncorrectInputRef = null;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = nameInputRef;
    }

    if (!isFormValid) {
      firstIncorrectInputRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    updateTestNameAction(formData, webAppId, testId, closeModal)(dispatch);
  };

  const createRegressionTestHandler = async () => {
    let isFormValid = true,
      firstIncorrectInputRef = null;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = nameInputRef;
    }

    if (regressionPageByPage) {
      const areAllMainUrlsValid = mainUrl.length > 0 && mainUrl.every((url) => validateUrl(url));
      const areAllRefUrlsValid = refUrl.length > 0 && refUrl.every((url) => validateUrl(url));
      const areUrlsLengthSame = areAllMainUrlsValid && areAllRefUrlsValid && mainUrl.length === refUrl.length;
      if (!areAllMainUrlsValid) {
        setIsMainUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
      }
      if (!areAllRefUrlsValid) {
        setIsRefUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = refUrlInputRef;
      }
      if (!areUrlsLengthSame) {
        setIsMainUrlValid(false);
        setIsRefUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
      }
      if (areAllMainUrlsValid && areAllRefUrlsValid && areUrlsLengthSame) {
        setIsMainUrlValid(true);
        setIsRefUrlValid(true);
      }
    } else {
      if (validateUrl(mainUrl)) {
        setIsMainUrlValid(true);
      } else {
        setIsMainUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
      }

      if (validateUrl(refUrl)) {
        setIsRefUrlValid(true);
      } else {
        setIsRefUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = refUrlInputRef;
      }
    }

    if (testTimeout.value) {
      setIsTestTimeoutValid(true);
    } else {
      setIsTestTimeoutValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = testTimeoutSelectRef;
    }

    if (!isFormValid) {
      firstIncorrectInputRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", config.TEST_CATEGORIES[testCategory]);
    formData.append("regressionPageByPage", regressionPageByPage);
    formData.append("mainUrl", mainUrl);
    formData.append("refUrl", refUrl);
    formData.append("testTimeout", testTimeout.value);
    formData.append("jsonCode", jsonCode);
    formData.append("playwrightConfigTsCode", playwrightConfigTsCode);

    createTest(formData, webAppId, closeModal)(dispatch);
  };

  const createVisualTestHandler = async () => {
    let isFormValid = true,
      firstIncorrectInputRef = null;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = nameInputRef;
    }

    if (validateUrl(mainUrl)) {
      setIsMainUrlValid(true);
    } else {
      setIsMainUrlValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
    }

    if (refImgs.length > 0) {
      setIsRefImgsValid(true);
    } else {
      setIsRefImgsValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = refImgsInputRef;
    }

    if (validateSelectedDevice()) {
      setIsSelectedDeviceValid(true);
    } else {
      setIsSelectedDeviceValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = deviceSelectRef;
    }

    if (screenWidth) {
      setIsScreenWidthValid(true);
    } else {
      setIsScreenWidthValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = screenWidthInputRef;
    }

    if (testTimeout.value) {
      setIsTestTimeoutValid(true);
    } else {
      setIsTestTimeoutValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = testTimeoutSelectRef;
    }

    if (!isFormValid) {
      firstIncorrectInputRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", config.TEST_CATEGORIES[testCategory]);
    formData.append("mainUrl", mainUrl);
    formData.append("pageByPage", pageByPage);
    formData.append("pageByPageUrls", pageByPageUrls);
    for (const img of refImgs) {
      formData.append("refImgs", img);
    }
    formData.append("isMobile", isMobile);
    formData.append("selectedDevice", JSON.stringify(filteredDevices.find((deviceOpts) => deviceOpts.device === selectedDevice.value)));
    formData.append("screenWidth", screenWidth);
    formData.append("testTimeout", testTimeout.value);
    formData.append("jsonCode", jsonCode);
    // formData.append("playwrightConfigTsCode", playwrightConfigTsCode);

    // formData.entries().forEach((pair) => console.log(pair));
    // return;
    createTest(formData, webAppId, closeModal)(dispatch);
  };

  const createMlrPkgTestHandler = async () => {
    let isFormValid = true,
      firstIncorrectInputRef = null;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = nameInputRef;
    }

    if (mlrPageByPage) {
      const areAllMainUrlsValid = mainUrl.length > 0 && mainUrl.every((url) => validateUrl(url));
      if (!areAllMainUrlsValid) {
        setIsMainUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
      }
    } else {
      if (validateUrl(mainUrl)) {
        setIsMainUrlValid(true);
      } else {
        setIsMainUrlValid(false);
        isFormValid = false;
        if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
      }
    }

    if (testTimeout.value) {
      setIsTestTimeoutValid(true);
    } else {
      setIsTestTimeoutValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = testTimeoutSelectRef;
    }

    if (!isFormValid) {
      firstIncorrectInputRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", config.TEST_CATEGORIES[testCategory]);
    formData.append("mlrPageByPage", mlrPageByPage);
    formData.append("mainUrl", mainUrl);
    formData.append("testTimeout", testTimeout.value);
    formData.append("jsonCode", jsonCode);
    formData.append("playwrightConfigTsCode", playwrightConfigTsCode);

    createTest(formData, webAppId, closeModal)(dispatch);
  };

  const createFunctionalTestHandler = async () => {
    let isFormValid = true,
      firstIncorrectInputRef = null;

    if (validateContentName(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = nameInputRef;
    }

    if (validateUrl(mainUrl)) {
      setIsMainUrlValid(true);
    } else {
      setIsMainUrlValid(false);
      isFormValid = false;
      if (!firstIncorrectInputRef) firstIncorrectInputRef = mainUrlInputRef;
    }

    if (!isFormValid) {
      firstIncorrectInputRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", config.TEST_CATEGORIES[testCategory]);
    formData.append("mainUrl", mainUrl);
    formData.append("functionalSpecTsCode", functionalSpecTsCode);

    createTest(formData, webAppId, closeModal)(dispatch);
  };

  const updateTestNameForm = () => (
    <Modal
      keyboard={false}
      show={shouldOpenForm}
      onHide={closeModal}
      size="lg"
      id="publish-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Test Name</Modal.Title>
        <div className="text-primary small ms-3">
          <b>WebApp</b>: {currentWebApp.name}
          <b>{" | "}</b>
          <b>Test Category</b>: {testCategory}
          <br />
          <b>Test Name</b>: {currentTest.name}
          <br />
        </div>
      </Modal.Header>

      <Form
        onSubmit={updateTestNameHandler}
        autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}
      >
        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="name"
          >
            <Form.Label>Test Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Test Name"
              value={name}
              ref={nameInputRef}
              isInvalid={!isNameValid}
              onChange={(e) => {
                setName(e.currentTarget.value);
                setIsNameValid(validateContentName(e.currentTarget.value));
              }}
            />
            {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
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
            disabled={currentTest.name.toLowerCase() === name.toLowerCase()}
          >
            Update
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  switch (config.TEST_CATEGORIES[testCategory]) {
    case config.TEST_CATEGORIES.REGRESSION_TEST: {
      switch (formType) {
        case TEST_FORM_TYPES.CREATE_TEST: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Create New Test</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <br />
                  <b>Test Category</b>: {testCategory}
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="regression-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages?"
                      checked={regressionPageByPage}
                      onChange={handleRegressionPageByPageChange}
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <TooltipMainURL />
                    {regressionPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isMainUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={mainUrl.join("\n")}
                          ref={mainUrlInputRef}
                          onChange={handleRegressionMainUrlChange}
                        />
                        {!isMainUrlValid && (
                          <Form.Control.Feedback type="invalid">
                            Please provide valid URLs.
                            <br />
                            Please ensure the no. of main URLs is equal to ref URLs.
                          </Form.Control.Feedback>
                        )}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={mainUrl}
                          ref={mainUrlInputRef}
                          isInvalid={!isMainUrlValid}
                          onChange={handleRegressionMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="ref-url"
                  >
                    <Form.Label>Reference URL</Form.Label>
                    <TooltipReferenceURL />
                    {regressionPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isRefUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={refUrl.join("\n")}
                          ref={refUrlInputRef}
                          onChange={handleRegressionRefUrlChange}
                        />
                        {!isRefUrlValid && (
                          <Form.Control.Feedback type="invalid">
                            Please provide valid URLs.
                            <br />
                            Please ensure the no. of ref URLs is equal to main URLs.
                          </Form.Control.Feedback>
                        )}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={refUrl}
                          ref={refUrlInputRef}
                          isInvalid={!isRefUrlValid}
                          onChange={handleRegressionRefUrlChange}
                        />
                        {!isRefUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <TooltipTestTimeout />
                    <Select
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      onChange={handleTestTimeoutChange}
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                        }),
                      }}
                    />
                    {!isTestTimeoutValid && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="d-block"
                      >
                        Please select a Test Timeout Duration
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultConfigJson}
                              >
                                Fetch default config.json
                              </Button>
                              <MonacoEditor
                                key="json-editor"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultPlaywrightConfigTsCode}
                              >
                                Fetch default Playwright.config.ts
                              </Button>
                              <MonacoEditor
                                key="playwright-config-editor"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
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
                  onClick={createRegressionTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.UPDATE_TEST_NAME: {
          return updateTestNameForm();
        }

        case TEST_FORM_TYPES.VIEW_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>View Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="regression-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages?"
                      checked={regressionPageByPage}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    {regressionPageByPage ? (
                      <TextareaAutosize
                        className="form-control"
                        placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                        value={mainUrl.join("\n")}
                        disabled
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={mainUrl}
                        disabled
                      />
                    )}
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="ref-url"
                  >
                    <Form.Label>Reference URL</Form.Label>
                    {regressionPageByPage ? (
                      <TextareaAutosize
                        className="form-control"
                        placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                        value={refUrl.join("\n")}
                        disabled
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={refUrl}
                        disabled
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <Select
                      isDisabled
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: "#212529",
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                          backgroundColor: "#e9ecef",
                        }),
                      }}
                    />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <MonacoEditor
                                key="json-editor"
                                className="mt-2"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  readOnly: true,
                                  readOnlyMessage: "This editor is read only.",
                                  domReadOnly: true,
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <MonacoEditor
                                key="playwright-config-editor"
                                className="mt-2"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  readOnly: true,
                                  readOnlyMessage: "This editor is read only.",
                                  domReadOnly: true,
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.CLONE_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Clone Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="regression-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages?"
                      checked={regressionPageByPage}
                      onChange={handleRegressionPageByPageChange}
                    />
                    <Button
                      className="ms-2 mb-1"
                      onClick={setRegressionPageByPageFromConfigJson}
                    >
                      Reset to <b>{currentTest.name}</b> Page By Page, Main URL and Ref URL
                    </Button>
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <TooltipMainURL />
                    {regressionPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isMainUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={mainUrl.join("\n")}
                          ref={mainUrlInputRef}
                          onChange={handleRegressionMainUrlChange}
                        />
                        {!isMainUrlValid && (
                          <Form.Control.Feedback type="invalid">
                            Please provide valid URLs.
                            <br />
                            Please ensure the no. of main URLs is equal to ref URLs.
                          </Form.Control.Feedback>
                        )}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={mainUrl}
                          ref={mainUrlInputRef}
                          isInvalid={!isMainUrlValid}
                          onChange={handleRegressionMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="ref-url"
                  >
                    <Form.Label>Reference URL</Form.Label>
                    <TooltipReferenceURL />
                    {regressionPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isRefUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={refUrl.join("\n")}
                          ref={refUrlInputRef}
                          onChange={handleRegressionRefUrlChange}
                        />
                        {!isRefUrlValid && (
                          <Form.Control.Feedback type="invalid">
                            Please provide valid URLs.
                            <br />
                            Please ensure the no. of ref URLs is equal to main URLs.
                          </Form.Control.Feedback>
                        )}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={refUrl}
                          ref={refUrlInputRef}
                          isInvalid={!isRefUrlValid}
                          onChange={handleRegressionRefUrlChange}
                        />
                        {!isRefUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <TooltipTestTimeout />
                    <Button
                      className="ms-2 mb-1"
                      onClick={async () => {
                        await setTestTimeoutFromConfigJson({ loader: true });
                      }}
                    >
                      Reset to <b>{currentTest.name}</b> Test Timeout
                    </Button>
                    <Select
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      onChange={handleTestTimeoutChange}
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                        }),
                      }}
                    />
                    {!isTestTimeoutValid && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="d-block"
                      >
                        Please select a Test Timeout Duration
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultConfigJson}
                              >
                                Fetch default config.json
                              </Button>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={() => fetchTestConfigJson({ loader: true, updateJson: true })}
                              >
                                Fetch <b>{currentTest.name}</b> config.json
                              </Button>
                              <MonacoEditor
                                key="json-editor"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultPlaywrightConfigTsCode}
                              >
                                Fetch default Playwright.config.ts
                              </Button>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchTestPlaywrightConfigTsCode}
                              >
                                Fetch <b>{currentTest.name}</b> Playwright.config.ts
                              </Button>
                              <MonacoEditor
                                key="playwright-config-editor"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
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
                  onClick={createRegressionTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        default: {
          return <></>;
        }
      }
    }

    case config.TEST_CATEGORIES.VISUAL_TEST: {
      switch (formType) {
        case TEST_FORM_TYPES.CREATE_TEST: {
          return (
            <>
              <Modal
                keyboard={false}
                show={shouldOpenForm}
                onHide={closeModal}
                size="lg"
                id="publish-modal"
                backdrop="static"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Create New Test</Modal.Title>
                  <div className="text-primary small ms-3">
                    <b>WebApp</b>: {currentWebApp.name}
                    <br />
                    <b>Test Category</b>: {testCategory}
                  </div>
                </Modal.Header>

                <Modal.Body>
                  <VisualTestInfoModal />
                  <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                    <Form.Group
                      className="mb-3"
                      controlId="name"
                    >
                      <Form.Label>Test Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Test Name"
                        value={name}
                        ref={nameInputRef}
                        isInvalid={!isNameValid}
                        onChange={(e) => {
                          setName(e.currentTarget.value);
                          setIsNameValid(validateContentName(e.currentTarget.value));
                        }}
                      />
                      {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="main-url"
                    >
                      <Form.Label>Main URL</Form.Label>
                      <TooltipMainURL />
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={mainUrl}
                        ref={mainUrlInputRef}
                        isInvalid={!isMainUrlValid}
                        onChange={(e) => {
                          setMainUrl(e.currentTarget.value);
                          setIsMainUrlValid(validateUrl(e.currentTarget.value));
                        }}
                      />
                      {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group
                      className={`mb-${pageByPage ? "1" : "3"}`}
                      controlId="page-by-page"
                    >
                      <Form.Check
                        type="switch"
                        inline
                        label={"Compare Certain Pages?"}
                        checked={pageByPage}
                        onChange={handlePageByPageChange}
                      />
                      <TooltipPageByPage />
                    </Form.Group>

                    {pageByPage && (
                      <Form.Group
                        className="mb-3"
                        controlId="page-by-page-urls"
                      >
                        <Form.Label>Page URLs</Form.Label>
                        <TextareaAutosize
                          className="form-control"
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={pageByPageUrls.join("\n")}
                          onChange={handlePageByPageUrlsChange}
                        />
                      </Form.Group>
                    )}

                    <Form.Group
                      className="mb-3"
                      controlId="ref-imgs"
                    >
                      <Form.Label>Reference Screenshots{refImgs.length > 0 ? `: ${refImgs.length} uploaded` : ""}</Form.Label>
                      <ModalReferenceImgs />
                      <InputGroup>
                        <Form.Control
                          type="file"
                          multiple
                          accept=".png"
                          placeholder="Upload Reference Screenhsots"
                          ref={refImgsInputRef}
                          isInvalid={!isRefImgsValid}
                          onChange={handleRefImgChange}
                        />
                        <InputGroup.Text
                          style={{ cursor: refImgs.length > 0 ? "pointer" : "not-allowed" }}
                          className={`fa ${refImgs.length > 0 ? "fa-eye" : "fa-eye-slash"}`}
                          onClick={() => {
                            if (refImgs.length > 0) {
                              setShowImgsPreview(true);
                            }
                          }}
                        />
                        {!isRefImgsValid ? (
                          pageByPage && pageByPageUrls.length !== refImgs.length ? (
                            <Form.Control.Feedback type="invalid">Please ensure no. of images and no. of page URLs is same.</Form.Control.Feedback>
                          ) : (
                            refImgs.length === 0 && <Form.Control.Feedback type="invalid">Please upload at least one image.</Form.Control.Feedback>
                          )
                        ) : (
                          <></>
                        )}
                      </InputGroup>
                    </Form.Group>

                    <Form.Group
                      className="mb-1"
                      controlId="is-mobile"
                    >
                      <Form.Check
                        type="switch"
                        inline
                        label="Test for mobile?"
                        checked={isMobile}
                        onChange={handleIsMobileChange}
                      />
                      <TooltipIsMobile />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      as={Row}
                    >
                      <Form.Label column>Select Device</Form.Label>
                      <Select
                        ref={deviceSelectRef}
                        value={selectedDevice}
                        options={filteredDevices.map((deviceOpts) => ({
                          value: deviceOpts.device,
                          label: `${deviceOpts.device} | ${deviceOpts.name}`,
                        }))}
                        placeholder="Search Devices..."
                        onChange={handleDeviceChange}
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isSelectedDeviceValid ? { borderColor: "#dc3545" } : {}),
                          }),
                        }}
                      />
                      {!isSelectedDeviceValid && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="d-block"
                        >
                          Please select a device from the dropdown
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="screen-width"
                    >
                      <Form.Label>Screen Width</Form.Label>
                      <TooltipScreenWidth />
                      <Form.Control
                        type="number"
                        placeholder="Enter screen width in pixels..."
                        ref={screenWidthInputRef}
                        value={screenWidth}
                        isInvalid={!isScreenWidthValid}
                        onChange={handleScreenWidthChange}
                      />
                      {!isScreenWidthValid && <Form.Control.Feedback type="invalid">Please provide a valid Screen Width.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Test Timeout Duration</Form.Label>
                      <TooltipTestTimeout />
                      <Select
                        ref={testTimeoutSelectRef}
                        value={testTimeout}
                        options={testTimeoutOptions}
                        placeholder="Select Test Timeout Duration"
                        onChange={handleTestTimeoutChange}
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                          }),
                        }}
                      />
                      {!isTestTimeoutValid && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="d-block"
                        >
                          Please select a Test Timeout Duration
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Row>
                      <Col>
                        <Row>
                          <Col className="code-tabs d-flex justify-content-between">
                            <Button
                              className="w-100 me-2"
                              disabled={codeTab === configJsonTab}
                              onClick={() => switchTab(configJsonTab)}
                            >
                              Config JSON
                            </Button>
                            {/* <Button
                              className="w-100"
                              disabled={codeTab === playwrightConfigTab}
                              onClick={() => switchTab(playwrightConfigTab)}
                            >
                              Playwright Config TS
                            </Button> */}
                          </Col>
                        </Row>
                        <Row>
                          <Col className="code-tab-panels">
                            {codeTab === configJsonTab ? (
                              <Form.Group>
                                <Button
                                  variant="primary"
                                  className="ms-2 my-2"
                                  onClick={fetchDefaultConfigJson}
                                >
                                  Fetch default config.json
                                </Button>
                                <MonacoEditor
                                  key="json-editor"
                                  width="100%"
                                  height="500"
                                  language="json"
                                  theme="vs-dark"
                                  value={jsonCode}
                                  options={{
                                    formatOnPaste: true,
                                    formatOnType: true,
                                  }}
                                  onChange={handleJsonCodeEditorChange}
                                  editorDidMount={handleMonacoEditorLoad}
                                />
                              </Form.Group>
                            ) : (
                              // : codeTab === playwrightConfigTab ? (
                              //   <Form.Group>
                              //     <Button
                              //       variant="primary"
                              //       className="ms-2 my-2"
                              //       onClick={fetchDefaultPlaywrightConfigTsCode}
                              //     >
                              //       Fetch default Playwright.config.ts
                              //     </Button>
                              //     <MonacoEditor
                              //       key="playwright-config-editor"
                              //       width="100%"
                              //       height="500"
                              //       theme="vs-dark"
                              //       language="typescript"
                              //       value={playwrightConfigTsCode}
                              //       options={{
                              //         formatOnPaste: true,
                              //         formatOnType: true,
                              //       }}
                              //       onChange={handlePlaywrightConfigCodeEditorChange}
                              //       editorDidMount={handleMonacoEditorLoad}
                              //     />
                              //   </Form.Group>
                              // )
                              <></>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
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
                    onClick={createVisualTestHandler}
                  >
                    Create
                  </Button>
                </Modal.Footer>
              </Modal>
              {showImgsPreview && (
                <Modal
                  keyboard={false}
                  show={showImgsPreview}
                  onHide={() => setShowImgsPreview(false)}
                  size="xl"
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Reference Images Preview</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Carousel
                      data-bs-theme="dark"
                      interval={null}
                    >
                      {refImgs.map((refImgData) => (
                        <Carousel.Item
                          key={refImgData.name}
                          style={{ minHeight: "60vh" }}
                        >
                          <div className="d-flex justify-content-center">
                            <Image
                              fluid
                              src={URL.createObjectURL(refImgData)}
                              className="mx-auto"
                            />
                          </div>
                          <Carousel.Caption>{refImgData.name}</Carousel.Caption>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </Modal.Body>
                </Modal>
              )}
            </>
          );
        }

        case TEST_FORM_TYPES.UPDATE_TEST_NAME: {
          return updateTestNameForm();
        }

        case TEST_FORM_TYPES.VIEW_TEST_CONFIG: {
          return (
            <>
              <Modal
                keyboard={false}
                show={shouldOpenForm}
                onHide={closeModal}
                size="lg"
                id="publish-modal"
                backdrop="static"
              >
                <Modal.Header closeButton>
                  <Modal.Title>View Test Config</Modal.Title>
                  <div className="text-primary small ms-3">
                    <b>WebApp</b>: {currentWebApp.name}
                    <b>{" | "}</b>
                    <b>Test Category</b>: {currentTest.category}
                    <br />
                    <b>Test Name</b>: {currentTest.name}
                    <br />
                  </div>
                </Modal.Header>

                <Modal.Body>
                  <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                    <Form.Group
                      className="mb-3"
                      controlId="name"
                    >
                      <Form.Label>Test Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Test Name"
                        value={name}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="main-url"
                    >
                      <Form.Label>Main URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={mainUrl}
                        disabled
                      />
                    </Form.Group>

                    <Button
                      className="mb-3"
                      onClick={() => setShowImgsPreview(true)}
                    >
                      Preview Uploaded Images
                    </Button>

                    <Form.Group
                      className="mb-3"
                      as={Row}
                    >
                      <Form.Label column>Select Device</Form.Label>
                      <Select
                        ref={deviceSelectRef}
                        value={selectedDevice}
                        isDisabled
                        options={filteredDevices.map((deviceOpts) => ({
                          value: deviceOpts.device,
                          label: `${deviceOpts.device} | ${deviceOpts.name}`,
                        }))}
                        placeholder="Device configuration not found!!!"
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          singleValue: (baseStyles) => ({
                            ...baseStyles,
                            color: "#212529",
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isSelectedDeviceValid ? { borderColor: "#dc3545" } : {}),
                            backgroundColor: "#e9ecef",
                          }),
                        }}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="screen-width"
                    >
                      <Form.Label>Screen Width</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter screen width in pixels..."
                        ref={screenWidthInputRef}
                        value={screenWidth}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Test Timeout Duration</Form.Label>
                      <Select
                        isDisabled
                        ref={testTimeoutSelectRef}
                        value={testTimeout}
                        options={testTimeoutOptions}
                        placeholder="Select Test Timeout Duration"
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          singleValue: (baseStyles) => ({
                            ...baseStyles,
                            color: "#212529",
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                            backgroundColor: "#e9ecef",
                          }),
                        }}
                      />
                    </Form.Group>

                    <Row>
                      <Col>
                        <Row>
                          <Col className="code-tabs d-flex justify-content-between mb-2">
                            <Button
                              className="w-100 me-2"
                              disabled={codeTab === configJsonTab}
                              onClick={() => switchTab(configJsonTab)}
                            >
                              Config JSON
                            </Button>
                            <Button
                              className="w-100"
                              disabled={codeTab === playwrightConfigTab}
                              onClick={() => switchTab(playwrightConfigTab)}
                            >
                              Playwright Config TS
                            </Button>
                          </Col>
                        </Row>
                        <Row>
                          <Col className="code-tab-panels">
                            {codeTab === configJsonTab ? (
                              <Form.Group>
                                <MonacoEditor
                                  key="json-editor"
                                  width="100%"
                                  height="500"
                                  language="json"
                                  theme="vs-dark"
                                  value={jsonCode}
                                  options={{
                                    readOnly: true,
                                    readOnlyMessage: "This editor is read only.",
                                    domReadOnly: true,
                                    formatOnPaste: true,
                                    formatOnType: true,
                                  }}
                                  onChange={handleJsonCodeEditorChange}
                                  editorDidMount={handleMonacoEditorLoad}
                                />
                              </Form.Group>
                            ) : codeTab === playwrightConfigTab ? (
                              <Form.Group>
                                <MonacoEditor
                                  key="playwright-config-editor"
                                  width="100%"
                                  height="500"
                                  theme="vs-dark"
                                  language="typescript"
                                  value={playwrightConfigTsCode}
                                  options={{
                                    readOnly: true,
                                    readOnlyMessage: "This editor is read only.",
                                    domReadOnly: true,
                                    formatOnPaste: true,
                                    formatOnType: true,
                                  }}
                                  onChange={handlePlaywrightConfigCodeEditorChange}
                                  editorDidMount={handleMonacoEditorLoad}
                                />
                              </Form.Group>
                            ) : (
                              <></>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Form>
                </Modal.Body>

                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
              {showImgsPreview && (
                <Modal
                  keyboard={false}
                  show={showImgsPreview}
                  onHide={() => setShowImgsPreview(false)}
                  size="xl"
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Reference Images Preview</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Carousel
                      data-bs-theme="dark"
                      interval={null}
                    >
                      {refImgs.map((imageName) => (
                        <Carousel.Item
                          key={imageName}
                          style={{ minHeight: "60vh" }}
                        >
                          <div className="d-flex justify-content-center">
                            <Image
                              fluid
                              src={`${DOMAIN}/api/webapp/${currentWebApp._id}/test/${currentTest._id}/get-image/${imageName}`}
                              className="mx-auto"
                            />
                          </div>
                          <Carousel.Caption>{imageName}</Carousel.Caption>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </Modal.Body>
                </Modal>
              )}
            </>
          );
        }

        case TEST_FORM_TYPES.CLONE_TEST_CONFIG: {
          return (
            <>
              <Modal
                keyboard={false}
                show={shouldOpenForm}
                onHide={closeModal}
                size="lg"
                id="publish-modal"
                backdrop="static"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Clone Test Config</Modal.Title>
                  <div className="text-primary small ms-3">
                    <b>WebApp</b>: {currentWebApp.name}
                    <b>{" | "}</b>
                    <b>Test Category</b>: {currentTest.category}
                    <br />
                    <b>Test Name</b>: {currentTest.name}
                    <br />
                  </div>
                </Modal.Header>

                <Modal.Body>
                  <VisualTestInfoModal />
                  <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                    <Form.Group
                      className="mb-3"
                      controlId="name"
                    >
                      <Form.Label>Test Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Test Name"
                        value={name}
                        ref={nameInputRef}
                        isInvalid={!isNameValid}
                        onChange={(e) => {
                          setName(e.currentTarget.value);
                          setIsNameValid(validateContentName(e.currentTarget.value));
                        }}
                      />
                      {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="main-url"
                    >
                      <Form.Label>Main URL</Form.Label>
                      <TooltipMainURL />
                      <Button
                        className="ms-2 mb-1"
                        onClick={() => {
                          setMainUrl(currentTest.mainUrl);
                          setIsMainUrlValid(validateUrl(currentTest.mainUrl));
                        }}
                      >
                        Reset to <b>{currentTest.name}</b> Main URL
                      </Button>
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={mainUrl}
                        ref={mainUrlInputRef}
                        isInvalid={!isMainUrlValid}
                        onChange={(e) => {
                          setMainUrl(e.currentTarget.value);
                          setIsMainUrlValid(validateUrl(e.currentTarget.value));
                        }}
                      />
                      {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group
                      className={`mb-${pageByPage ? "1" : "3"}`}
                      controlId="page-by-page"
                    >
                      <Form.Check
                        type="switch"
                        inline
                        label={"Compare Certain Pages?"}
                        checked={pageByPage}
                        onChange={handlePageByPageChange}
                      />
                      <TooltipPageByPage />
                      <Button
                        className="ms-2"
                        onClick={setPageByPageFromConfigJson}
                      >
                        Reset to <b>{currentTest.name}</b> Page By Page Urls
                      </Button>
                    </Form.Group>

                    {pageByPage && (
                      <Form.Group
                        className="mb-3"
                        controlId="page-by-page-urls"
                      >
                        <Form.Label>Page URLs</Form.Label>
                        <TextareaAutosize
                          className="form-control"
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={pageByPageUrls.join("\n")}
                          onChange={handlePageByPageUrlsChange}
                        />
                      </Form.Group>
                    )}

                    <Form.Group
                      className="mb-3"
                      controlId="ref-imgs"
                    >
                      <Form.Label>Reference Screenshots{refImgs.length > 0 ? `: ${refImgs.length} uploaded` : ""}</Form.Label>
                      <ModalReferenceImgs />
                      <InputGroup>
                        <Form.Control
                          type="file"
                          multiple
                          accept=".png"
                          placeholder="Upload Reference Screenhsots"
                          ref={refImgsInputRef}
                          isInvalid={!isRefImgsValid}
                          onChange={handleRefImgChange}
                        />
                        <InputGroup.Text
                          style={{ cursor: refImgs.length > 0 ? "pointer" : "not-allowed" }}
                          className={`fa ${refImgs.length > 0 ? "fa-eye" : "fa-eye-slash"}`}
                          onClick={() => {
                            if (refImgs.length > 0) {
                              setShowImgsPreview(true);
                            }
                          }}
                        />
                        {!isRefImgsValid ? (
                          pageByPage && pageByPageUrls.length !== refImgs.length ? (
                            <Form.Control.Feedback type="invalid">Please ensure no. of images and no. of page URLs is same.</Form.Control.Feedback>
                          ) : (
                            refImgs.length === 0 && <Form.Control.Feedback type="invalid">Please upload at least one image.</Form.Control.Feedback>
                          )
                        ) : (
                          <></>
                        )}
                      </InputGroup>
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="is-mobile"
                    >
                      <Form.Check
                        type="switch"
                        inline
                        label="Test for mobile?"
                        checked={isMobile}
                        onChange={handleIsMobileChange}
                      />
                      <TooltipIsMobile />
                      <Button
                        className="ms-2"
                        onClick={resetTestDeviceSelections}
                      >
                        Reset to <b>{currentTest.name}</b> Device Selections
                      </Button>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Select Device</Form.Label>
                      {/* <Button
                        className="ms-2 mb-1"
                        onClick={fetchTestBrowserDevice}
                      >
                        Reset to <b>{currentTest.name}</b> Selected Device and Respective Screen Width
                      </Button> */}
                      <Select
                        ref={deviceSelectRef}
                        value={selectedDevice}
                        options={filteredDevices.map((deviceOpts) => ({
                          value: deviceOpts.device,
                          label: `${deviceOpts.device} | ${deviceOpts.name}`,
                        }))}
                        placeholder="Search Devices..."
                        onChange={handleDeviceChange}
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isSelectedDeviceValid ? { borderColor: "#dc3545" } : {}),
                          }),
                        }}
                      />
                      {!isSelectedDeviceValid && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="d-block"
                        >
                          Please select a device from the dropdown
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="screen-width"
                    >
                      <Form.Label>Screen Width</Form.Label>
                      <TooltipScreenWidth />
                      {/* <Button
                        className="ms-2 mb-1"
                        onClick={setScreenWidthFromConfigJson}
                      >
                        Reset to <b>{currentTest.name}</b> Screen Width
                      </Button> */}
                      <Form.Control
                        type="number"
                        placeholder="Enter screen width in pixels..."
                        ref={screenWidthInputRef}
                        value={screenWidth}
                        isInvalid={!isScreenWidthValid}
                        onChange={handleScreenWidthChange}
                      />
                      {!isScreenWidthValid && <Form.Control.Feedback type="invalid">Please provide a valid Screen Width.</Form.Control.Feedback>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Test Timeout Duration</Form.Label>
                      <TooltipTestTimeout />
                      <Button
                        className="ms-2 mb-1"
                        onClick={async () => {
                          await setTestTimeoutFromConfigJson({ loader: true });
                        }}
                      >
                        Reset to <b>{currentTest.name}</b> Test Timeout
                      </Button>
                      <Select
                        ref={testTimeoutSelectRef}
                        value={testTimeout}
                        options={testTimeoutOptions}
                        placeholder="Select Test Timeout Duration"
                        onChange={handleTestTimeoutChange}
                        styles={{
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 10,
                          }),
                          control: (baseStyles) => ({
                            ...baseStyles,
                            ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                          }),
                        }}
                      />
                      {!isTestTimeoutValid && (
                        <Form.Control.Feedback
                          type="invalid"
                          className="d-block"
                        >
                          Please select a Test Timeout Duration
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Row>
                      <Col>
                        <Row>
                          <Col className="code-tabs d-flex justify-content-between">
                            <Button
                              className="w-100 me-2"
                              disabled={codeTab === configJsonTab}
                              onClick={() => switchTab(configJsonTab)}
                            >
                              Config JSON
                            </Button>
                            {/* <Button
                              className="w-100"
                              disabled={codeTab === playwrightConfigTab}
                              onClick={() => switchTab(playwrightConfigTab)}
                            >
                              Playwright Config TS
                            </Button> */}
                          </Col>
                        </Row>
                        <Row>
                          <Col className="code-tab-panels">
                            {codeTab === configJsonTab ? (
                              <Form.Group>
                                <Button
                                  variant="primary"
                                  className="ms-2 my-2"
                                  onClick={fetchDefaultConfigJson}
                                >
                                  Fetch default config.json
                                </Button>
                                <Button
                                  variant="primary"
                                  className="ms-2 my-2"
                                  onClick={() => fetchTestConfigJson({ loader: true, updateJson: true })}
                                >
                                  Fetch <b>{currentTest.name}</b> config.json
                                </Button>
                                <MonacoEditor
                                  key="json-editor"
                                  width="100%"
                                  height="500"
                                  language="json"
                                  theme="vs-dark"
                                  value={jsonCode}
                                  options={{
                                    formatOnPaste: true,
                                    formatOnType: true,
                                  }}
                                  onChange={handleJsonCodeEditorChange}
                                  editorDidMount={handleMonacoEditorLoad}
                                />
                              </Form.Group>
                            ) : (
                              //  : codeTab === playwrightConfigTab ? (
                              //   <Form.Group>
                              //     <Button
                              //       variant="primary"
                              //       className="ms-2 my-2"
                              //       onClick={fetchDefaultPlaywrightConfigTsCode}
                              //     >
                              //       Fetch default Playwright.config.ts
                              //     </Button>
                              //     <Button
                              //       variant="primary"
                              //       className="ms-2 my-2"
                              //       onClick={fetchTestPlaywrightConfigTsCode}
                              //     >
                              //       Fetch <b>{currentTest.name}</b> Playwright.config.ts
                              //     </Button>
                              //     <MonacoEditor
                              //       key="playwright-config-editor"
                              //       width="100%"
                              //       height="500"
                              //       theme="vs-dark"
                              //       language="typescript"
                              //       value={playwrightConfigTsCode}
                              //       options={{
                              //         formatOnPaste: true,
                              //         formatOnType: true,
                              //       }}
                              //       onChange={handlePlaywrightConfigCodeEditorChange}
                              //       editorDidMount={handleMonacoEditorLoad}
                              //     />
                              //   </Form.Group>
                              // )
                              <></>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
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
                    onClick={createVisualTestHandler}
                  >
                    Create
                  </Button>
                </Modal.Footer>
              </Modal>
              {showImgsPreview && (
                <Modal
                  keyboard={false}
                  show={showImgsPreview}
                  onHide={() => setShowImgsPreview(false)}
                  size="xl"
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Reference Images Preview</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Carousel
                      data-bs-theme="dark"
                      interval={null}
                    >
                      {refImgs.map((refImgData) => (
                        <Carousel.Item
                          key={refImgData.name}
                          style={{ minHeight: "60vh" }}
                        >
                          <div className="d-flex justify-content-center">
                            <Image
                              fluid
                              src={URL.createObjectURL(refImgData)}
                              className="mx-auto"
                            />
                          </div>
                          <Carousel.Caption>{refImgData.name}</Carousel.Caption>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </Modal.Body>
                </Modal>
              )}
            </>
          );
        }

        default: {
          return <></>;
        }
      }
    }

    case config.TEST_CATEGORIES.MLR_PKG: {
      switch (formType) {
        case TEST_FORM_TYPES.CREATE_TEST: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Create New Test</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <br />
                  <b>Test Category</b>: {testCategory}
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="mlr-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages"
                      checked={mlrPageByPage}
                      onChange={handleMlrPageByPageChange}
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <TooltipMainURL />
                    {mlrPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isMainUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={mainUrl.join("\n")}
                          ref={mainUrlInputRef}
                          onChange={handleMlrMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide valid URLs.</Form.Control.Feedback>}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={mainUrl}
                          ref={mainUrlInputRef}
                          isInvalid={!isMainUrlValid}
                          onChange={handleMlrMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <TooltipTestTimeout />
                    <Select
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      onChange={handleTestTimeoutChange}
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                        }),
                      }}
                    />
                    {!isTestTimeoutValid && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="d-block"
                      >
                        Please select a Test Timeout Duration
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultConfigJson}
                              >
                                Fetch default config.json
                              </Button>
                              <MonacoEditor
                                key="json-editor"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultPlaywrightConfigTsCode}
                              >
                                Fetch default Playwright.config.ts
                              </Button>
                              <MonacoEditor
                                key="playwright-config-editor"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
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
                  onClick={createMlrPkgTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.UPDATE_TEST_NAME: {
          return updateTestNameForm();
        }

        case TEST_FORM_TYPES.VIEW_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>View Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="mlr-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages?"
                      checked={mlrPageByPage}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    {mlrPageByPage ? (
                      <TextareaAutosize
                        className="form-control"
                        placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                        value={mainUrl.join("\n")}
                        disabled
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        placeholder="e.g.: https://www.realpbctalk.com"
                        value={mainUrl}
                        disabled
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <Select
                      isDisabled
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: "#212529",
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                          backgroundColor: "#e9ecef",
                        }),
                      }}
                    />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between mb-2">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <MonacoEditor
                                key="json-editor"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  readOnly: true,
                                  readOnlyMessage: "This editor is read only.",
                                  domReadOnly: true,
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <MonacoEditor
                                key="playwright-config-editor"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  readOnly: true,
                                  readOnlyMessage: "This editor is read only.",
                                  domReadOnly: true,
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.CLONE_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Clone Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-1"
                    controlId="mlr-page-by-page"
                  >
                    <Form.Check
                      type="switch"
                      inline
                      label="Compare Certain Pages?"
                      checked={mlrPageByPage}
                      onChange={handleMlrPageByPageChange}
                    />
                    <Button
                      className="ms-2 mb-1"
                      onClick={setMlrPageByPageFromConfigJson}
                    >
                      Reset to <b>{currentTest.name}</b> Page By Page and Main URL
                    </Button>
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <TooltipMainURL />
                    {mlrPageByPage ? (
                      <>
                        <TextareaAutosize
                          className={`form-control ${!isMainUrlValid ? "is-invalid" : ""}`}
                          placeholder={`e.g.\nhttps://www.realpbctalk.com\nhttps://www.realpbctalk.com/about\nhttps://www.realpbctalk.com/users\netc...`}
                          value={mainUrl.join("\n")}
                          ref={mainUrlInputRef}
                          onChange={handleMlrMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide valid URLs.</Form.Control.Feedback>}
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          placeholder="e.g.: https://www.realpbctalk.com"
                          value={mainUrl}
                          ref={mainUrlInputRef}
                          isInvalid={!isMainUrlValid}
                          onChange={handleMlrMainUrlChange}
                        />
                        {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Test Timeout Duration</Form.Label>
                    <TooltipTestTimeout />
                    <Button
                      className="ms-2 mb-1"
                      onClick={async () => {
                        await setTestTimeoutFromConfigJson({ loader: true });
                      }}
                    >
                      Reset to <b>{currentTest.name}</b> Test Timeout
                    </Button>
                    <Select
                      ref={testTimeoutSelectRef}
                      value={testTimeout}
                      options={testTimeoutOptions}
                      placeholder="Select Test Timeout Duration"
                      onChange={handleTestTimeoutChange}
                      styles={{
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          zIndex: 10,
                        }),
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...(!isTestTimeoutValid ? { borderColor: "#dc3545" } : {}),
                        }),
                      }}
                    />
                    {!isTestTimeoutValid && (
                      <Form.Control.Feedback
                        type="invalid"
                        className="d-block"
                      >
                        Please select a Test Timeout Duration
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Row>
                    <Col>
                      <Row>
                        <Col className="code-tabs d-flex justify-content-between">
                          <Button
                            className="w-100 me-2"
                            disabled={codeTab === configJsonTab}
                            onClick={() => switchTab(configJsonTab)}
                          >
                            Config JSON
                          </Button>
                          <Button
                            className="w-100"
                            disabled={codeTab === playwrightConfigTab}
                            onClick={() => switchTab(playwrightConfigTab)}
                          >
                            Playwright Config TS
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="code-tab-panels">
                          {codeTab === configJsonTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultConfigJson}
                              >
                                Fetch default config.json
                              </Button>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={() => fetchTestConfigJson({ loader: true, updateJson: true })}
                              >
                                Fetch <b>{currentTest.name}</b> config.json
                              </Button>
                              <MonacoEditor
                                key="json-editor"
                                width="100%"
                                height="500"
                                language="json"
                                theme="vs-dark"
                                value={jsonCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handleJsonCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : codeTab === playwrightConfigTab ? (
                            <Form.Group>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchDefaultPlaywrightConfigTsCode}
                              >
                                Fetch default Playwright.config.ts
                              </Button>
                              <Button
                                variant="primary"
                                className="ms-2 my-2"
                                onClick={fetchTestPlaywrightConfigTsCode}
                              >
                                Fetch <b>{currentTest.name}</b> Playwright.config.ts
                              </Button>
                              <MonacoEditor
                                key="playwright-config-editor"
                                width="100%"
                                height="500"
                                theme="vs-dark"
                                language="typescript"
                                value={playwrightConfigTsCode}
                                options={{
                                  formatOnPaste: true,
                                  formatOnType: true,
                                }}
                                onChange={handlePlaywrightConfigCodeEditorChange}
                                editorDidMount={handleMonacoEditorLoad}
                              />
                            </Form.Group>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
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
                  onClick={createMlrPkgTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        default: {
          return <></>;
        }
      }
    }

    case config.TEST_CATEGORIES.FUNCTIONAL_TEST: {
      switch (formType) {
        case TEST_FORM_TYPES.CREATE_TEST: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Create New Test</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {testCategory}
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g.: https://www.realpbctalk.com"
                      value={mainUrl}
                      ref={mainUrlInputRef}
                      isInvalid={!isMainUrlValid}
                      onChange={(e) => {
                        setMainUrl(e.currentTarget.value);
                        setIsMainUrlValid(validateUrl(e.currentTarget.value));
                      }}
                    />
                    {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-block mb-1">Functional Spec Ts Code</Form.Label>
                    <Button
                      className="mb-2"
                      onClick={fetchDefaultFunctionalTsCode}
                    >
                      Fetch default Functional.spec.ts
                    </Button>
                    <MonacoEditor
                      key="functional-spec-editor"
                      width="100%"
                      height="500"
                      theme="vs-dark"
                      language="typescript"
                      value={functionalSpecTsCode}
                      options={{
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                      onChange={handleFunctionalSpecTsCodeEditorChange}
                      editorDidMount={handleMonacoEditorLoad}
                    />
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
                  onClick={createFunctionalTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.UPDATE_TEST_NAME: {
          return updateTestNameForm();
        }

        case TEST_FORM_TYPES.VIEW_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>View Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g.: https://www.realpbctalk.com"
                      value={mainUrl}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Functional Spec Ts Code</Form.Label>
                    <MonacoEditor
                      key="functional-spec-editor"
                      width="100%"
                      height="500"
                      theme="vs-dark"
                      language="typescript"
                      value={functionalSpecTsCode}
                      options={{
                        readOnly: true,
                        readOnlyMessage: "This editor is read only.",
                        domReadOnly: true,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                      onChange={handleFunctionalSpecTsCodeEditorChange}
                      editorDidMount={handleMonacoEditorLoad}
                    />
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
              </Modal.Footer>
            </Modal>
          );
        }

        case TEST_FORM_TYPES.CLONE_TEST_CONFIG: {
          return (
            <Modal
              keyboard={false}
              show={shouldOpenForm}
              onHide={closeModal}
              size="lg"
              id="publish-modal"
              backdrop="static"
            >
              <Modal.Header closeButton>
                <Modal.Title>Clone Test Config</Modal.Title>
                <div className="text-primary small ms-3">
                  <b>WebApp</b>: {currentWebApp.name}
                  <b>{" | "}</b>
                  <b>Test Category</b>: {currentTest.category}
                  <br />
                  <b>Test Name</b>: {currentTest.name}
                  <br />
                </div>
              </Modal.Header>

              <Modal.Body>
                <Form autoComplete={config.ENVIRONMENT === "DEV" ? "off" : "on"}>
                  <Form.Group
                    className="mb-3"
                    controlId="name"
                  >
                    <Form.Label>Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Test Name"
                      value={name}
                      ref={nameInputRef}
                      isInvalid={!isNameValid}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                        setIsNameValid(validateContentName(e.currentTarget.value));
                      }}
                    />
                    {!isNameValid && <Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="main-url"
                  >
                    <Form.Label>Main URL</Form.Label>
                    <Button
                      className="ms-2 mb-1"
                      onClick={() => {
                        setMainUrl(currentTest.mainUrl);
                        setIsMainUrlValid(validateUrl(currentTest.mainUrl));
                      }}
                    >
                      Reset to <b>{currentTest.name}</b> Main URL
                    </Button>
                    <Form.Control
                      type="text"
                      placeholder="e.g.: https://www.realpbctalk.com"
                      value={mainUrl}
                      ref={mainUrlInputRef}
                      isInvalid={!isMainUrlValid}
                      onChange={(e) => {
                        setMainUrl(e.currentTarget.value);
                        setIsMainUrlValid(validateUrl(e.currentTarget.value));
                      }}
                    />
                    {!isMainUrlValid && <Form.Control.Feedback type="invalid">Please provide a valid URL.</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-block mb-1">Functional Spec Ts Code</Form.Label>
                    <Button
                      className="mb-2"
                      onClick={fetchDefaultFunctionalTsCode}
                    >
                      Fetch default Functional.spec.ts
                    </Button>
                    <Button
                      className="ms-2 mb-2"
                      onClick={fetchTestFunctionalTsCode}
                    >
                      Fetch <b>{currentTest.name}</b> Functional.spec.ts
                    </Button>
                    <MonacoEditor
                      key="functional-spec-editor"
                      width="100%"
                      height="500"
                      theme="vs-dark"
                      language="typescript"
                      value={functionalSpecTsCode}
                      options={{
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                      onChange={handleFunctionalSpecTsCodeEditorChange}
                      editorDidMount={handleMonacoEditorLoad}
                    />
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
                  onClick={createFunctionalTestHandler}
                >
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          );
        }

        default: {
          return <></>;
        }
      }
    }

    default: {
      return <></>;
    }
  }
};

export default TestForm;
