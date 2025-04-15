import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Col, Form, Modal, Row } from "react-bootstrap";
import Select from "react-select";

import "./MoreOptions.scss";
import { getWebAppList } from "../../redux/actions/webAppAction.js";
import { toggleShowUserTestsAction, selectUserAction, getUsersList } from "../../redux/actions/userAction.js";
import { useEffect } from "react";

const generateLabel = (name, email, isAdmin) => `${name}${isAdmin ? " (Admin)" : ""}\n${email}`;

const MoreOptions = ({ shouldOpenModal, closeModal }) => {
  const userStore = useSelector((state) => state.userStore);
  const { users, isAdmin, showingUserTests, selectUser } = userStore;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleShowUserTests = async (e) => {
    toggleShowUserTestsAction(!showingUserTests)(dispatch);
    if (e.currentTarget.checked) selectUserAction(null)(dispatch);
    await getWebAppList()(dispatch);
    navigate(`/web`, { replace: true });
  };

  const handleSelectUser = async (selected) => {
    toggleShowUserTestsAction(false)(dispatch);
    selectUserAction(selected ? selected.value : null)(dispatch);
    await getWebAppList()(dispatch);
    navigate(`/web`, { replace: true });
  };

  useEffect(() => {
    if (!users) {
      getUsersList()(dispatch);
    }
  }, []);

  const selectedUser = selectUser ? users.find((user) => user._id === selectUser) : null;

  const selectedUserValue = selectedUser ? { value: selectUser, label: generateLabel(selectedUser.name, selectedUser.email, selectedUser.isAdmin) } : null;

  const selectUserOptions = users.map((user) => ({ value: user._id, label: generateLabel(user.name, user.email, user.isAdmin) }));

  return (
    <Modal
      keyboard={false}
      show={shouldOpenModal}
      onHide={closeModal}
      size="lg"
      id="more-options-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>More Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col>
              <header className="mb-1">
                <h5 className="d-inline-block">Admin Options</h5>
                <div className="d-inline-block text-primary small ms-3">These options are only available for admins.</div>
              </header>
              <Form.Group
                as={Row}
                className="mb-3"
              >
                <Form.Label
                  column
                  sm={6}
                  className="switch-label"
                  htmlFor="show-user-tests-switch"
                >
                  Show only My Tests
                </Form.Label>
                <Col
                  sm={6}
                  className="switch-container"
                >
                  <Form.Check
                    disabled={!isAdmin}
                    type="switch"
                    id="show-user-tests-switch"
                    inline
                    checked={showingUserTests}
                    onChange={toggleShowUserTests}
                  />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className="mb-3"
              >
                <Form.Label
                  column
                  sm={6}
                  className="select-user-label d-flex align-items-center"
                  htmlFor="select-user-input"
                >
                  Show specific User's Tests
                </Form.Label>
                <Col
                  sm={6}
                  className="select-user-input-container ps-1"
                >
                  <Select
                    backspaceRemovesValue={false}
                    value={selectedUserValue}
                    options={selectUserOptions}
                    placeholder="Search users..."
                    onChange={handleSelectUser}
                    isClearable
                    isDisabled={!isAdmin}
                    styles={{
                      clearIndicator: (baseStyles) => ({
                        ...baseStyles,
                      }),
                      dropdownIndicator: (baseStyles) => ({
                        ...baseStyles,
                      }),
                      control: (baseStyles) => ({
                        ...baseStyles,
                        fontSize: "14px",
                      }),
                      singleValue: (baseStyles) => ({
                        ...baseStyles,
                        whiteSpace: "pre-wrap"
                      }),
                      option: (baseStyles) => ({
                        ...baseStyles,
                        fontSize: "14px",
                        whiteSpace: "pre-wrap"
                      }),
                    }}
                  />
                </Col>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MoreOptions;
