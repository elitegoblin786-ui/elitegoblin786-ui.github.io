(function () {
  const LOGIN_PAGE = "backoffice.html";
  const DASHBOARD_PAGE = "backoffice-dashboard.html";
  const SESSION_KEY = "tbhBackofficeAuthV1";
  const USERNAME = "AdminTBH_404";
  const PASSWORD = "BOsyst_404";

  function isAuthenticated() {
    return window.sessionStorage.getItem(SESSION_KEY) === "authorized";
  }

  function setAuthenticated(value) {
    if (value) {
      window.sessionStorage.setItem(SESSION_KEY, "authorized");
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function populateForm(data) {
    document.querySelectorAll("[data-admin-field]").forEach(function (field) {
      const key = field.dataset.adminField;
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        field.value = data[key];
      }
    });
  }

  function readForm() {
    const data = {};
    document.querySelectorAll("[data-admin-field]").forEach(function (field) {
      data[field.dataset.adminField] = field.value.trim();
    });
    return data;
  }

  function showStatus(message, type) {
    const status = document.getElementById("backofficeStatus");
    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = "admin-status is-visible" + (type ? " " + type : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const pageMode = document.body.dataset.backoffice;

    if (pageMode === "login") {
      if (isAuthenticated()) {
        window.location.href = DASHBOARD_PAGE;
        return;
      }

      const form = document.getElementById("backofficeLoginForm");
      const error = document.getElementById("loginError");

      if (!form) {
        return;
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("backofficeUsername").value;
        const password = document.getElementById("backofficePassword").value;

        if (username === USERNAME && password === PASSWORD) {
          setAuthenticated(true);
          window.location.href = DASHBOARD_PAGE;
          return;
        }

        error.textContent = "Incorrect username or password. Please try again.";
        error.classList.add("is-visible");
      });

      return;
    }

    if (pageMode === "dashboard") {
      if (!isAuthenticated()) {
        window.location.href = LOGIN_PAGE;
        return;
      }

      const currentContent = window.tbhCms.load();
      populateForm(currentContent);

      const saveButton = document.getElementById("saveBackofficeChanges");
      const resetButton = document.getElementById("resetBackofficeChanges");
      const previewButton = document.getElementById("previewHomepage");
      const logoutButton = document.getElementById("logoutBackoffice");

      if (saveButton) {
        saveButton.addEventListener("click", function () {
          const updatedContent = readForm();
          window.tbhCms.save(updatedContent);
          showStatus("Changes saved. Open the homepage preview to review them in this browser.", "success");
        });
      }

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          const defaults = window.tbhCms.reset();
          populateForm(defaults);
          showStatus("Default homepage content restored.", "neutral");
        });
      }

      if (previewButton) {
        previewButton.addEventListener("click", function () {
          window.open("index.html", "_blank", "noopener");
        });
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", function () {
          setAuthenticated(false);
          window.location.href = LOGIN_PAGE;
        });
      }
    }
  });
})();
