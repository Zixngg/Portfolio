const bg = document.querySelector('.bubble-bg');

for (let i = 0; i < 12; i++) {
  const b = document.createElement('div');
  b.className = 'bubble';

  const size = Math.random() * 180 + 120;
  b.style.width = size + 'px';
  b.style.height = size + 'px';

  b.style.left = Math.random() * 100 + '%';
  b.style.top = Math.random() * 100 + '%';

  b.style.animationDuration = (10 + Math.random() * 10) + 's';

  bg.appendChild(b);
}

// CAROUSEL FUNCTIONALITY
function initCarousel(carouselElement) {
  const track = carouselElement.querySelector('.carousel-track');
  const slides = carouselElement.querySelectorAll('.carousel-slide');
  const prevBtn = carouselElement.querySelector('.carousel-btn-prev');
  const nextBtn = carouselElement.querySelector('.carousel-btn-next');
  const dotsContainer = carouselElement.parentElement.querySelector('.carousel-dots');
  const isClickable = carouselElement.classList.contains('carousel-clickable');
  
  const totalSlides = slides.length;
  let currentIndex = 1; // Start at 1 because we'll add clones
  let autoScrollInterval = null;
  let isTransitioning = false;

  // Clone slides for seamless loop - add multiple clones for smoother transitions
  const firstClone = slides[0].cloneNode(true);
  const secondClone = slides[0].cloneNode(true);
  const lastClone = slides[totalSlides - 1].cloneNode(true);
  const secondLastClone = slides[totalSlides - 1].cloneNode(true);
  
  firstClone.classList.add('clone');
  secondClone.classList.add('clone');
  lastClone.classList.add('clone');
  secondLastClone.classList.add('clone');
  
  // Add clones: [secondLast, last, ...real slides..., first, second]
  track.insertBefore(secondLastClone, slides[0]);
  track.insertBefore(lastClone, slides[0]);
  track.appendChild(firstClone);
  track.appendChild(secondClone);

  // Get all slides including clones
  const allSlides = track.querySelectorAll('.carousel-slide');

  // Create dots (only for real slides, not clones)
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
  
  // Get dots for state management
  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function updateCarousel(instant = false) {
    // Get container width for accurate calculation
    const container = track.parentElement;
    const containerWidth = container.offsetWidth || container.clientWidth;
    
    // Each slide is 70% of container width, plus 20px gap
    const slideWidth = (containerWidth * 0.7);
    const gap = 20;
    const totalSlideWidth = slideWidth + gap;
    
    // Calculate position: move by (currentIndex * totalSlideWidth) then center
    const centerOffset = (containerWidth - slideWidth) / 2;
    const moveDistance = (currentIndex * totalSlideWidth) - centerOffset;
    
    if (instant) {
      // Disable transition for instant update
      track.style.transition = 'none';
      track.style.transform = `translateX(-${moveDistance}px) translateZ(0)`;
      // Force reflow to ensure instant update is applied
      void track.offsetHeight;
    } else {
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = `translateX(-${moveDistance}px) translateZ(0)`;
    }
    
    // Update active classes for slides
    allSlides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next');
      if (index === currentIndex) {
        slide.classList.add('active');
      } else if (index === currentIndex - 1) {
        slide.classList.add('prev');
      } else if (index === currentIndex + 1) {
        slide.classList.add('next');
      }
    });
    
    // Update dots based on real slide index
    const realIndex = getRealIndex();
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === realIndex);
    });
  }
  
  // Adjust initial position (we start at index 2, which is the first real slide after 2 clones)
  currentIndex = 2;
  
  // Initialize carousel state after everything is set up
  // Wait for next frame to ensure layout is calculated
  requestAnimationFrame(() => {
    updateCarousel(true);
  });

  function getRealIndex() {
    // Account for 2 clones at the beginning (secondLast and last)
    // Index 0,1 = clones (secondLast, last)
    // Index 2 to totalSlides+1 = real slides
    // Index totalSlides+2, totalSlides+3 = clones (first, second)
    if (currentIndex <= 1) {
      // At cloned last slides at the beginning
      return totalSlides - (2 - currentIndex);
    }
    if (currentIndex >= totalSlides + 2) {
      // At cloned first slides at the end
      return currentIndex - (totalSlides + 2);
    }
    // Real slides in the middle
    return currentIndex - 2;
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    currentIndex = index + 2; // +2 because of 2 cloned slides at the beginning
    updateCarousel();
    resetAutoScroll();
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel();
    
    // Handle seamless loop transition
    const handleTransitionEnd = () => {
      track.removeEventListener('transitionend', handleTransitionEnd);
      
      // If we're at the cloned first slides, instantly jump to real first slide
      // Use requestAnimationFrame to ensure smooth jump during browser paint cycle
      if (currentIndex >= allSlides.length - 2) {
        requestAnimationFrame(() => {
          currentIndex = 2; // Jump to first real slide (after 2 clones at start)
          updateCarousel(true);
          isTransitioning = false;
        });
      } else {
        isTransitioning = false;
      }
    };
    
    track.addEventListener('transitionend', handleTransitionEnd, { once: true });
    resetAutoScroll();
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel();
    
    // Handle seamless loop transition
    const handleTransitionEnd = () => {
      track.removeEventListener('transitionend', handleTransitionEnd);
      
      // If we're at the cloned last slides, instantly jump to real last slide
      // Use requestAnimationFrame to ensure smooth jump during browser paint cycle
      if (currentIndex <= 1) {
        requestAnimationFrame(() => {
          currentIndex = totalSlides + 1; // Jump to last real slide (after 2 clones at start)
          updateCarousel(true);
          isTransitioning = false;
        });
      } else {
        isTransitioning = false;
      }
    };
    
    track.addEventListener('transitionend', handleTransitionEnd, { once: true });
    resetAutoScroll();
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      nextSlide();
    }, 3000);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  // Event listeners
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
  });
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
  });

  // Clickable projects - open modal (only for real slides, not clones)
  if (isClickable) {
    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        openProjectModal(index, slide);
      });
    });
    // Also add click handlers to clones
    const clones = track.querySelectorAll('.clone');
    clones.forEach((clone, cloneIndex) => {
      clone.addEventListener('click', () => {
        const realIndex = cloneIndex === 0 ? totalSlides - 1 : 0;
        openProjectModal(realIndex, clone);
      });
    });
  }

  // Auto-scroll every 3 seconds
  startAutoScroll();

  // Pause on hover
  carouselElement.addEventListener('mouseenter', stopAutoScroll);
  carouselElement.addEventListener('mouseleave', startAutoScroll);
  
  // Recalculate on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(true);
    }, 100);
  });

  // Keyboard navigation
  carouselElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch/swipe support for mobile
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  carouselElement.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoScroll();
  });

  carouselElement.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });

  carouselElement.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startAutoScroll();
  });
}

