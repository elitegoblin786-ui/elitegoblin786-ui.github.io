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
    timelineThreeDescription: "Distribution, retail and service combined under one unified business identity.",

    aboutBannerTitle: "Who we are",
    aboutBannerDescription: "Learn more about TheBrandHouse, its origins, its business activities and the strength behind its portfolio in Mauritius.",
    aboutOverviewTitle: "Welcome to TheBrandHouse",
    aboutOverviewDescriptionOne: "TheBrandHouse is the leading distributor and retailer of home appliances and consumer electronics in Mauritius.",
    aboutOverviewDescriptionTwo: "TheBrandHouse was created from the merger of JM Goupille & Co., founded in 1930 and recognised as one of the reputed importers and distributors in the country, and Waterfalls Marketing, owner of the Galaxy chain of retail stores since 1991.",
    aboutOverviewDescriptionThree: "Today, TheBrandHouse owns and manages a portfolio of brands and leaders in their respective fields of activity.",
    aboutPortfolioTitle: "The brands behind TheBrandHouse",
    aboutPortfolioDescription: "Across retail, online, service, and distribution, TheBrandHouse works with a broad portfolio of recognised consumer brands.",
    aboutActivitiesTitle: "The business at a glance",
    aboutRetailTitle: "Nationwide customer access",
    aboutRetailDescription: "Galaxy is a nationwide network of 28 multi-brand retail stores located in both urban and rural areas. Galaxy has also launched its online buying platform to keep up with the evolving retail market.",
    aboutOperationsTitle: "Operational strength",
    aboutOperationsDescriptionOne: "JMG imports, markets and distributes top international brands including Asus, Beko, Black and Decker, Elba, Galanz, JBL, Panasonic, Samsung, Skyworth and Quest.",
    aboutOperationsDescriptionTwo: "JMG Service Centre is the accredited service centre for JMG and the brands it represents.",
    aboutShareholdingTitle: "Backed by Scott Investments",
    aboutShareholdingDescriptionOne: "TheBrandHouse's holding company is Scott Investments. Scott Investments is an investment company that has been in business in Mauritius for over 100 years, thereby contributing to the economic and social development of the country.",
    aboutShareholdingDescriptionTwo: "Scott Investments has interests in various fields of activity which include financial services, distribution and retailing.",

    businessesBannerTitle: "Discover our businesses",
    businessesBannerDescription: "TheBrandHouse operates through a connected platform of distribution, retail presence and accredited after-sales support.",
    businessesDistributionTitle: "JMG",
    businessesDistributionDescriptionOne: "JMG is the distribution arm of TheBrandHouse and is one of the most respected organisations in Mauritius in the field of home appliances and consumer electronics.",
    businessesDistributionDescriptionTwo: "JMG acts as the essential link between brand owners and the market, importing, marketing and distributing a wide range of international brands.",
    businessesRetailTitle: "Galaxy and Samsung Brand Concepts",
    businessesRetailDescriptionOne: "TheBrandHouse's retail arm trades through its Galaxy stores as well as three Samsung BrandStore locations.",
    businessesRetailDescriptionTwo: "Located throughout Mauritius, these stores are built to provide customers with high quality products, trusted advice and an excellent customer service experience.",
    businessesServiceTitle: "JMG Service Centre",
    businessesServiceDescriptionOne: "The JMG Service Centre provides after-sales service for brands distributed by JMG.",
    businessesServiceDescriptionTwo: "The team delivers technical training either locally or overseas as provided by principals, and offers both indoor and outdoor repair facilities under and outside warranty.",

    careersIntroTitle: "Interested in joining our team?",
    careersIntroDescriptionOne: "TheBrandHouse is not just any company. It has strong values and aims to be the best in its sector as an employer, supplier and retailer, giving customers the best possible experience.",
    careersIntroDescriptionTwo: "To achieve this, the company recruits and gives opportunities for staff development and, when a vacancy arises, seeks to recruit the best candidates. Appointments are made on merit.",
    careersWhyJoinTitle: "Why join TheBrandHouse?",
    careersWhyJoinDescriptionOne: "The company promotes growth, values commitment, and aims to build a workplace where high standards, strong service and long-term development go together.",
    careersWhyJoinDescriptionTwo: "Recruitment is based on merit, with opportunities for people who want to contribute, improve and grow within the business.",
    careersPeopleTitle: "What kind of people do we look for?",
    careersBenefitsTitle: "Employee benefits",
    careersJobsTitle: "Open positions",
    careersJobsDescription: "Current roles highlighted on the existing site",

    contactTitle: "Contact us",
    contactOfficeTitle: "Head office",
    contactLocationTitle: "Find us in Riche Terre",
    contactLocationDescription: "Tap the location card below to open TheBrandHouse Limited in your device's default maps application.",

    newsHeadingTitle: "Highlights, recognition and company updates",
    newsHeadingDescription: "Follow company milestones, recognitions, launches and important announcements from across TheBrandHouse and its brands.",
    newsFeaturedTitle: "Recognition that reflects business performance",
    newsFeaturedDescription: "Featured updates highlight important achievements such as retail awards, new openings and strategic partnership announcements.",
    newsUpdatesTitle: "Launches, campaigns and milestones",
    newsUpdatesDescription: "Regular company news keeps customers, partners and stakeholders informed about the latest activity across the business.",
    newsArticleTitle: "Samsung Number 1 Retail Partner by Samsung Africa",
    newsArticleMeta: "Company recognition and partnership highlight",
    newsArticleIntro: "Recognized as Samsung Number 1 Retail Partner by Samsung Africa.",
    newsArticleDescriptionOne: "TheBrandHouse, operator of Galaxy and Samsung Brandstore Tribeca Mall, Bagatelle Mall and Riche Terre Mall, was recognised for this achievement by Samsung Africa. The recognition reflects the team's dedication, hard work and collaborative efforts with partners and associates.",
    newsArticleDescriptionTwo: "This recognition reflects the strength of the retail partnership, the commitment of the teams involved and the continued performance of TheBrandHouse in the Mauritian market.",

    storesHeadingTitle: "Retail presence across Mauritius",
    storesHeadingDescription: "Browse TheBrandHouse retail locations across Mauritius through a structured store directory with direct access to each location in Google Maps.",
    storesHeroTitle: "Accessible retail locations across the island",
    storesHeroDescription: "TheBrandHouse retail network is one of the strongest customer-facing parts of the business, combining broad accessibility with recognised shopping concepts."
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
    applyContent();
  });
})();
