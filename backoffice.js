(function () {
  const LOGIN_PAGE = "backoffice.html";
  const DASHBOARD_PAGE = "backoffice-dashboard.html";

  async function fetchSession() {
    const response = await fetch("/api/backoffice/session", {
      credentials: "same-origin",
      cache: "no-store"
    });
    return response.ok;
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

  document.addEventListener("DOMContentLoaded", async function () {
    const pageMode = document.body.dataset.backoffice;

    if (pageMode === "login") {
      const alreadyAuthenticated = await fetchSession().catch(function () {
        return false;
      });

      if (alreadyAuthenticated) {
        window.location.href = DASHBOARD_PAGE;
        return;
      }

      const form = document.getElementById("backofficeLoginForm");
      const error = document.getElementById("loginError");

      if (!form) {
        return;
      }

      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        error.textContent = "";
        error.classList.remove("is-visible");

        const username = document.getElementById("backofficeUsername").value.trim();
        const password = document.getElementById("backofficePassword").value;

        try {
          const response = await fetch("/api/backoffice/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ username: username, password: password })
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Incorrect username or password.");
          }
          window.location.href = DASHBOARD_PAGE;
        } catch (authError) {
          error.textContent = authError.message || "Incorrect username or password. Please try again.";
          error.classList.add("is-visible");
        }
      });

      return;
    }

    if (pageMode === "dashboard") {
      const authenticated = await fetchSession().catch(function () {
        return false;
      });

      if (!authenticated) {
        window.location.href = LOGIN_PAGE;
        return;
      }

      const currentContent = await window.tbhCms.load();
      populateForm(currentContent);

      const welcomeImageUpload = document.getElementById("welcomeImageUpload");
      if (welcomeImageUpload) {
        welcomeImageUpload.addEventListener("change", async function(event) {
          const file = event.target.files[0];
          if (!file) return;
          const formData = new FormData();
          formData.append('file', file);
          try {
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              credentials: 'same-origin',
              body: formData
            });
            const result = await response.json();
            if (result.success) {
              document.querySelector('[data-admin-field="welcomeImage"]').value = '/images/' + result.filename;
              showStatus("Image uploaded successfully.", "success");
            } else {
              showStatus(result.message || "Upload failed.", "neutral");
            }
          } catch (error) {
            showStatus("Upload failed.", "neutral");
          }
        });
      }

      const saveButton = document.getElementById("saveBackofficeChanges");
      const resetButton = document.getElementById("resetBackofficeChanges");
      const previewButton = document.getElementById("previewHomepage");
      const logoutButton = document.getElementById("logoutBackoffice");

      if (saveButton) {
        saveButton.addEventListener("click", async function () {
          const updatedContent = readForm();
          try {
            await window.tbhCms.save(updatedContent);
            showStatus("Changes saved. Open the site preview to review them live.", "success");
          } catch (saveError) {
            showStatus(saveError.message || "Unable to save changes.", "neutral");
          }
        });
      }

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          const defaults = window.tbhCms.resetLocal();
          populateForm(defaults);
          showStatus("Default website content restored locally. Save changes to apply them on the server.", "neutral");
        });
      }

      if (previewButton) {
        previewButton.addEventListener("click", function () {
          window.open("index.html", "_blank", "noopener");
        });
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
          await fetch("/api/backoffice/logout", {
            method: "POST",
            credentials: "same-origin"
          }).catch(function () {
            return null;
          });
          window.location.href = LOGIN_PAGE;
        });
      }
    }
  });
})();
