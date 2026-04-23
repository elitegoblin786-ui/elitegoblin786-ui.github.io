(function() {
  if (!window.gsap) return;
  
  const banner = document.querySelector('.welcome-banner');
  if (!banner) return;
  
  const content = banner.querySelector('.welcome-banner-content');
  if (!content) return;
  
  const kicker = content.querySelector('.hero-kicker');
  const title = content.querySelector('h2');
  const desc = content.querySelector('p');
  const buttons = content.querySelectorAll('.btn');
  
  // Create overlay for particles
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;overflow:hidden';
  banner.style.position = 'relative';
  banner.insertBefore(overlay, content);
  
  // Create particles
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const s = Math.random() * 5 + 2;
    p.style.cssText = `position:absolute;width:${s}px;height:${s}px;background:radial-gradient(circle,rgba(111,255,215,0.9),rgba(111,255,215,0.2));border-radius:50%;box-shadow:0 0 ${Math.random()*15+8}px rgba(111,255,215,0.7);left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:0`;
    overlay.appendChild(p);
  }
  
  // Create scan line
  const scan = document.createElement('div');
  scan.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(111,255,215,0.3) 50%,transparent 70%);opacity:0;height:80px';
  overlay.appendChild(scan);
  
  // Set initial states
  gsap.set([kicker, title, desc, buttons], {opacity: 0, y: 30});
  gsap.set(overlay.querySelectorAll('div:not([style*="position:absolute"])'), {opacity: 0, scale: 0});
  
  // Intersection observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !banner.dataset.anim) {
        banner.dataset.anim = '1';
        animate();
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.15});
  
  obs.observe(banner);
  
  function animate() {
    const tl = gsap.timeline();
    
    // Scan line
    tl.to(scan, {opacity: 1, duration: 0.3, ease: 'power2.in'})
      .to(scan, {y: '100%', duration: 1.4, ease: 'power2.out'}, '-=0.1')
      .to(scan, {opacity: 0, duration: 0.2}, '-=0.2');
    
    // Particles
    tl.to(overlay.querySelectorAll('div:first-child, div:nth-child(2), div:nth-child(3), div:nth-child(4), div:nth-child(5), div:nth-child(6), div:nth-child(7), div:nth-child(8), div:nth-child(9), div:nth-child(10), div:nth-child(11), div:nth-child(12), div:nth-child(13), div:nth-child(14), div:nth-child(15), div:nth-child(16), div:nth-child(17), div:nth-child(18), div:nth-child(19), div:nth-child(20)'), {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: {amount: 0.4, from: 'random'},
      ease: 'back.out(2)'
    }, '-=1');
    
    // Float particles
    gsap.to(overlay.querySelectorAll('div:not([style*="background:linear"])'), {
      y: '+=35',
      x: '+=25',
      duration: 3.5,
      stagger: 0.08,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
    
    // Content
    if (kicker) tl.to(kicker, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, '-=0.7');
    if (title) tl.to(title, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, '-=0.4');
    if (desc) tl.to(desc, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, '-=0.3');
    tl.to(buttons, {opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.5)'}, '-=0.2');
    
    // Glow pulse on title
    if (title) {
      gsap.to(title, {
        textShadow: ['0 0 15px rgba(111,255,215,0.3)', '0 0 35px rgba(111,255,215,0.8)', '0 0 15px rgba(111,255,215,0.3)'],
        duration: 2,
        repeat: -1,
        ease: 'sine.inOut'
      });
    }
  }
})();
