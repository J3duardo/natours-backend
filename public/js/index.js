import "@babel/polyfill";
import {login, logout} from "./login";
import {signup} from "./signup";
import {renderMap} from "./mapbox";
import {updateData} from "./updateSettings";
import {bookTour} from "./stripe";
import {addReview} from "./createReview";
import {disableAccount} from "./disableAccount";
import {sendForgotPasswordEmail} from "./sendPasswordResetEmail";
import {resetPassword} from "./resetPassword";

const mapContainer = document.querySelector("#map");
const loginForm = document.querySelector("#form--login");
const signupForm = document.querySelector("#form--signup");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");
const reviewForm = document.getElementById("form--review");
const disableAccountForm = document.querySelector(".form-user-disable");
const forgotPasswordForm = document.querySelector("#form--forgot-password");
const resetPasswordForm = document.querySelector("#form--reset-password");

//Mostrar el mapa
if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  renderMap(locations);
}

//Hacer login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    login(email, password);
  });
}

//Hacer logout
if (logOutBtn) {
  logOutBtn.addEventListener("click", logout)
}

//Hacer signup
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#passwordConfirm").value;
    signup(username, email, password, passwordConfirm);
  });
}

//Actualizar los datos del usuario
if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", document.querySelector("#name").value);
    form.append("email", document.querySelector("#email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateData(form, "data");
  })
}

//Actualizar la contraseña del usuario
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.querySelector("#password-current").value;
    const newPassword = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;
    await updateData({currentPassword, newPassword, passwordConfirm}, "password");

    //Limpiar los campos del formulario luego de procesarlos
    document.querySelector("#password-current").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#password-confirm").value = "";
  })
}

//Procesar el pago mediante stripe si el usuario está logueado
if(bookBtn) {
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing...";
    const tourId = e.target.dataset.tourId;
    const userId = e.target.dataset.userId;
    bookTour(tourId, userId, e);
  })
}

//Agregar review
if(reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const reviewText = document.querySelector("#review").value;
    const reviewRating = reviewForm.elements["rating"].value;
    
    const userId = e.target.dataset.reviewUser;
    const tourId = e.target.dataset.reviewTour;
    
    addReview(userId, tourId, reviewText, reviewRating)
  })
}

//Desactivar cuenta de usuario
if (disableAccountForm) {
  disableAccountForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const providedPassword = disableAccountForm.elements["password-disable"].value;
    disableAccount(providedPassword);
  })
}

//Enviar email de restablecimiento de contraseña
if(forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#forgot-password-email").value;
    console.log(email)
    sendForgotPasswordEmail(email);
  })
}

//Resetear contraseña mediante el token enviado al email
if(resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#passwordConfirm").value;
    const token = e.target.dataset.resetToken;
    resetPassword(password, passwordConfirm, token);
  })
}