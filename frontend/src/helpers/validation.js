export const validateName = (value) => {
  if (value.length > 6) {
    return true;
  }
  return false;
};

export const validateEmail = (value) => {
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) &&
    value.endsWith("@indegene.com")
  ) {
    return true;
  }
  return false;
};

export const validatePassword = (value) => {
  if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z\d@$!%*#?&]{6,20}$/.test(value)) {
    return true;
  }
  return false;
};

export const validateContentName = (value) => {
  if (value.length < 25 && /^[a-z0-9_-]+$/i.test(value)) {
    return true;
  }
  return false;
};

export const validateUrl = (value) => {
  if(/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/.test(value)) {
    return true;
  }
  return false;
}