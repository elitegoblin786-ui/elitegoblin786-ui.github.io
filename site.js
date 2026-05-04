const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const siteNav = document.querySelector(".site-nav");
const LOCAL_BACKOFFICE_URL = "http://127.0.0.1:8080/backoffice";
const DARK_MODE_STORAGE_KEY = "tbh-dark-mode";

try {
  if (window.localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
} catch (error) {
  // Keep the site usable if browser storage is unavailable.
}

if (mobileNavToggle && siteNav) {
  mobileNavToggle.dataset.navController = "site";
  siteNav.dataset.navController = "site";

  const mobileNavQuery = window.matchMedia("(max-width: 820px)");

  const setMobileNavState = function (isOpen) {
    mobileNavToggle.classList.toggle("is-active", isOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNavToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    siteNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("is-mobile-nav-open", isOpen);
  };

  const closeMobileNav = function () {
    setMobileNavState(false);
  };

  mobileNavToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    setMobileNavState(!siteNav.classList.contains("is-open"));
  });

  siteNav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", function () {
    if (!mobileNavQuery.matches) {
      closeMobileNav();
    }
  });

  document.addEventListener("click", function (event) {
    if (!mobileNavQuery.matches) {
      return;
    }

    if (!siteNav.contains(event.target) && !mobileNavToggle.contains(event.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");
const directionalRevealElements = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up, .reveal-scale");

const animateCount = function (element) {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.count || "0");
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  element.dataset.counted = "true";

  const step = function (now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * eased);
    element.textContent = String(currentValue) + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = String(target) + suffix;
    }
  };

  window.requestAnimationFrame(step);
};

if (revealElements.length) {
  if (prefersReducedMotion) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
      element.querySelectorAll(".count-up").forEach(animateCount);
    });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll(".count-up").forEach(animateCount);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -5% 0px"
    });

    const timelineRevealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll(".count-up").forEach(animateCount);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -3% 0px"
    });

    revealElements.forEach(function (element) {
      if (element.classList.contains("timeline-shell")) {
        timelineRevealObserver.observe(element);
      } else {
        revealObserver.observe(element);
      }
    });
  }
}

if (directionalRevealElements.length) {
  if (prefersReducedMotion) {
    directionalRevealElements.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const dirObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

    directionalRevealElements.forEach(function (el) { dirObserver.observe(el); });
  }
}

document.addEventListener("tbh:cms-applied", function () {
  document.querySelectorAll(".count-up").forEach(function (element) {
    if (element.closest(".is-visible")) {
      animateCount(element);
    }
  });
});

document.querySelectorAll('a[href="/backoffice"], a[href="backoffice.html"], a[href="backoffice"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (window.location.protocol !== "file:") {
      return;
    }

    event.preventDefault();
    window.location.href = LOCAL_BACKOFFICE_URL;
  });
});
