import { useState } from "react";
import { Button, ListGroup, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

export const TooltipMainURL = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The Main URL value in the config.json is not mandatory to fill.
          <br />
          The value from the input field will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="ms-2 text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
};

export const TooltipReferenceURL = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The Reference URL value in the config.json is not mandatory to fill.
          <br />
          The value from the input field will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="ms-2 text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
};

export const TooltipPageByPage = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The pageByPage and pageByPageUrls fields in the config.json are not mandatory to fill.
          <br />
          The value from the input field will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
};

export const TooltipIsMobile = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The isMobile field in the config.json is not mandatory to fill.
          <br />
          The value from the switch will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
};

export const TooltipScreenWidth = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The screen_width field in the config.json is not mandatory to fill.
          <br />
          The value from the input field will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="ms-2 text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
};

export const TooltipTestTimeout = () => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip>
          The testTimeout field in the config.json is not mandatory to fill.
          <br />
          The value selected from this dropdown will be used to generate the report.
        </Tooltip>
      }
    >
      <span className="ms-2 text-primary fa-solid fa-circle-info" />
    </OverlayTrigger>
  );
}

export const ModalReferenceImgs = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <Button
        className="ms-2 mb-1"
        onClick={openModal}
      >
        Information on uploading Reference Images
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
            <Modal.Title>Image Filename Creation Instructions( Drupal based website)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup
              numbered
              variant="flush"
            >
              <ListGroup.Item>
                For the main domain URL "<code>https://www.focusonfop.com</code>":
                <ListGroup>
                  <ListGroup.Item>The image filename should be "home.png".</ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
              <ListGroup.Item>
                For the remaining URLs:
                <ListGroup>
                  <ListGroup.Item>Extract the last section of the URL after the last "/" character.</ListGroup.Item>
                  <ListGroup.Item>Use the extracted section as the basis for the image filename.</ListGroup.Item>
                  <ListGroup.Item>Ensure that filenames are descriptive and end with the ".png" extension.</ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup variant="flush">
              Examples:
              <ListGroup.Item >
                For the URL "<code>https://www.focusonfop.com/fop-flare-ups</code>":
                <ListGroup>
                  <ListGroup.Item>Extracting the last section "fop-flare-ups" after the last "/" character.</ListGroup.Item>
                  <ListGroup.Item>The image filename would be "fop-flare-ups.png".</ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
            </ListGroup>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
