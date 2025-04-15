import { useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";

const VisualTestInfoModal = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <Button
        className="mb-3"
        onClick={openModal}
      >
        Information on generating VISUAL TEST Reports
      </Button>
      {showModal && (
        <Modal
          keyboard
          show={showModal}
          onHide={closeModal}
          size="lg"
          id="visual-test-info-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Information on Generating Visual Test Reports</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup
              numbered
              variant="flush"
            >
              <ListGroup.Item>
                <strong>Config.json</strong>
                <ListGroup
                  numbered
                >
                  <ListGroup.Item>
                    <strong>screenWidth</strong>
                    <ListGroup>
                      <ListGroup.Item>Screen width for desktop should start lie between 1346 to 1920.</ListGroup.Item>
                      <ListGroup.Item>
                        Screen width for mobile should lie between 375 to 420, depending upon the device you choose to test on.
                      </ListGroup.Item>
                      <ListGroup.Item>Our assumption is <strong>your uploaded image width</strong> and <strong>screen width</strong> will be same.</ListGroup.Item>
                    </ListGroup>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>testTimeout</strong>
                    <ListGroup>
                      <ListGroup.Item>Maximum allotted time for the test to complete in milliseconds, for example, 4000000.</ListGroup.Item>
                    </ListGroup>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>testScreenshotTimeout</strong>
                    <ListGroup>
                      <ListGroup.Item>
                        Maximum allotted time for Playwright to take any screenshot in milliseconds, for example, 1000000., for example, 1000000.
                      </ListGroup.Item>
                    </ListGroup>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>HCP box, One Trust, ISI Tray or Sticky Header</strong>
                    <ListGroup>
                      <ListGroup.Item>
                        If the web site has an HCP box, One Trust, ISI Tray or Sticky Header, set the respective value to true; otherwise, set it to
                        false.
                      </ListGroup.Item>
                      <ListGroup.Item>
                        Additionally, change the respective <strong>selector</strong> value ID or CSS class according to your web site strong.
                      </ListGroup.Item>
                    </ListGroup>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>For Testing on Mobile Devices</strong>
                    <ListGroup>
                      <ListGroup.Item>
                        Ensure <strong>isMobile</strong> is set to true.
                      </ListGroup.Item>
                      <ListGroup.Item>
                        Adjust <strong>screenWidth</strong> as per your exported design file and mobile viewport.
                      </ListGroup.Item>
                    </ListGroup>
                  </ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Playwright.config.ts</strong>
                <ListGroup>
                  <ListGroup.Item>
                    Currently we are supporting only one device per test, so please enable only one device config in this file.
                  </ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
            </ListGroup>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default VisualTestInfoModal;
