import { useParams } from "react-router-dom";
import { DOMAIN } from "../../configs/api.js";

const TestReport = () => {
  const { wId, tId } = useParams();
  return (
    <iframe
      src={`${DOMAIN}/views/webapp/${wId}/test/${tId}/view`}
      frameborder="0"
      style={{
        height: "calc(100vh - 39px)",
        width: "100vw"
      }}
    />
  );
};

export default TestReport;
