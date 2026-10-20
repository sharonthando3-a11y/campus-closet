"use strict";

function validatePassword(password) {
    const errors = [];

    if (password.length < 8 || password.length > 12) {
        errors.push("Password must be 8–12 characters long.");
    }

    if ((password.match(/[0-9]/g) || []).length < 2) {
        errors.push("Password must contain at least 2 numbers.");
    }

    if ((password.match(/[A-Z]/g) || []).length < 2) {
        errors.push("Password must contain at least 2 capital letters.");
    }

    if ((password.match(/[^A-Za-z0-9]/g) || []).length < 1) {
        errors.push("Password must contain at least 1 symbol.");
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

document.getElementById("show-login").addEventListener("click", function() {
    loginForm.hidden = false;
    registerForm.hidden = true;
});

document.getElementById("show-register").addEventListener("click", function() {
    registerForm.hidden = false;
    loginForm.hidden = true;
});

document.getElementById("continue-guest").addEventListener("click", function() {
    sessionStorage.setItem("campusCustomerType", "guest");
    window.location.href = "checkout.html";
});

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const passwordInput = document.getElementById("password");
    const message = document.getElementById("register-message");

    if (!passwordInput) {
        message.textContent = "Password field not found. Please check the form.";
        return;
    }

    const result = validatePassword(passwordInput.value);

    if (!result.valid) {
        message.textContent = result.errors.join(" ");
        passwordInput.focus();
        return;
    }

    message.textContent =
        "Password meets all requirements! Account registration still needs a secure server.";
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    document.getElementById("login-message").textContent =
        "Sign-in is not connected yet. Please continue as a guest " +
        "while we build the account system.";
});