import axios from "axios";
import {showAlert} from "./alerts";

export const login = (email, password) => {
  axios({
    method: "POST",
    url: "/api/v1/users/login",
    data: {
      email: email,
      password: password
    }
  })
  .then(res => {
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/")
      }, 1500)
    }
  })
  .catch(err => {
    showAlert("error", err.response.data.message);
  })
}

export const logout = () => {
  axios({
    method: "GET",
    url: "/api/v1/users/logout"
  })
  .then((res) => {
    if (res.data.status === "success") {
      location.reload(true);
      location.assign("/");
    }
  })
  .catch(err => {
    showAlert("error", "Error logging out. Try again.")
  })
}