// Enhanced Cookie Notification & User Data Management System

(function() {
  // Cookie Management Functions
  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }

  function deleteCookie(name) {
    setCookie(name, '', -1);
  }

  // User Preferences Management
  function saveUserPreferences(data) {
    const preferences = {
      ...getUserPreferences(),
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('tbh-user-preferences', JSON.stringify(preferences));
    setCookie('tbh-user-id', preferences.userId || generateUserId(), 365);
  }

  function getUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('tbh-user-preferences') || '{}');
    } catch {
      return {};
    }
  }

  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cookie Consent Notification
  function initCookieConsent() {
    if (getCookie('tbh-cookie-consent')) return;

    const notif = document.createElement('div');
    notif.id = 'cookie-consent-notif';
    notif.className = 'cookie-notification cookie-consent';
    notif.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          <h4>🍪 We Value Your Privacy</h4>
          <p>We use cookies to enhance your experience, remember your preferences, and provide personalized content. By continuing, you agree to our use of cookies.</p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-accept-btn">Accept All</button>
          <button class="cookie-customize-btn">Customize</button>
          <button class="cookie-decline-btn">Decline</button>
        </div>
      </div>
    `;

    document.body.appendChild(notif);

    const acceptBtn = notif.querySelector('.cookie-accept-btn');
    const customizeBtn = notif.querySelector('.cookie-customize-btn');
    const declineBtn = notif.querySelector('.cookie-decline-btn');

    acceptBtn.addEventListener('click', () => {
      setCookie('tbh-cookie-consent', 'accepted', 365);
      saveUserPreferences({ cookieConsent: 'accepted', analytics: true, marketing: true });
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
      initEmailSubscription();
    });

    customizeBtn.addEventListener('click', () => {
      showCookieCustomization(notif);
    });

    declineBtn.addEventListener('click', () => {
      setCookie('tbh-cookie-consent', 'declined', 365);
      saveUserPreferences({ cookieConsent: 'declined', analytics: false, marketing: false });
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
    });

    setTimeout(() => notif.classList.add('show'), 100);
  }

  // Cookie Customization Panel
  function showCookieCustomization(notif) {
    const content = notif.querySelector('.cookie-content');
    content.innerHTML = `
      <div class="cookie-text">
        <h4>⚙️ Customize Your Experience</h4>
        <p>Choose which cookies you'd like to allow:</p>
      </div>
      <div class="cookie-options">
        <label class="cookie-option">
          <input type="checkbox" checked disabled> 
          <span><strong>Essential Cookies</strong> - Required for basic site functionality</span>
        </label>
        <label class="cookie-option">
          <input type="checkbox" id="analytics-cookies" checked> 
          <span><strong>Analytics Cookies</strong> - Help us improve our website</span>
        </label>
        <label class="cookie-option">
          <input type="checkbox" id="marketing-cookies" checked> 
          <span><strong>Marketing Cookies</strong> - Personalized content and offers</span>
        </label>
        <label class="cookie-option">
          <input type="checkbox" id="preferences-cookies" checked> 
          <span><strong>Preference Cookies</strong> - Remember your settings</span>
        </label>
      </div>
      <div class="cookie-actions">
        <button class="cookie-save-btn">Save Preferences</button>
        <button class="cookie-back-btn">Back</button>
      </div>
    `;

    const saveBtn = content.querySelector('.cookie-save-btn');
    const backBtn = content.querySelector('.cookie-back-btn');

    saveBtn.addEventListener('click', () => {
      const analytics = content.querySelector('#analytics-cookies').checked;
      const marketing = content.querySelector('#marketing-cookies').checked;
      const preferences = content.querySelector('#preferences-cookies').checked;

      setCookie('tbh-cookie-consent', 'customized', 365);
      saveUserPreferences({ 
        cookieConsent: 'customized', 
        analytics, 
        marketing, 
        preferences 
      });

      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);

      if (marketing) {
        setTimeout(() => initEmailSubscription(), 1000);
      }
    });

    backBtn.addEventListener('click', () => {
      initCookieConsent();
      notif.remove();
    });
  }

  // Enhanced Email Subscription with User Data
  function initEmailSubscription() {
    const preferences = getUserPreferences();
    if (!preferences.marketing || localStorage.getItem('email-notif-dismissed')) return;

    const existingNotif = document.getElementById('email-subscription-notif');
    if (existingNotif) existingNotif.remove();

    const notif = document.createElement('div');
    notif.id = 'email-subscription-notif';
    notif.className = 'cookie-notification email-notification';
    notif.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          <h4>📧 Stay Connected with TheBrandHouse!</h4>
          <p>Get exclusive deals, event updates, and Galaxy.mu product launches</p>
        </div>
        <div class="email-form">
          <div class="email-input-group">
            <input type="email" id="email-subscribe-input" placeholder="Enter your email" class="email-input-cookie" required>
            <select id="language-preference" class="language-select-cookie">
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div class="subscription-options">
            <label><input type="checkbox" id="deals-updates" checked> Exclusive Deals</label>
            <label><input type="checkbox" id="events-updates" checked> Events & Launches</label>
            <label><input type="checkbox" id="newsletter-updates"> Monthly Newsletter</label>
          </div>
          <button class="email-subscribe-btn">Subscribe Now</button>
        </div>
        <button class="cookie-close" aria-label="Close email subscription">✕</button>
      </div>
    `;

    document.body.appendChild(notif);

    const closeBtn = notif.querySelector('.cookie-close');
    const emailInput = notif.querySelector('#email-subscribe-input');
    const languageSelect = notif.querySelector('#language-preference');
    const subscribeBtn = notif.querySelector('.email-subscribe-btn');

    // Load saved preferences (but keep email input empty)
    emailInput.value = '';
    if (preferences.language) languageSelect.value = preferences.language;

    closeBtn.addEventListener('click', () => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
      localStorage.setItem('email-notif-dismissed', 'true');
    });

    subscribeBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const language = languageSelect.value;
      const deals = notif.querySelector('#deals-updates').checked;
      const events = notif.querySelector('#events-updates').checked;
      const newsletter = notif.querySelector('#newsletter-updates').checked;

      if (!email || !isValidEmail(email)) {
        emailInput.classList.add('error');
        setTimeout(() => emailInput.classList.remove('error'), 500);
        return;
      }

      // Save comprehensive user data
      saveUserPreferences({
        email,
        language,
        subscriptions: { deals, events, newsletter },
        subscribedAt: new Date().toISOString()
      });

      saveEmailSubscription(email, { language, deals, events, newsletter });
      showThankYouMessage(email, notif);
    });

    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') subscribeBtn.click();
    });

    setTimeout(() => notif.classList.add('show'), 100);
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function saveEmailSubscription(email, preferences) {
    const subscribers = JSON.parse(localStorage.getItem('email-subscribers') || '[]');
    const existingIndex = subscribers.findIndex(sub => sub.email === email);
    
    const subscriberData = {
      email,
      ...preferences,
      subscribedAt: new Date().toISOString(),
      userId: getCookie('tbh-user-id') || generateUserId()
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = subscriberData;
    } else {
      subscribers.push(subscriberData);
    }

    localStorage.setItem('email-subscribers', JSON.stringify(subscribers));

    // Send to backend if available
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriberData)
    }).catch(() => {
      console.log('Backend not available, data saved locally');
    });
  }

  function showThankYouMessage(email, notif) {
    const content = notif.querySelector('.cookie-content');
    content.innerHTML = `
      <div class="thank-you-message">
        <div class="success-icon">✓</div>
        <h4>Thank You for Subscribing!</h4>
        <p>We've received your email: <strong>${escapeHtml(email)}</strong></p>
        <p class="notification-text">We will share further information and exclusive updates with you soon.</p>
        <p class="closing-text">Keep an eye on your inbox!</p>
      </div>
    `;

    setTimeout(() => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
      localStorage.setItem('email-notif-dismissed', 'true');
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on page load
  window.addEventListener('load', () => {
    // Show cookie consent first
    setTimeout(() => {
      initCookieConsent();
    }, 2000);

    // Load saved user preferences
    const preferences = getUserPreferences();
    if (preferences.language && preferences.language !== 'en') {
      // Apply saved language preference
      const languageSelect = document.getElementById('languageSelect');
      if (languageSelect) {
        languageSelect.value = preferences.language;
      }
    }
  });

  // Expose functions globally
  window.TBHCookies = {
    showEmailSubscription: initEmailSubscription,
    showCookieConsent: initCookieConsent,
    getUserPreferences,
    saveUserPreferences,
    clearUserData: () => {
      localStorage.removeItem('tbh-user-preferences');
      localStorage.removeItem('email-subscribers');
      localStorage.removeItem('email-notif-dismissed');
      deleteCookie('tbh-cookie-consent');
      deleteCookie('tbh-user-id');
    }
  };
})();
