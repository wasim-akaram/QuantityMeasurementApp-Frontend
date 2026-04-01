function showLogin() {
  document.getElementById("signupForm").classList.remove("active-form");
  document.getElementById("signupForm").classList.add("hidden-form");

  document.getElementById("loginForm").classList.remove("hidden-form");
  document.getElementById("loginForm").classList.add("active-form");

  document.getElementById("signupTab").classList.remove("active");
  document.getElementById("signupTab").classList.add("inactive");

  document.getElementById("loginTab").classList.remove("inactive");
  document.getElementById("loginTab").classList.add("active");
}

function showSignup() {
  document.getElementById("loginForm").classList.remove("active-form");
  document.getElementById("loginForm").classList.add("hidden-form");

  document.getElementById("signupForm").classList.remove("hidden-form");
  document.getElementById("signupForm").classList.add("active-form");

  document.getElementById("loginTab").classList.remove("active");
  document.getElementById("loginTab").classList.add("inactive");

  document.getElementById("signupTab").classList.remove("inactive");
  document.getElementById("signupTab").classList.add("active");
}

function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

function showPopup(message) {
  document.getElementById("popupMessage").innerText = message;
  document.getElementById("popup").classList.remove("hidden-popup");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden-popup");
}
function setError(input, message) {
  input.classList.remove("success");
  input.classList.add("error");

  const inputGroup = input.closest(".input-group");
  const errorElement = inputGroup.querySelector(".error-message");

  if (errorElement) {
    errorElement.innerText = message;
  }
}

function setSuccess(input) {
  input.classList.remove("error");
  input.classList.add("success");

  const inputGroup = input.closest(".input-group");
  const errorElement = inputGroup.querySelector(".error-message");

  if (errorElement) {
    errorElement.innerText = "";
  }
}

function isValidEmail(email) {
  return/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function isValidMobile(mobile) {
  return /^[0-9]{10}$/.test(mobile);
}

function validateSignupForm() {
  let isValid = true;

  const fullName = document.getElementById("fullName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const mobileNumber = document.getElementById("mobileNumber");

  // Full Name
  if (fullName.value.trim() === "") {
    setError(fullName, "Full Name is required");
    isValid = false;
  } else {
    setSuccess(fullName);
  }

  // Email
  if (signupEmail.value.trim() === "") {
    setError(signupEmail, "Email is required");
    isValid = false;
  } else if (!isValidEmail(signupEmail.value.trim())) {
    setError(signupEmail, "Enter a valid email");
    isValid = false;
  } else {
    setSuccess(signupEmail);
  }

  // Password
  if (signupPassword.value.trim() === "") {
    setError(signupPassword, "Password is required");
    isValid = false;
  } else if (signupPassword.value.trim().length < 6) {
    setError(signupPassword, "Password must be at least 6 characters");
    isValid = false;
  } else {
    setSuccess(signupPassword);
  }

  // Mobile
  if (mobileNumber.value.trim() === "") {
    setError(mobileNumber, "Mobile Number is required");
    isValid = false;
  } else if (!isValidMobile(mobileNumber.value.trim())) {
    setError(mobileNumber, "Mobile number must be 10 digits");
    isValid = false;
  } else {
    setSuccess(mobileNumber);
  }

  return isValid;
}

function validateLoginForm() {
  let isValid = true;

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  // Email
  if (loginEmail.value.trim() === "") {
    setError(loginEmail, "Email is required");
    isValid = false;
  } else if (!isValidEmail(loginEmail.value.trim())) {
    setError(loginEmail, "Enter a valid email");
    isValid = false;
  } else {
    setSuccess(loginEmail);
  }

  // Password
  if (loginPassword.value.trim() === "") {
    setError(loginPassword, "Password is required");
    isValid = false;
  } else {
    setSuccess(loginPassword);
  }

  return isValid;
}

function handleSignup(event) {
  event.preventDefault();

  if (!validateSignupForm()) {
    showPopup("Please complete all required fields correctly 😣");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const signupEmail = document.getElementById("signupEmail").value.trim();
  const signupPassword = document.getElementById("signupPassword").value.trim();
  const mobileNumber = document.getElementById("mobileNumber").value.trim();

  // Save user in localStorage
  const userData = {
    name: fullName,
    email: signupEmail,
    password: signupPassword,
    mobile: mobileNumber
  };

  localStorage.setItem("qm_user", JSON.stringify(userData));

  showPopup("Signup successful! Please login now 🦋");
  document.getElementById("signupForm").reset();

  // remove green styles after reset
  document.querySelectorAll("#signupForm input").forEach(input => {
    input.classList.remove("success", "error");
  });

  // Switch to login tab after 1.5 sec
  setTimeout(() => {
    closePopup();
    showLogin();
  }, 1500);
}

function handleLogin(event) {
  event.preventDefault();

  if (!validateLoginForm()) {
    showPopup("Please complete login details correctly 😣");
    return;
  }

  const loginEmail = document.getElementById("loginEmail").value.trim();
  const loginPassword = document.getElementById("loginPassword").value.trim();

  const savedUser = JSON.parse(localStorage.getItem("qm_user") || "null");

  // Check if user exists
  if (!savedUser) {
    showPopup("No account found. Please sign up first.");
    return;
  }

  // Check email + password
  if (savedUser.email !== loginEmail || savedUser.password !== loginPassword) {
    showPopup("Invalid email or password.");
    return;
  }

  // Create session for document.html / home.js
  const session = {
    name: savedUser.name,
    email: savedUser.email
  };

  localStorage.setItem("qm_session", JSON.stringify(session));

  showPopup("Logged in successfully! 🦋");

  setTimeout(() => {
    window.location.href = "document.html";
  }, 1500);
}