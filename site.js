const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (mobileNavToggle && siteNav) {
  const closeMobileNav = function () {
    mobileNavToggle.classList.remove("is-active");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  };

  mobileNavToggle.addEventListener("click", function () {
    const willOpen = !siteNav.classList.contains("is-open");
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
}
