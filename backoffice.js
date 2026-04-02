(function () {
  const LOGIN_PAGE = "backoffice.html";
  const DASHBOARD_PAGE = "backoffice-dashboard.html";
  const STATIC_HOSTS = ["github.io", "githubusercontent.com"];

  function isStaticHostedPreview() {
    const hostname = window.location.hostname;
    return STATIC_HOSTS.some(function (domain) {
      return hostname === domain || hostname.endsWith("." + domain);
    });
  }

  async function parseJsonResponse(response) {
    const raw = await response.text();

    try {
      return JSON.parse(raw);
    } catch (error) {
      if (isStaticHostedPreview()) {
        throw new Error("This login only works on the live backoffice server link, not on the GitHub preview link.");
      }
      throw new Error("The server returned an unexpected response. Please refresh and try again.");
    }
  }

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

  function ensurePreviewElement(field) {
    const label = field.closest("label");
    if (!label) {
      return null;
    }

    let preview = label.parentElement.querySelector('[data-preview-for="' + field.dataset.adminPreview + '"]');
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "admin-image-preview";
      preview.dataset.previewFor = field.dataset.adminPreview;
      preview.innerHTML = '<span class="admin-image-preview-label">Image Preview</span><img alt=""><p>No image selected</p>';
      label.insertAdjacentElement("afterend", preview);
    }

    return preview;
  }

  function refreshImagePreview(field) {
    const preview = ensurePreviewElement(field);
    if (!preview) {
      return;
    }

    const img = preview.querySelector("img");
    const text = preview.querySelector("p");
    const value = field.value.trim();

    if (!value) {
      preview.classList.remove("has-image");
      img.removeAttribute("src");
      text.textContent = "No image selected";
      return;
    }

    img.onload = function () {
      preview.classList.add("has-image");
      text.textContent = value;
    };
    img.onerror = function () {
      preview.classList.remove("has-image");
      text.textContent = "Unable to load preview for " + value;
    };
    img.src = value;
  }

  function bindImagePreviews() {
    document.querySelectorAll("[data-admin-preview]").forEach(function (field) {
      refreshImagePreview(field);
      field.addEventListener("input", function () {
        refreshImagePreview(field);
      });
    });
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    });
    const result = await parseJsonResponse(response);

    if (!response.ok || !result.success || !result.filename) {
      throw new Error(result.message || "Upload failed.");
    }

    return "/images/" + result.filename;
  }

  function bindUploadInputs() {
    document.querySelectorAll("[data-upload-target]").forEach(function (input) {
      input.addEventListener("change", async function (event) {
        const file = event.target.files && event.target.files[0];
        const targetKey = input.dataset.uploadTarget;
        const targetField = document.querySelector('[data-admin-field="' + targetKey + '"]');

        if (!file || !targetField) {
          return;
        }

        showStatus("Uploading image...", "neutral");

        try {
          const imagePath = await uploadImage(file);
          targetField.value = imagePath;
          refreshImagePreview(targetField);
          showStatus("Image uploaded. Save changes to publish it on the website.", "success");
        } catch (error) {
          showStatus(error.message || "Upload failed.", "neutral");
        } finally {
          input.value = "";
        }
      });
    });
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
      const passwordInput = document.getElementById("backofficePassword");
      const togglePasswordButton = document.getElementById("toggleBackofficePassword");

      if (!form) {
        return;
      }

      if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener("click", function () {
          const shouldShow = passwordInput.type === "password";
          passwordInput.type = shouldShow ? "text" : "password";
          togglePasswordButton.classList.toggle("is-visible", shouldShow);
          togglePasswordButton.setAttribute("aria-pressed", shouldShow ? "true" : "false");
          togglePasswordButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
        });
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
          const result = await parseJsonResponse(response);
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
      bindImagePreviews();
      bindUploadInputs();

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
          bindImagePreviews();
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
