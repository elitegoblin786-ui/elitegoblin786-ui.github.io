(function () {
  const STORAGE_KEY = "tbhCmsContentV1";

  const defaults = {
    welcomeImage: "benefit-staff-happiness.jpg",
    welcomeKicker: "Welcome",
    welcomeTitle: "Discover TheBrandHouse",
    welcomeDescription: "Trusted brands, nationwide retail access and dependable service brought together for customers across Mauritius.",
    welcomePrimaryLabel: "Discover More",
    welcomePrimaryHref: "about.html",
    welcomeSecondaryLabel: "View Our Stores",
    welcomeSecondaryHref: "stores.html",
    legacyTitle: "Built on more than a century of business heritage",
    legacyDescription: "TheBrandHouse benefits from long-standing roots in Mauritian business through its shareholder background, combining decades of experience with a modern retail and service outlook.",
    legacyPrefix: "For over",
    legacyCount: "100",
    legacyCountSuffix: "+",
    legacySuffix: "years of business legacy",
    heroHeading: "Trusted distribution. Modern retail. Reliable service.",
    heroDescription: "TheBrandHouse brings together a strong brand portfolio, a wide retail footprint, and dependable after-sales support to serve customers across Mauritius with confidence and consistency.",
    timelineTitle: "A business story built over time",
    timelineDescription: "TheBrandHouse stands on decades of experience, retail development and long-term investment in customer service.",
    timelineOneYear: "1930",
    timelineOneTitle: "JM Goupille & Co. established",
    timelineOneDescription: "Historic roots in distribution and brand representation in Mauritius.",
    timelineTwoYear: "1991",
    timelineTwoTitle: "Galaxy retail network grows",
    timelineTwoDescription: "A stronger direct-to-customer presence through a recognised retail chain.",
    timelineThreeYear: "Today",
    timelineThreeTitle: "TheBrandHouse platform",
    timelineThreeDescription: "Distribution, retail and service combined under one unified business identity."
  };

  function load() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...defaults };
      }

      const parsed = JSON.parse(stored);
      return { ...defaults, ...parsed };
    } catch (error) {
      return { ...defaults };
    }
  }

  function save(content) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    return { ...defaults };
  }

  function setTextContent(content) {
    document.querySelectorAll("[data-cms-text]").forEach(function (element) {
      const key = element.dataset.cmsText;
      if (Object.prototype.hasOwnProperty.call(content, key)) {
        element.textContent = content[key];
      }
    });
  }

  function setLinks(content) {
    document.querySelectorAll("[data-cms-link]").forEach(function (element) {
      const key = element.dataset.cmsLink;
      if (Object.prototype.hasOwnProperty.call(content, key)) {
        element.setAttribute("href", content[key]);
      }
    });
  }

  function setImages(content) {
    document.querySelectorAll("[data-cms-image]").forEach(function (element) {
      const key = element.dataset.cmsImage;
      if (Object.prototype.hasOwnProperty.call(content, key) && content[key]) {
        element.setAttribute("src", content[key]);
      }
    });
  }

  function setCounters(content) {
    document.querySelectorAll("[data-cms-count]").forEach(function (element) {
      const countKey = element.dataset.cmsCount;
      const suffixKey = element.dataset.cmsSuffix;
      const countValue = content[countKey] || "0";
      const suffixValue = suffixKey ? (content[suffixKey] || "") : "";

      element.dataset.count = countValue;
      element.dataset.suffix = suffixValue;
      element.textContent = String(countValue) + suffixValue;
      delete element.dataset.counted;
    });
  }

  function applyContent(content) {
    const merged = content || load();
    setTextContent(merged);
    setLinks(merged);
    setImages(merged);
    setCounters(merged);
    return merged;
  }

  window.TBH_CMS_DEFAULTS = { ...defaults };
  window.tbhCms = {
    storageKey: STORAGE_KEY,
    load,
    save,
    reset,
    applyContent
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.cmsPage === "home") {
      applyContent();
    }
  });
})();
