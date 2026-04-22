// Advanced Animation & Video Enhancement
// This script provides additional animation effects and video integration enhancements

class AdvancedAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverGlowEffects();
    this.setupTextAnimations();
    this.setupImageLazyLoading();
    this.setupStaggerAnimations();
  }

  // Scroll-triggered animations for more elements
  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.from(entry.target, {
            duration: 0.8,
            opacity: 0,
            y: 30,
            ease: 'power2.out'
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('[data-scroll-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  // Glowing hover effects on buttons and cards
  setupHoverGlowEffects() {
    const glowElements = document.querySelectorAll('.btn, .card, .video-card');
    
    glowElements.forEach((el) => {
      el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create glow effect
        gsap.to(el, {
          duration: 0.3,
          boxShadow: `0 0 30px rgba(255, 107, 45, 0.5)`,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          duration: 0.3,
          boxShadow: 'none',
          ease: 'power2.out'
        });
      });
    });
  }

  // Text split animations
  setupTextAnimations() {
    const headings = document.querySelectorAll('h1, h2, h3');
    
    headings.forEach((heading) => {
      const text = heading.textContent;
      const chars = text.split('').map((char, i) => {
        return `<span style="display:inline-block;opacity:0;" data-char="${i}">${char}</span>`;
      });
      
      heading.innerHTML = chars.join('');

      gsap.from(heading.querySelectorAll('span'), {
        duration: 0.5,
        opacity: 0,
        y: 20,
        stagger: 0.05,
        ease: 'back.out',
        delay: Math.random() * 0.2
      });
    });
  }

  // Lazy load images with animation
  setupImageLazyLoading() {
    const images = document.querySelectorAll('img[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.lazy;
          img.removeAttribute('data-lazy');
          
          gsap.from(img, {
            duration: 0.6,
            opacity: 0,
            scale: 1.05,
            ease: 'power2.out'
          });

          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Stagger animations for lists and grids
  setupStaggerAnimations() {
    const staggerGroups = document.querySelectorAll('[data-stagger]');
    
    staggerGroups.forEach((group) => {
      const children = group.querySelectorAll('> *');
      
      gsap.from(children, {
        duration: 0.6,
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });
  }
}

// Video Background Control
class VideoBackgroundControl {
  constructor() {
    this.init();
  }

  init() {
    this.setupVideoAutoplay();
    this.setupVideoQualityControl();
    this.setupVideoMuteControl();
  }

  setupVideoAutoplay() {
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach(video => {
      // Handle autoplay on mobile
      video.muted = true;
      video.play().catch(() => {
        console.log('Autoplay prevented');
      });
    });
  }

  setupVideoQualityControl() {
    const iframes = document.querySelectorAll('iframe[src*="youtube"]');
    iframes.forEach(iframe => {
      // Add quality parameter to YouTube embeds
      if (!iframe.src.includes('quality')) {
        iframe.src += '&quality=hd720';
      }
    });
  }

  setupVideoMuteControl() {
    const videos = document.querySelectorAll('.hero-video, .video-bg');
    videos.forEach(video => {
      video.muted = true;
    });
  }
}

// Mouse Tracking Effects
class MouseTracking {
  constructor() {
    this.init();
  }

  init() {
    this.setupMouseFollower();
    this.setupMouseGlow();
  }

  setupMouseFollower() {
    const elements = document.querySelectorAll('[data-mouse-follow]');
    
    if (elements.length === 0) return;

    document.addEventListener('mousemove', (e) => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          duration: 0.5,
          rotationX: (y / rect.height) * 5,
          rotationY: (x / rect.width) * 5,
          ease: 'power2.out'
        });
      });
    });
  }

  setupMouseGlow() {
    const glowElement = document.createElement('div');
    glowElement.className = 'mouse-glow';
    glowElement.style.cssText = `
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 107, 45, 0.3), transparent);
      pointer-events: none;
      z-index: -1;
      filter: blur(80px);
      display: none;
    `;
    document.body.appendChild(glowElement);

    document.addEventListener('mousemove', (e) => {
      gsap.to(glowElement, {
        duration: 0.3,
        left: e.clientX - 200,
        top: e.clientY - 200,
        ease: 'power2.out'
      });
    });

    document.addEventListener('mouseenter', () => {
      glowElement.style.display = 'block';
    });

    document.addEventListener('mouseleave', () => {
      glowElement.style.display = 'none';
    });
  }
}

// Performance Optimizations
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.reduceAnimationsOnMobile();
    this.setupIntersectionOptimization();
  }

  reduceAnimationsOnMobile() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // Reduce stagger delays on mobile
      document.documentElement.style.setProperty('--stagger-delay', '0.05s');
      
      // Disable parallax on mobile
      if (window.gsap) {
        document.querySelectorAll('[data-parallax]').forEach(el => {
          el.removeAttribute('data-parallax');
        });
      }
    }
  }

  setupIntersectionOptimization() {
    // Stop animations for elements outside viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.target.gsapTimelines) {
          entry.target.gsapTimelines.forEach(tl => tl.pause());
        } else if (entry.isIntersecting && entry.target.gsapTimelines) {
          entry.target.gsapTimelines.forEach(tl => tl.play());
        }
      });
    });

    document.querySelectorAll('[data-optimize]').forEach(el => {
      observer.observe(el);
    });
  }
}

// Video Analytics
class VideoAnalytics {
  constructor() {
    this.init();
  }

  init() {
    this.trackVideoViews();
    this.trackVideoEngagement();
  }

  trackVideoViews() {
    const videos = document.querySelectorAll('.video-card, .hero-video');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.logEvent('video_view', {
            video: entry.target.querySelector('img')?.alt || 'unknown',
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    videos.forEach(video => observer.observe(video));
  }

  trackVideoEngagement() {
    const playButtons = document.querySelectorAll('.video-play-btn');
    
    playButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.logEvent('video_play', {
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  logEvent(eventName, eventData) {
    if (window.gtag) {
      gtag('event', eventName, eventData);
    } else {
      console.log(`📊 Event: ${eventName}`, eventData);
    }
  }
}

// Initialize all advanced features on DOM ready
if (window.gsap) {
  document.addEventListener('DOMContentLoaded', () => {
    new AdvancedAnimations();
    new VideoBackgroundControl();
    new MouseTracking();
    new PerformanceOptimizer();
    new VideoAnalytics();

    console.log('✅ Advanced animations and video enhancements loaded');
  });
} else {
  console.warn('GSAP library not found. Some advanced animations may not work.');
}
