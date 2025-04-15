const loaderElem = document.getElementById("custom-loader");

export const showLoader = () => {
  loaderElem.classList.remove("d-none");
};

export const hideLoader = () => {
  loaderElem.classList.add("d-none");
};

export const formatDate = (initialDate) => {
  initialDate = new Date(initialDate);

  const dateFormat = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    dateStyle: "medium",
  });

  const finalDate = dateFormat.format(initialDate);

  return finalDate.toString();
};

export const getCurrentEngagementFromLocalStorage = () => localStorage.getItem("current-engagement");

export const setCurrentEngagementFromLocalStorage = (engagement) => localStorage.setItem("current-engagement", engagement);

export const getShowUserTestsFromLS = () => {
  const value = localStorage.getItem("show-user-tests");
  if (value) return !!JSON.parse(value);
  else return false;
};

export const setShowUserTestsInLS = (value) => localStorage.setItem("show-user-tests", value);

export const getSelectUserFromLS = () => localStorage.getItem("select-user");

export const setSelectUserInLS = (value) => {
  if(value) localStorage.setItem("select-user", value);
  else localStorage.removeItem("select-user");
}