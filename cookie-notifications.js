// Email Subscription Cookie Notification Only

(function() {
  // Email Subscription Notification
  function initEmailSubscription() {
    const existingNotif = document.getElementById('email-subscription-notif');
    if (existingNotif) existingNotif.remove();

    const notif = document.createElement('div');
    notif.id = 'email-subscription-notif';
    notif.className = 'cookie-notification email-notification';
    notif.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          <h4>Stay Updated!</h4>
          <p>Get notified about exclusive deals, new events, and Galaxy.mu updates</p>
        </div>
        <div class="email-input-group">
          <input type="email" id="email-subscribe-input" placeholder="Enter your email" class="email-input-cookie" required>
          <button class="email-subscribe-btn">Subscribe</button>
        </div>
        <button class="cookie-close" aria-label="Close email subscription">✕</button>
      </div>
    `;

    document.body.appendChild(notif);

    const closeBtn = notif.querySelector('.cookie-close');
    const emailInput = notif.querySelector('#email-subscribe-input');
    const subscribeBtn = notif.querySelector('.email-subscribe-btn');

    closeBtn.addEventListener('click', () => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
      localStorage.setItem('email-notif-dismissed', 'true');
    });

    subscribeBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      if (!email || !isValidEmail(email)) {
        emailInput.classList.add('error');
        setTimeout(() => emailInput.classList.remove('error'), 500);
        return;
      }

      // Save email to localStorage
      saveEmailSubscription(email);

      // Show thank you message
      showThankYouMessage(email, notif);
    });

    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') subscribeBtn.click();
    });

    setTimeout(() => {
      notif.classList.add('show');
    }, 100);
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function saveEmailSubscription(email) {
    const subscribers = JSON.parse(localStorage.getItem('email-subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('email-subscribers', JSON.stringify(subscribers));
    }

    // Send to backend if available
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).catch(() => {
      // Silently fail if backend not available
    });
  }

  function showThankYouMessage(email, notif) {
    const content = notif.querySelector('.cookie-content');
    content.innerHTML = `
      <div class="thank-you-message">
        <div class="success-icon">✓</div>
        <h4>Thank You!</h4>
        <p>We've received your email: <strong>${escapeHtml(email)}</strong></p>
        <p class="notification-text">You'll receive notifications about:</p>
        <ul class="notification-list">
          <li>🎉 Exclusive deals and promotions</li>
          <li>📅 Upcoming events and launches</li>
          <li>🛍️ Galaxy.mu new arrivals</li>
          <li>💰 Special offers from our partners</li>
        </ul>
        <p class="closing-text">Stay tuned for amazing updates!</p>
      </div>
    `;

    setTimeout(() => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 300);
      localStorage.setItem('email-notif-dismissed', 'true');
    }, 4000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on page load
  window.addEventListener('load', () => {
    // Show email subscription after 10 seconds if not dismissed
    if (!localStorage.getItem('email-notif-dismissed')) {
      setTimeout(() => {
        initEmailSubscription();
      }, 10000);
    }
  });

  // Expose function globally for manual trigger if needed
  window.showEmailSubscription = initEmailSubscription;
})();
