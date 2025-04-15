import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import WebApp from "../WebApp/WebApp.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { getWebAppList } from "../../redux/actions/webAppAction.js";

const WebAppWrapper = () => {
  const webAppStore = useSelector((state) => state.webAppStore);
  const { webApps } = webAppStore;
  
  const dispatch = useDispatch();

  useEffect(() => {
    if(!webApps) getWebAppList()(dispatch);
  }, []);

  if(!webApps) return <Loader />
  return <WebApp />
}

export default WebAppWrapper;