// PROJECT MODAL FUNCTIONALITY
const projectData = [
  {
    title: "Project Title 1",
    description: "This is a detailed description of your first project. You can include information about the technologies used, challenges faced, and outcomes achieved.",
    image: "images/projects/1.jpg",
    tags: ["React", "Node.js", "MongoDB"]
  },
  {
    title: "Project Title 2",
    description: "This is a detailed description of your second project. Explain what problem it solves and how you built it.",
    image: "images/projects/2.jpg",
    tags: ["Python", "FastAPI", "PostgreSQL"]
  },
  {
    title: "Project Title 3",
    description: "This is a detailed description of your third project. Share your learning journey and key achievements.",
    image: "images/projects/3.jpg",
    tags: ["JavaScript", "Vue.js", "Firebase"]
  }
];

function openProjectModal(index, slideElement) {
  const modal = document.getElementById('projectModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalTags = document.getElementById('modalTags');

  const project = projectData[index] || {
    title: `Project ${index + 1}`,
    description: "Project details coming soon.",
    image: slideElement.querySelector('img').src,
    tags: []
  };

  modalImage.src = project.image;
  modalImage.alt = project.title;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  
  // Clear and add tags
  modalTags.innerHTML = '';
  project.tags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.textContent = tag;
    modalTags.appendChild(tagElement);
  });

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// CONTENT MODAL FUNCTIONALITY
const contentData = {
  'about-intro': {
    title: 'Introduction',
    content: `
      <p>Hello! My name is Wang Zixing, and I'm currently a third-year Information Technology student at Singapore Polytechnic, specializing in Software Development. I'm passionate about using technology to solve real problems, build meaningful digital experiences, and make a positive impact on people's lives.</p>
    `
  },
  'about-journey': {
    title: 'Technical Journey',
    content: `
      <p>My journey in IT began in my first year, when I discovered how much I enjoyed coding. I especially love the process of troubleshooting, building programs from scratch, and seeing ideas come to life through software. Since then, I've been actively expanding my technical skillset, gaining hands-on experience in Java, JavaScript, HTML, CSS, MySQL, Power BI, and various productivity tools like Microsoft Excel and Google Sheets.</p>
    `
  },
  'about-values': {
    title: 'Values & Leadership',
    content: `
      <p>Beyond academics, I strongly value teamwork, communication, and leadership. Having participated in team sports like Netball and Floorball, I've developed resilience, discipline, and the ability to collaborate effectively under pressure. These foundational qualities now guide how I approach group projects and technical work.</p>
      <p>At Singapore Polytechnic, I also serve as the Treasurer of the School of Computing Club (SOCC), and I previously contributed as a Logistics Subcommittee Member. This role has strengthened my organisational and budgeting skills, and it's given me opportunities to support student events and initiatives within the School of Computing.</p>
    `
  },
  'about-aspirations': {
    title: 'Future Goals',
    content: `
      <p>I aspire to further my education in Computer Science or Information Systems and continue developing my technical expertise, while also contributing to the communities around me. Whether through software, data, or service, I hope to build solutions that enhance user experience, create value, and drive positive change.</p>
    `
  },
  'socc-treasurer': {
    title: 'SOCC Treasurer (2024-2025 April)',
    content: `
      <p><strong>School of Computing Club (SOCC), Singapore Polytechnic</strong></p>
      <ul>
        <li>I manage and oversee the club's financial matters, including budgeting, expense tracking, and fund allocation for events.</li>
        <li>I work closely with the executive committee to plan and support student engagement activities.</li>
      </ul>
    `
  },
  'socc-logistics': {
    title: 'SOCC Logistics Subcommittee Member (2023)',
    content: `
      <p><strong>School of Computing Club (SOCC), Singapore Polytechnic</strong></p>
      <ul>
        <li>I assisted in planning and executing event logistics using Excel and Google Sheets for inventory management, equipment preparation, and event coordination.</li>
      </ul>
    `
  },
  'school-ambassador': {
    title: 'Certificate of Appreciation - School Ambassador (2024)',
    content: `
      <ul>
        <li>I was awarded this certificate by the School of Computing, Singapore Polytechnic, in recognition of my outstanding contributions as a School Ambassador.</li> 
        <li>I supported outreach events and represented the school to prospective students.</li>
      <ul>
    `
  },
  'sp-cares': {
    title: 'SP CARES Food Donation Drive',
    content: `
      <p><strong>Singapore Polytechnic | Student Volunteer</strong></p>
      <ul>
        <li>I donated food items and contributed to SP's campus-wide initiative supporting families and individuals in need.</li>
        <li>This experience helped me develop a deeper appreciation for community support and social responsibility.</li>
      </ul>
    `
  },
  'touch-community': {
    title: 'TOUCH Community Services - Meals on Wheels',
    content: `
      <p><strong>Student Volunteer</strong></p>
      <ul>
        <li>I delivered meals to elderly residents in Bukit Panjang through a door-to-door outreach programme.</li>
        <li>Interacting with seniors helped me gain a better understanding of empathy, inclusiveness, and the importance of community care.</li>
      </ul>
    `
  },
  'foodnotes': {
    title: 'Bukit Panjang Youth Network - FoodNotes 2023 (PAYM)',
    content: `
      <p><strong>Student Volunteer</strong></p>
      <ul>
        <li>I supported food-collection activities by gathering donated items from residents and preparing them for distribution.</li>
        <li>This experience strengthened my teamwork and communication skills through collaboration with other youth volunteers.</li>
      </ul>
    `
  },
  'sparkletots': {
    title: 'PCF Sparkletots - Children\'s Day Event',
    content: `
      <p><strong>Welfare Services Club | Student Volunteer</strong></p>
      <ul>
        <li>I engaged young children through games and activities designed to create a joyful and memorable Children's Day.</li>
        <li>This experience helped me develop interpersonal and communication skills while contributing to a fun learning environment.</li>
      </ul>
    `
  }
};

