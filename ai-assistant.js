(function () {
  const toggle = document.getElementById('aiAssistantToggle');
  const windowEl = document.getElementById('aiAssistantWindow');
  const closeBtn = document.getElementById('aiAssistantClose');
  const input = document.getElementById('aiAssistantInput');
  const sendBtn = document.getElementById('aiAssistantSend');
  const messagesContainer = document.getElementById('aiAssistantMessages');
  const quickBtns = document.querySelectorAll('.ai-quick-btn');
  const headerTitle = document.querySelector('.ai-assistant-header h4');
  const headerSubtitle = document.querySelector('.ai-assistant-header p');
  const assistantInput = document.getElementById('aiAssistantInput');

  if (!toggle || !windowEl || !input || !sendBtn || !messagesContainer) return;

  const knowledgeBase = {
    company: {
      name: 'TheBrandHouse',
      tagline: 'Trusted distribution. Modern retail. Reliable service.',
      founded: '1930 (through JM Goupille & Co.)',
      description: 'Leading distributor and retailer of home appliances and consumer electronics in Mauritius',
      heritage: 'Over 100 years of business legacy'
    },
    businesses: {
      distribution: 'JMG - Import, market presence and channel support for international brands',
      retail: 'Galaxy stores and Samsung BrandStore locations across Mauritius',
      service: 'JMG Service Centre - After-sales support and technical service'
    },
    stores: {
      count: '28+ retail stores',
      coverage: 'Urban and rural areas across Mauritius',
      locations: 'Port Louis, Curepipe, Vacoas, and more',
      address: 'Industrial Park 1, Riche Terre, Mauritius'
    },
    brands: ['Samsung', 'Panasonic', 'Skyworth', 'Beko', 'Elba', 'JBL', 'Asus', 'Black and Decker', 'Galanz', 'Quest'],
    contact: {
      phone: '(+230) 207 1700',
      email: 'info@thebrandhouse.mu',
      address: 'Industrial Park 1, Riche Terre, Mauritius'
    },
    serviceContacts: {
      general: {
        label: 'General enquiries',
        labelFr: 'Demandes générales',
        phone: '(+230) 207 1700',
        email: 'info@thebrandhouse.mu'
      },
      sales: {
        label: 'Sales & store enquiries',
        labelFr: 'Ventes et demandes en magasin',
        phone: '(+230) 207 1702',
        email: 'sales@thebrandhouse.mu'
      },
      support: {
        label: 'Technical support & repairs',
        labelFr: 'Support technique et réparations',
        phone: '(+230) 207 1705',
        email: 'service@thebrandhouse.mu'
      },
      warranty: {
        label: 'Warranty assistance',
        labelFr: 'Assistance garantie',
        phone: '(+230) 207 1711',
        email: 'warranty@thebrandhouse.mu'
      },
      careers: {
        label: 'Careers and recruitment',
        labelFr: 'Carrières et recrutement',
        phone: '(+230) 207 1703',
        email: 'careers@thebrandhouse.mu'
      }
    },
    services: [
      'Product sales and consultation',
      'Technical support and repairs',
      'After-sales service',
      'Warranty support',
      'In-store guidance'
    ]
  };

  const commonHelpTopics = [
    'Store locations and opening hours',
    'Products, brands, and availability',
    'Contact details and customer support',
    'After-sales service and repairs',
    'Company background and businesses',
    'Careers and vacancies'
  ];

  function getCurrentLanguage() {
    return localStorage.getItem('tbh-lang') || 'en';
  }

  function getServiceLabel(service) {
    const lang = getCurrentLanguage();
    return lang === 'fr' && service.labelFr ? service.labelFr : service.label;
  }

  function applyAssistantCopy() {
    if (headerTitle) headerTitle.textContent = 'Customer Support Assistant';
    if (headerSubtitle) headerSubtitle.textContent = 'Hello, how may we assist you today?';
    if (assistantInput) {
      assistantInput.placeholder = 'Ask about stores, products, support, careers, or company information...';
    }

    const quickLabels = [
      { action: 'stores', label: 'Store locations' },
      { action: 'products', label: 'Products & brands' },
      { action: 'contact', label: 'Contact support' }
    ];

    quickBtns.forEach((btn) => {
      const match = quickLabels.find((item) => item.action === btn.dataset.action);
      if (match) btn.textContent = match.label;
    });
  }

  function buildWelcomeMessage() {
    const topicList = commonHelpTopics
      .map((topic) => `<li>${topic}</li>`)
      .join('');

    return `
      <div class="ai-message">
        <div class="ai-message-content">
          <p>Good day. How may we assist you today?</p>
          <p style="margin-top: 12px; font-size: 0.85rem; color: #5f6b7c;">Common topics customers ask about:</p>
          <ul style="margin: 8px 0; padding-left: 18px;">${topicList}</ul>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #5f6b7c;">You may also ask about delivery, returns, warranties, or any general question, and I will guide you to the right information.</p>
        </div>
      </div>
    `;
  }

  function toggleWindow() {
    const isHidden = windowEl.style.display === 'none';
    windowEl.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      input.focus();
    }
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'user-message' : ''}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';

    if (isUser) {
      contentDiv.textContent = text;
    } else {
      contentDiv.innerHTML = text;
    }

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function normalizeQuery(userQuery) {
    return userQuery.toLowerCase().replace(/[^\w\s+@.-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function makeSupportLink(label, href, external = false) {
    const target = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${target} style="color: #477dff; font-weight: 600;">${label}</a>`;
  }

  function generateResponse(userQuery) {
    const query = normalizeQuery(userQuery);

    const generalHelpResponse = () => `
      I can help you with the following:
      <br><br>
      • 🏪 Store locations and opening hours
      <br>
      • 📱 Products, brands, and availability
      <br>
      • 📞 Contact details and support
      <br>
      • 🔧 After-sales service, repairs, and warranty guidance
      <br>
      • 🏢 Company information and business divisions
      <br>
      • 💼 Career opportunities
      <br><br>
      Please tell me what you need help with, and I will guide you to the right page or contact point.
    `;

    if (!query || query === 'help' || query === 'assist' || query === 'support' || query === 'info' || query === 'information') {
      return generalHelpResponse();
    }

    if (
      query.includes('how can i contact') ||
      query.includes('how do i contact') ||
      query.includes('contact the brandhouse') ||
      query.includes('reach the brandhouse') ||
      query.includes('contact thebrandhouse') ||
      query === 'contact'
    ) {
      const details = Object.values(knowledgeBase.serviceContacts)
        .map((item) => `
          <strong>${getServiceLabel(item)}</strong><br>
          📞 ${item.phone}<br>
          📧 <a href="mailto:${item.email}">${item.email}</a><br>
        `)
        .join('<br>');

      return `<strong>Contact TheBrandHouse</strong><br><br>${details}<br>${makeSupportLink('Open the contact page →', 'contact.html')}`;
    }

    if (
      query.includes('store') ||
      query.includes('location') ||
      query.includes('branch') ||
      query.includes('find') ||
      query.includes('near me') ||
      query.includes('address') ||
      query.includes('opening hours') ||
      query.includes('open')
    ) {
      return `We have <strong>${knowledgeBase.stores.count}</strong> across Mauritius, including Galaxy and Samsung BrandStore locations.<br><br>Our main office is at:<br><strong>${knowledgeBase.contact.address}</strong><br><br>We serve customers in urban and rural areas including ${knowledgeBase.stores.locations}.<br><br>${makeSupportLink('View all store locations →', 'stores.html')}`;
    }

    if (
      query.includes('product') ||
      query.includes('brand') ||
      query.includes('appliance') ||
      query.includes('electronic') ||
      query.includes('available') ||
      query.includes('sell') ||
      query.includes('catalog')
    ) {
      return `We carry leading brands including:<br><strong>${knowledgeBase.brands.join(', ')}</strong><br><br>We offer home appliances and consumer electronics across multiple categories.<br><br>${makeSupportLink('Browse products on Galaxy.mu →', 'https://galaxy.mu', true)}`;
    }

    if (
      query.includes('contact') ||
      query.includes('phone') ||
      query.includes('email') ||
      query.includes('reach') ||
      query.includes('call') ||
      query.includes('message')
    ) {
      const details = Object.values(knowledgeBase.serviceContacts)
        .map((item) => `
          <strong>${getServiceLabel(item)}</strong><br>
          📞 ${item.phone}<br>
          📧 <a href="mailto:${item.email}">${item.email}</a><br>
        `)
        .join('<br>');

      return `<strong>Contact TheBrandHouse</strong><br><br>${details}<br>${makeSupportLink('Open the contact page →', 'contact.html')}`;
    }

    if (
      query.includes('about') ||
      query.includes('company') ||
      query.includes('who are you') ||
      query.includes('history') ||
      query.includes('heritage') ||
      query.includes('business')
    ) {
      return `<strong>About TheBrandHouse</strong><br><br>We are a leading distributor and retailer of home appliances and consumer electronics in Mauritius.<br><br><strong>Our Heritage:</strong> ${knowledgeBase.company.heritage}.<br><br><strong>Our Mission:</strong> ${knowledgeBase.company.tagline}.<br><br><strong>Our Business Areas:</strong><br>• JMG Distribution<br>• Galaxy Retail Stores<br>• JMG Service Centre<br><br>${makeSupportLink('Learn more about us →', 'about.html')}`;
    }

    if (
      query.includes('service') ||
      query.includes('support') ||
      query.includes('repair') ||
      query.includes('warranty') ||
      query.includes('after sales') ||
      query.includes('after sales service')
    ) {
      return `<strong>After-sales support and service</strong><br><br>${knowledgeBase.services.map((service) => `✓ ${service}`).join('<br>')}<br><br>Our JMG Service Centre is here to help after purchase.<br><br>${makeSupportLink('Contact our service team →', 'contact.html')}`;
    }

    if (
      query.includes('career') ||
      query.includes('job') ||
      query.includes('work') ||
      query.includes('hire') ||
      query.includes('vacancy') ||
      query.includes('employment')
    ) {
      return `<strong>Career opportunities at TheBrandHouse</strong><br><br>We welcome talented people who want to grow with us. Typical benefits and opportunities include:<br><br>✓ Competitive compensation<br>✓ Employee rewards programs<br>✓ Staff development and growth<br>✓ Health and wellness benefits<br>✓ A customer-focused work environment<br><br>${makeSupportLink('View open positions →', 'careers.html')}`;
    }

    if (
      query.includes('delivery') ||
      query.includes('return') ||
      query.includes('refund') ||
      query.includes('order') ||
      query.includes('payment') ||
      query.includes('invoice') ||
      query.includes('shipping')
    ) {
      return `For delivery, returns, refunds, payment, or order-related questions, I recommend contacting our support team so we can guide you to the right department.<br><br>${makeSupportLink('Open the contact page →', 'contact.html')}<br><br>If you share the product or store involved, I can help you narrow down the best next step.`;
    }

    if (query.includes('hours') || query.includes('time') || query.includes('open') || query.includes('when')) {
      return `Store hours can vary by location. The fastest way to confirm opening times is to check the store location or contact our team directly.<br><br>${makeSupportLink('View store locations →', 'stores.html')}<br><br>${makeSupportLink('Contact support →', 'contact.html')}`;
    }

    if (query.includes('what can you do') || query.includes('how can you help') || query.includes('help me')) {
      return generalHelpResponse();
    }

    return `I may be able to help with that. Please mention whether your question is about stores, products, contact details, service, careers, or company information.<br><br>If you are not sure, start with any question and I will guide you to the most relevant page or support contact.`;
  }

  function handleUserMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    setTimeout(() => {
      const response = generateResponse(text);
      addMessage(response, false);
    }, 300);
  }

  function handleQuickAction(action) {
    const actionMap = {
      stores: 'Store locations and opening hours',
      products: 'What brands do you carry?',
      contact: 'How can I contact TheBrandHouse?'
    };

    const query = actionMap[action] || action;
    addMessage(query, true);

    setTimeout(() => {
      const response = generateResponse(query);
      addMessage(response, false);
    }, 300);
  }

  applyAssistantCopy();

  messagesContainer.innerHTML = buildWelcomeMessage();

  toggle.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

  sendBtn.addEventListener('click', handleUserMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserMessage();
    }
  });

  quickBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      handleQuickAction(action);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && windowEl.style.display !== 'none') {
      toggleWindow();
    }
  });
})();
