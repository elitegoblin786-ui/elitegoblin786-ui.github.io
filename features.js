// TheBrandHouse Enhanced Features
// Dark Mode Toggle
class DarkMode {
  constructor() {
    this.key = 'tbh-dark-mode';
    this.init();
  }

  init() {
    const isDark = localStorage.getItem(this.key) === 'true';
    if (isDark) this.enable();
    
    // Create toggle button
    this.createToggle();
  }

  createToggle() {
    if (!document.querySelector('.dark-mode-toggle')) {
      const toggle = document.createElement('button');
      toggle.className = 'dark-mode-toggle';
      toggle.innerHTML = '🌙';
      toggle.setAttribute('aria-label', 'Toggle dark mode');
      toggle.addEventListener('click', () => this.toggle());
      document.body.appendChild(toggle);
    }
  }

  toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) this.disable();
    else this.enable();
  }

  enable() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(this.key, 'true');
    this.updateToggle('☀️');
  }

  disable() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(this.key, 'false');
    this.updateToggle('🌙');
  }

  updateToggle(icon) {
    const toggle = document.querySelector('.dark-mode-toggle');
    if (toggle) toggle.innerHTML = icon;
  }
}

// Newsletter Signup
class NewsletterSignup {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('newsletter-form')) {
        e.preventDefault();
        this.handleSubmit(e.target);
      }
    });
  }

  handleSubmit(form) {
    const email = form.querySelector('input[type="email"]');
    if (!email || !this.isValidEmail(email.value)) {
      this.showMessage(form, 'Please enter a valid email', 'error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      this.showMessage(form, 'Successfully subscribed!', 'success');
      form.reset();
    }, 500);
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showMessage(form, message, type) {
    let status = form.querySelector('.newsletter-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'newsletter-status';
      form.appendChild(status);
    }
    status.textContent = message;
    status.className = `newsletter-status ${type}`;
  }
}

// Search Functionality
class SearchFeature {
  constructor() {
    this.searchInput = document.getElementById('productSearch');
    this.init();
  }

  init() {
    if (!this.searchInput) return;
    
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filterProducts(query);
    });
  }

  filterProducts(query) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
      const text = product.textContent.toLowerCase();
      product.style.display = text.includes(query) ? 'block' : 'none';
    });
  }
}

// Smooth Scroll and Reveal
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.reveal');
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, this.options);

    this.elements.forEach(el => observer.observe(el));
  }
}

// Mobile Navigation
class MobileNav {
  constructor() {
    this.toggle = document.querySelector('.mobile-nav-toggle');
    this.nav = document.querySelector('.site-nav');
    this.init();
  }

  init() {
    if (!this.toggle || !this.nav) return;

    this.toggle.addEventListener('click', () => this.toggleMenu());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.nav.classList.toggle('is-open');
    this.toggle.classList.toggle('is-active');
  }

  closeMenu() {
    this.nav.classList.remove('is-open');
    this.toggle.classList.remove('is-active');
  }
}

// Analytics
class Analytics {
  constructor() {
    this.init();
  }

  init() {
    // Track page views
    window.addEventListener('load', () => {
      this.trackPageView();
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href], button')) {
        this.trackEvent('click', {
          element: e.target.className,
          text: e.target.textContent
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.contact-form, .newsletter-form')) {
        this.trackEvent('form_submit', {
          form: e.target.id || 'contact'
        });
      }
    });
  }

  trackPageView() {
    const data = {
      page: window.location.pathname,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    console.log('Page View:', data);
  }

  trackEvent(eventName, eventData) {
    const data = {
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    };
    console.log('Event:', data);
  }
}

// Smooth Counting Animation
class CountUp {
  constructor() {
    this.elements = document.querySelectorAll('.count-up');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.elements.forEach(el => observer.observe(el));
  }

  animate(element) {
    const start = 0;
    const end = parseInt(element.dataset.count) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
}

// Newsletter Popup
class NewsletterPopup {
  constructor() {
    this.key = 'tbh-newsletter-shown';
    this.init();
  }