function openContentModal(modalId) {
  const modal = document.getElementById('contentModal');
  const modalTitle = document.getElementById('contentModalTitle');
  const modalBody = document.getElementById('contentModalBody');

  const content = contentData[modalId];
  if (!content) return;

  modalTitle.textContent = content.title;
  modalBody.innerHTML = content.content;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeContentModal() {
  const modal = document.getElementById('contentModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// SECTION INDICATOR FUNCTIONALITY
function initSectionIndicator() {
  const sections = document.querySelectorAll('section[id]');
  const indicators = document.querySelectorAll('.section-indicator-dot');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  function updateIndicator() {
    const scrollPos = window.scrollY + 200; // Offset for better detection
    let currentSectionId = null;
    
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = sectionId;
        
        // Update section indicator dots
        indicators.forEach(indicator => {
          indicator.classList.remove('active');
          if (indicator.getAttribute('data-section') === sectionId) {
            indicator.classList.add('active');
          }
        });
        
        // Update nav links (exclude nav-btn)
        navLinks.forEach(link => {
          if (link.classList.contains('nav-btn')) return;
          const href = link.getAttribute('href');
          if (href === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
    
    // Handle case when at top of page (header section)
    if (window.scrollY < 100) {
      currentSectionId = null;
      navLinks.forEach(link => link.classList.remove('active'));
      indicators.forEach(indicator => indicator.classList.remove('active'));
    }
    
    // Update URL hash to reflect current section (without triggering scroll)
    const newHash = currentSectionId ? `#${currentSectionId}` : '';
    if (window.location.hash !== newHash) {
      // Use replaceState to update URL without adding to history or triggering scroll
      // If newHash is empty, remove hash by using pathname + search
      const newUrl = newHash 
        ? newHash 
        : window.location.pathname + window.location.search;
      history.replaceState(null, '', newUrl);
    }
  }
  
  // Update on scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateIndicator();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial update
  updateIndicator();
  
  // Smooth scroll on indicator click
  indicators.forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = indicator.getAttribute('data-section');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        const offset = 100;
        const targetPosition = targetSection.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// PAGE LOADER
function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
}

// Keep browser scroll restoration but prevent unwanted scrolling on refresh
// Handle scroll prevention immediately to catch it before restoration happens
(function() {
  const hash = window.location.hash;
  
  if (!hash) {
    // No hash: prevent unwanted scroll restoration on refresh
    // Temporarily disable scroll restoration to prevent unwanted scroll on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Keep checking and correcting scroll position until page is fully loaded
    let checkCount = 0;
    const maxChecks = 20;
    const checkScroll = () => {
      if (window.scrollY > 0 && checkCount < maxChecks) {
        window.scrollTo(0, 0);
        checkCount++;
        requestAnimationFrame(checkScroll);
      }
    };
    
    // Start checking immediately
    requestAnimationFrame(checkScroll);
    
    // Also check on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
        // Restart checking
        checkCount = 0;
        requestAnimationFrame(checkScroll);
      }
    }, { once: true });
    
    // Re-enable scroll restoration after page fully loads (for future navigations)
    window.addEventListener('load', () => {
      // Final scroll to top
      window.scrollTo(0, 0);
      
      // One more check after a short delay
      setTimeout(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
        
        // Re-enable scroll restoration for normal navigation
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'auto';
        }
      }, 100);
    }, { once: true });
  } else {
    // Has hash: ensure we scroll to the hash section, overriding any scroll restoration
    // This ensures that when you refresh at /#internship, you stay at that section
    window.addEventListener('load', () => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        // Wait for any scroll restoration to complete, then scroll to hash section
        setTimeout(() => {
          const offset = 100;
          const targetPosition = targetElement.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'auto' // Use 'auto' instead of 'smooth' for immediate scroll
          });
        }, 100);
      }
    }, { once: true });
  }
})();

