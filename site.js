const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const siteNav = document.querySelector(".site-nav");
const LOCAL_BACKOFFICE_URL = "http://127.0.0.1:8080/backoffice";

if (mobileNavToggle && siteNav) {
  console.log('Mobile nav elements found'); // Debug log
  
  const closeMobileNav = function () {
    mobileNavToggle.classList.remove("is-active");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
    console.log('Nav closed'); // Debug log
  };

  mobileNavToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle clicked'); // Debug log
    
    const willOpen = !siteNav.classList.contains("is-open");
    console.log('Will open:', willOpen); // Debug log
    
    mobileNavToggle.classList.toggle("is-active", willOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(willOpen));
    mobileNavToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    siteNav.classList.toggle("is-open", willOpen);
  });

  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileNav);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) {
      closeMobileNav();
    }
  });

  document.addEventListener("click", function (event) {
    if (window.innerWidth > 820) {
      return;
    }

    if (!siteNav.contains(event.target) && !mobileNavToggle.contains(event.target)) {
      closeMobileNav();
    }
  });
} else {
  console.log('Mobile nav elements NOT found'); // Debug log
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
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
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
      threshold: 0.32,
      rootMargin: "0px 0px -2% 0px"
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
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

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