  init() {
    const shown = sessionStorage.getItem(this.key);
    if (!shown) {
      setTimeout(() => this.show(), 3000);
    }
  }

  show() {
    const popup = document.createElement('div');
    popup.className = 'newsletter-popup';
    popup.innerHTML = `
      <div class="newsletter-popup-content">
        <button class="newsletter-popup-close">&times;</button>
        <h3>Stay Updated!</h3>
        <p>Subscribe to our newsletter for the latest updates and exclusive offers.</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Enter your email" required>
          <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(popup);
    sessionStorage.setItem(this.key, 'true');

    popup.querySelector('.newsletter-popup-close').addEventListener('click', () => {
      popup.remove();
    });
  }
}

// Multi-Language Support
class LanguageSwitcher {
  constructor() {
    this.currentLang = localStorage.getItem('tbh-lang') || 'en';
    this.translations = {
      en: {
        welcome: 'Welcome',
        about: 'About Us',
        businesses: 'Our Businesses',
        blog: 'Blog',
        events: 'Events',
        products: 'Products',
        careers: 'Careers',
        contact: 'Contact',
        stores: 'Our Stores',
        'discover-thebrandhouse': 'Discover TheBrandHouse',
        'trusted-brands': 'Trusted brands, nationwide retail access and dependable service brought together for customers across Mauritius.',
        'discover-more': 'Discover More',
        'view-our-stores': 'View Our Stores',
        'business-legacy': 'Business Legacy',
        'built-on-more-than-a-century': 'Built on more than a century of business heritage',
        'thebrandhouse': 'TheBrandHouse',
        'trusted-distribution': 'Trusted distribution. Modern retail. Reliable service.',
        'customer-experience': 'Customer Experience',
        'how-customers-engage': 'How customers engage with TheBrandHouse',
        'business-pillars': 'Business Pillars',
        'three-connected-strengths': 'Three connected strengths across the customer journey',
        'trust-signals': 'Trust Signals',
        'strengths-that-support': 'Strengths that support long-term trust',
        'why-choose-us': 'Why Choose Us',
        'a-business-platform': 'A business platform built for consistency',
        'brands': 'Brands',
        'recognised-names': 'Recognised names across the portfolio',
        'special-offers': 'Special Offers',
        'current-promotions': 'Current Promotions & Deals',
        'customer-stories': 'Customer Stories',
        'what-our-customers-say': 'What our customers say',
        'explore-more': 'Explore More',
        'discover-the-full': 'Discover the full TheBrandHouse profile'
      },
      fr: {
        welcome: 'Bienvenue',
        about: 'À Propos',
        businesses: 'Nos Entreprises',
        blog: 'Blog',
        events: 'Événements',
        products: 'Produits',
        careers: 'Carrières',
        contact: 'Contact',
        stores: 'Nos Magasins',
        'discover-thebrandhouse': 'Découvrez TheBrandHouse',
        'trusted-brands': 'Marques de confiance, accès retail national et service fiable réunis pour les clients à travers Maurice.',
        'discover-more': 'En Savoir Plus',
        'view-our-stores': 'Voir Nos Magasins',
        'business-legacy': 'Héritage Commercial',
        'built-on-more-than-a-century': 'Construit sur plus d\'un siècle d\'héritage commercial',
        'thebrandhouse': 'TheBrandHouse',
        'trusted-distribution': 'Distribution de confiance. Retail moderne. Service fiable.',
        'customer-experience': 'Expérience Client',
        'how-customers-engage': 'Comment les clients s\'engagent avec TheBrandHouse',
        'business-pillars': 'Piliers d\'Affaires',
        'three-connected-strengths': 'Trois forces connectées à travers le parcours client',
        'trust-signals': 'Signaux de Confiance',
        'strengths-that-support': 'Forces qui soutiennent la confiance à long terme',
        'why-choose-us': 'Pourquoi Nous Choisir',
        'a-business-platform': 'Une plateforme d\'affaires construite pour la cohérence',
        'brands': 'Marques',
        'recognised-names': 'Noms reconnus dans le portefeuille',
        'special-offers': 'Offres Spéciales',
        'current-promotions': 'Promotions et Offres Actuelles',
        'customer-stories': 'Témoignages Clients',
        'what-our-customers-say': 'Ce que disent nos clients',
        'explore-more': 'Explorer Plus',
        'discover-the-full': 'Découvrez le profil complet de TheBrandHouse'
      }
    };
    this.init();
  }

  init() {
    const toggle = document.createElement('div');
    toggle.className = 'language-switcher';
    toggle.innerHTML = `
      <select id="language-select">
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    `;

    const header = document.querySelector('.site-header');
    if (header) header.appendChild(toggle);

    // Set initial language
    this.switchLanguage(this.currentLang);

    document.getElementById('language-select').addEventListener('change', (e) => {
      this.switchLanguage(e.target.value);
    });
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('tbh-lang', lang);

    // Update select value
    const select = document.getElementById('language-select');
    if (select) select.value = lang;

    // Update all translatable elements
    this.updatePageText();
  }

  updatePageText() {
    const translations = this.translations[this.currentLang];

    // Update elements with data attributes
    document.querySelectorAll('[data-cms-text]').forEach(el => {
      const key = el.getAttribute('data-cms-text');
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });

    // Update navigation links
    const navLinks = {
      'about.html': 'about',
      'businesses.html': 'businesses',
      'blog.html': 'blog',
      'events.html': 'events',
      'products.html': 'products',
      'careers.html': 'careers',
      'contact.html': 'contact',
      'stores.html': 'stores'
    };

    Object.entries(navLinks).forEach(([href, key]) => {
      const link = document.querySelector(`nav a[href="${href}"]`);
      if (link && translations[key]) {
        link.textContent = translations[key];
      }
    });

    // Update headings and text content
    const textMappings = {
      'h2': {
        'Discover TheBrandHouse': 'discover-thebrandhouse',
        'How customers engage with TheBrandHouse': 'how-customers-engage',
        'Three connected strengths across the customer journey': 'three-connected-strengths',
        'Strengths that support long-term trust': 'strengths-that-support',
        'A business platform built for consistency': 'a-business-platform',
        'Recognised names across the portfolio': 'recognised-names',
        'Current Promotions & Deals': 'current-promotions',
        'What our customers say': 'what-our-customers-say',
        'Discover the full TheBrandHouse profile': 'discover-the-full'
      },
      'h1': {
        'TheBrandHouse': 'thebrandhouse'
      },
      'span': {
        'Welcome': 'welcome',
        'Business Legacy': 'business-legacy',
        'Customer Experience': 'customer-experience',
        'Business Pillars': 'business-pillars',
        'Trust Signals': 'trust-signals',
        'Why Choose Us': 'why-choose-us',
        'Brands': 'brands',
        'Special Offers': 'special-offers',
        'Customer Stories': 'customer-stories',
        'Explore More': 'explore-more'
      },
      'p': {
        'Trusted brands, nationwide retail access and dependable service brought together for customers across Mauritius.': 'trusted-brands'
      }
    };

    Object.entries(textMappings).forEach(([tag, mappings]) => {
      document.querySelectorAll(`${tag}:not([data-cms-text])`).forEach(el => {
        const text = el.textContent.trim();
        if (mappings[text] && translations[mappings[text]]) {
          el.textContent = translations[mappings[text]];
        }
      });
    });

    // Update specific elements
    const welcomeDesc = document.querySelector('.welcome-banner-content p');
    if (welcomeDesc && translations['trusted-brands']) {
      welcomeDesc.textContent = translations['trusted-brands'];
    }

    const legacyTitle = document.querySelector('.legacy-copy h2');
    if (legacyTitle && translations['built-on-more-than-a-century']) {
      legacyTitle.textContent = translations['built-on-more-than-a-century'];
    }

    const heroHeading = document.querySelector('.hero-copy h2');
    if (heroHeading && translations['trusted-distribution']) {
      heroHeading.textContent = translations['trusted-distribution'];
    }
  }
}

class LocalizedLanguageSwitcher {
  constructor() {
    this.currentLang = localStorage.getItem('tbh-lang') || 'en';
    this.cmsDefaults = {};
    this.navDefaults = {};
    this.translations = {
      fr: {
        documentLang: 'fr',
        nav: {
          'about.html': 'A Propos',
          'businesses.html': 'Nos Entreprises',
          'blog.html': 'Blog',
          'events.html': 'Evenements',
          'products.html': 'Produits',
          'careers.html': 'Carrieres',
          'contact.html': 'Contact',
          'stores.html': 'Nos Magasins'
        },
        cms: {
          welcomeKicker: 'Bienvenue',
          welcomeTitle: 'Decouvrez TheBrandHouse',
          welcomeDescription: 'Des marques de confiance, une presence retail nationale et un service fiable au service des clients a travers Maurice.',
          welcomePrimaryLabel: 'En Savoir Plus',
          welcomeSecondaryLabel: 'Voir Nos Magasins',
          legacyTitle: "Construit sur plus d'un siecle d'heritage commercial",
          legacyDescription: "TheBrandHouse s'appuie sur de solides racines dans le monde des affaires mauricien, en alliant des decennies d'experience a une vision moderne du retail et du service.",
          legacyPrefix: 'Depuis plus de',
          legacySuffix: "ans d'heritage commercial",
          heroHeading: 'Distribution de confiance. Retail moderne. Service fiable.',
          heroDescription: "TheBrandHouse reunit un portefeuille de marques solide, un large reseau de magasins et un service apres-vente fiable pour servir les clients a travers Maurice avec constance.",
          timelineTitle: "Une histoire d'entreprise construite dans le temps",
          timelineDescription: "TheBrandHouse s'appuie sur des decennies d'experience, de developpement retail et d'investissement durable dans le service client.",
          timelineOneTitle: 'Creation de JM Goupille & Co.',
          timelineOneDescription: 'Des racines historiques dans la distribution et la representation de marques a Maurice.',
          timelineTwoTitle: 'Croissance du reseau retail Galaxy',
          timelineTwoDescription: "Une presence directe plus forte aupres des clients grace a une chaine retail reconnue.",
          timelineThreeYear: "Aujourd'hui",
          timelineThreeTitle: 'La plateforme TheBrandHouse',
          timelineThreeDescription: 'Distribution, retail et service reunis sous une seule identite.'
        },
        text: {
          'video-kicker': 'Electronique Premium',
          'video-title': 'Decouvrez la technologie nouvelle generation',
          'video-description': 'Decouvrez les dernieres innovations en electromenager et en electronique grand public.',
          'video-primary': 'Explorer les Produits',
          'video-secondary': 'Voir les Evenements',
          'section-business-legacy': 'Heritage Commercial',
          'hero-pill-roots': 'Racines solides depuis 1930',
          'hero-pill-stores': '28+ magasins a travers l ile',
          'hero-pill-service': 'Distribution, retail et service',
          'hero-about': 'Ouvrir A Propos',
          'hero-businesses': 'Explorer les Entreprises',
          'hero-contact': 'Nous Contacter',
          'hero-card-growth': 'Croissance portee par le portefeuille',
          'hero-card-growth-copy': 'Concepts retail, marques mondiales et ancrage local.',
          'hero-card-support': 'Support centre sur le client',
          'hero-card-support-copy': 'Un accompagnement qui continue bien apres la vente.',
          'hero-highlight-label': "Apercu de l'entreprise",
          'hero-highlight-title': 'Concu pour une confiance durable',
          'hero-highlight-copy': 'Une plateforme qui relie marques, magasins et service sous une identite forte.',
          'stat-roots': 'Racines historiques via JM Goupille & Co.',
          'stat-stores': 'Magasins dans les zones urbaines et rurales',
          'stat-reach-label': 'Portee Client',
          'stat-reach-copy': 'Marques internationales et regionales representees dans le portefeuille',
          'section-customer-experience': 'Experience Client',
          'section-customer-experience-title': 'Comment les clients decouvrent TheBrandHouse',
          'section-customer-experience-copy': 'TheBrandHouse combine une forte presence retail, un service reactif et un support apres-vente de confiance.',
          'section-business-pillars': 'Piliers d Activite',
          'section-business-pillars-title': 'Trois forces connectees tout au long du parcours client',
          'section-business-pillars-copy': 'Le groupe relie distribution, retail et service dans une meme experience.',
          'section-trust-signals': 'Signaux de Confiance',
          'section-trust-signals-title': 'Des atouts qui renforcent la confiance a long terme',
          'section-trust-signals-copy': 'Ancrage local, partenaires reconnus et execution constante sur l ensemble du reseau.',
          'section-why-choose-us': 'Pourquoi Nous Choisir',
          'section-why-choose-us-title': 'Une plateforme d affaires construite pour la constance',
          'section-why-choose-us-copy': 'L organisation relie marques, magasins et service pour offrir une experience plus fiable.',
          'section-milestones': 'Moments Cles',
          'section-brands': 'Marques',
          'section-brands-title': 'Des noms reconnus a travers le portefeuille',
          'section-brands-copy': 'Des partenaires mondiaux et regionaux soutiennent la proposition client de TheBrandHouse.',
          'section-special-offers': 'Offres Speciales',
          'section-special-offers-title': 'Promotions et offres actuelles',
          'section-special-offers-copy': 'Une selection de campagnes commerciales et d offres clients actuellement mises en avant.',
          'section-customer-stories': 'Temoignages Clients',
          'section-customer-stories-title': 'Ce que disent nos clients',
          'section-customer-stories-copy': 'Des retours reels de clients satisfaits a travers Maurice.',
          'section-explore-more': 'Explorer Plus',
          'section-explore-more-title': 'Decouvrez le profil complet de TheBrandHouse',
          'section-explore-more-copy': 'Parcourez les pages qui presentent le groupe, ses activites et son empreinte locale.'
        }
      }
    };
    this.init();
  }

  init() {
    this.captureDefaults();
    this.captureStoredCmsContent();
    this.renderSwitcher();
    this.bindCmsUpdates();
    this.switchLanguage(this.currentLang);
  }

  captureDefaults() {
    document.querySelectorAll('[data-cms-text]').forEach((el) => {
      const key = el.getAttribute('data-cms-text');
      if (key && !this.cmsDefaults[key]) {
        this.cmsDefaults[key] = el.textContent.trim();
      }
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (!el.dataset.i18nDefault) {
        el.dataset.i18nDefault = el.textContent.trim();
      }
    });

    document.querySelectorAll('nav a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && !this.navDefaults[href]) {
        this.navDefaults[href] = link.textContent.trim();
      }
    });
  }

  captureStoredCmsContent() {
    try {
      if (window.tbhCms && typeof window.tbhCms.loadLocal === 'function') {
        this.captureCmsDefaults(window.tbhCms.loadLocal());
      }
    } catch (error) {
      console.warn('Unable to read CMS content for language defaults.', error);
    }
  }

  captureCmsDefaults(content) {
    if (!content) return;

    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        this.cmsDefaults[key] = value;
      }
    });
  }

  renderSwitcher() {
    if (document.querySelector('.language-switcher')) {
      return;
    }

    const toggle = document.createElement('div');
    toggle.className = 'language-switcher';
    toggle.innerHTML = `
      <select id="language-select" aria-label="Select language">
        <option value="en">English</option>
        <option value="fr">Fran&ccedil;ais</option>
      </select>
    `;

    const header = document.querySelector('.site-header');
    if (header) {
      header.appendChild(toggle);
    }

    const select = document.getElementById('language-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.switchLanguage(e.target.value);
      });
    }
  }

  bindCmsUpdates() {
    document.addEventListener('tbh:cms-applied', (event) => {
      this.captureCmsDefaults(event.detail || {});
      this.updatePageText();
    });
  }

  switchLanguage(lang) {
    this.currentLang = this.translations[lang] ? lang : 'en';
    localStorage.setItem('tbh-lang', this.currentLang);

    const select = document.getElementById('language-select');
    if (select) {
      select.value = this.currentLang;
    }

    this.updatePageText();
  }

  updatePageText() {
    const translation = this.translations[this.currentLang];
    document.documentElement.setAttribute('lang', translation?.documentLang || 'en');

    if (!translation) {
      this.restoreCmsText();
      this.restoreStaticText();
      this.restoreNavText();
      return;
    }

    this.applyCmsTranslations(translation.cms || {});
    this.applyStaticTranslations(translation.text || {});
    this.applyNavTranslations(translation.nav || {});
  }

  restoreCmsText() {
    document.querySelectorAll('[data-cms-text]').forEach((el) => {
      const key = el.getAttribute('data-cms-text');
      if (!key) return;

      const defaultText = this.cmsDefaults[key] || el.textContent;
      el.textContent = defaultText;
    });
  }

  restoreStaticText() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.dataset.i18nDefault) {
        el.textContent = el.dataset.i18nDefault;
      }
    });
  }

  restoreNavText() {
    Object.entries(this.navDefaults).forEach(([href, text]) => {
      const link = document.querySelector(`nav a[href="${href}"]`);
      if (link) {
        link.textContent = text;
      }
    });
  }

  applyCmsTranslations(translations) {
    document.querySelectorAll('[data-cms-text]').forEach((el) => {
      const key = el.getAttribute('data-cms-text');
      if (key && translations[key]) {
        el.textContent = translations[key];
      }
    });
  }

  applyStaticTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (key && translations[key]) {
        el.textContent = translations[key];
      }
    });
  }

  applyNavTranslations(translations) {
    Object.entries(translations).forEach(([href, label]) => {
      const link = document.querySelector(`nav a[href="${href}"]`);
      if (link) {
        link.textContent = label;
      }
    });
  }
}

class HeroVideoFallback {
  constructor() {
    this.init();
  }

  init() {
    const heroVideo = document.querySelector('.hero-video');
    const videoContainer = document.querySelector('.video-container');

    if (!heroVideo || !videoContainer || heroVideo.tagName !== 'VIDEO') {
      return;
    }

    const showFallback = () => videoContainer.classList.add('is-fallback');
    const hideFallback = () => videoContainer.classList.remove('is-fallback');

    heroVideo.addEventListener('loadeddata', hideFallback);
    heroVideo.addEventListener('canplay', hideFallback);
    heroVideo.addEventListener('playing', hideFallback);
    heroVideo.addEventListener('error', showFallback);
    heroVideo.addEventListener('stalled', showFallback);
    heroVideo.addEventListener('suspend', () => {
      if (heroVideo.readyState < 2) {
        showFallback();
      }
    });

    window.setTimeout(() => {
      if (heroVideo.readyState < 2) {
        showFallback();
      }
    }, 1800);
  }
}

// Live Chat Widget
class LiveChat {
  constructor() {
    this.init();
  }

  init() {
    const widget = document.createElement('div');
    widget.className = 'live-chat-widget';
    widget.innerHTML = `
      <button class="live-chat-toggle">💬</button>
      <div class="live-chat-window" style="display: none;">
        <div class="live-chat-header">
          <h4>Chat with us</h4>
          <button class="live-chat-close">&times;</button>
        </div>
        <div class="live-chat-messages"></div>
        <input type="text" class="live-chat-input" placeholder="Type a message...">
      </div>
    `;
    
    document.body.appendChild(widget);
    this.setupListeners();
  }

  setupListeners() {
    const toggle = document.querySelector('.live-chat-toggle');
    const close = document.querySelector('.live-chat-close');
    const window = document.querySelector('.live-chat-window');

    toggle.addEventListener('click', () => {
      window.style.display = window.style.display === 'none' ? 'block' : 'none';
    });

    close.addEventListener('click', () => {
      window.style.display = 'none';
    });
  }
}

// Video Player Enhancement
class VideoPlayer {
  constructor() {
    this.init();
  }

  init() {
    // Add click handlers to all video play buttons
    const playButtons = document.querySelectorAll('.video-play-btn');
    playButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openVideoModal(btn);
      });
      
      // Add hover animation
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          duration: 0.3,
          scale: 1.15,
          ease: 'back.out'
        });
      });
      
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          duration: 0.3,
          scale: 1,
          ease: 'back.out'
        });
      });
    });

    // Add parallax effect to video hero
    const videoHero = document.querySelector('.video-hero');
    if (videoHero) {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) {
          gsap.to(heroVideo, {
            duration: 0.1,
            y: scrollY * 0.5,
            ease: 'none'
          });
        }
      });
    }
  }

  openVideoModal(btn) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      width: 90%;
      max-width: 900px;
      aspect-ratio: 16/9;
    `;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
    `;
    iframe.src = 'https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf&autoplay=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: -50px;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 32px;
      cursor: pointer;
      z-index: 10001;
    `;

    closeBtn.addEventListener('click', () => {
      gsap.to(modal, {
        duration: 0.3,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => modal.remove()
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        gsap.to(modal, {
          duration: 0.3,
          opacity: 0,
          ease: 'power2.in',
          onComplete: () => modal.remove()
        });
      }
    });

    videoContainer.appendChild(iframe);
    videoContainer.appendChild(closeBtn);
    modal.appendChild(videoContainer);
    document.body.appendChild(modal);

    gsap.from(videoContainer, {
      duration: 0.4,
      scale: 0.8,
      opacity: 0,
      ease: 'back.out'
    });
  }
}

// Video Card Animations
class VideoAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.animateVideoCards();
    this.setupVideoHoverEffects();
  }