// Initialize all carousels
document.addEventListener('DOMContentLoaded', () => {
  // Additional safeguard: if no hash and we're scrolled down, go to top
  // This catches any scroll restoration that might happen after our initial prevention
  // Only do this if there's no hash (hash navigation should work normally)
  if (!window.location.hash) {
    // Use multiple requestAnimationFrame calls to catch late scroll restoration
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      });
    });
  }

  // Hide loader when page is loaded
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 300);
  });

  // Fallback: hide loader after a maximum time
  setTimeout(hideLoader, 2000);

  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    initCarousel(carousel);
  });

  // Initialize section indicator
  initSectionIndicator();

  // Modal close functionality
  const modalClose = document.querySelector('.project-modal-close');
  const modal = document.getElementById('projectModal');
  
  if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProjectModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeProjectModal();
      }
    });
  }

  // Content modal functionality
  const contentModal = document.getElementById('contentModal');
  const contentModalClose = document.querySelector('.content-modal-close');
  
  // Clickable cards
  const clickableCards = document.querySelectorAll('.clickable-card');
  clickableCards.forEach(card => {
    card.addEventListener('click', () => {
      const modalId = card.getAttribute('data-modal');
      if (modalId) {
        openContentModal(modalId);
      }
    });
  });

  if (contentModalClose) {
    contentModalClose.addEventListener('click', closeContentModal);
  }

  // Close content modal when clicking outside
  if (contentModal) {
    contentModal.addEventListener('click', (e) => {
      if (e.target === contentModal) {
        closeContentModal();
      }
    });

    // Close content modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contentModal.classList.contains('active')) {
        closeContentModal();
      }
    });
  }
});