  animateVideoCards() {
    const cards = document.querySelectorAll('.video-card');
    cards.forEach((card, index) => {
      gsap.set(card, {
        opacity: 0,
        y: 40
      });

      gsap.to(card, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        delay: index * 0.15,
        ease: 'power2.out'
      });

      // Add continuous floating effect
      gsap.to(card, {
        duration: 3 + index * 0.3,
        y: -8,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.5
      });
    });
  }

  setupVideoHoverEffects() {
    const cards = document.querySelectorAll('.video-card');
    cards.forEach((card) => {
      const thumbnail = card.querySelector('.video-thumbnail');
      const playBtn = card.querySelector('.video-play-btn');

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          duration: 0.3,
          scale: 1.05,
          ease: 'power2.out'
        });

        if (thumbnail) {
          gsap.to(thumbnail, {
            duration: 0.3,
            filter: 'brightness(1.2)',
            ease: 'power2.out'
          });
        }

        if (playBtn) {
          gsap.to(playBtn, {
            duration: 0.3,
            scale: 1.2,
            boxShadow: '0 12px 48px rgba(255, 107, 45, 0.5)',
            ease: 'back.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          duration: 0.3,
          scale: 1,
          ease: 'power2.out'
        });

        if (thumbnail) {
          gsap.to(thumbnail, {
            duration: 0.3,
            filter: 'brightness(1)',
            ease: 'power2.out'
          });
        }

        if (playBtn) {
          gsap.to(playBtn, {
            duration: 0.3,
            scale: 1,
            boxShadow: '0 8px 32px rgba(255, 107, 45, 0.3)',
            ease: 'back.out'
          });
        }
      });
    });
  }
}

// Parallax Video Effects
class ParallaxVideo {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.updateParallax());
  }

  updateParallax() {
    const videos = document.querySelectorAll('.video-parallax, .video-container');
    videos.forEach((video) => {
      const rect = video.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = rect.top + scrollY;

      if (scrollY < elementTop + window.innerHeight && scrollY > elementTop - window.innerHeight) {
        const offset = (scrollY - elementTop + window.innerHeight / 2) * 0.3;
        gsap.to(video, {
          duration: 0.1,
          y: offset,
          ease: 'none'
        });
      }
    });
  }
}

// Initialize all features on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new DarkMode();
  new NewsletterSignup();
  new SearchFeature();
  new ScrollReveal();
  new MobileNav();
  new Analytics();
  new CountUp();
  new NewsletterPopup();
  new LocalizedLanguageSwitcher();
  new LiveChat();
  new VideoPlayer();
  new HeroVideoFallback();
  new VideoAnimations();
  new ParallaxVideo();

  console.log('✅ TheBrandHouse enhanced features with video support loaded');
});
