// ========================================
// MODERN TECH-FOCUSED RESUME WEBSITE
// Interactive Features & Functionality
// ========================================

// ========================================
// 1. VISITOR COUNTER (Existing - Preserved)
// ========================================
const counter = document.querySelector(".counter-number");

async function updateCounter() {
    try {
        let response = await fetch("https://f6h5vxmxnalzynul32fctncntq0knwca.lambda-url.us-west-2.on.aws/");
        let data = await response.json();
        counter.innerHTML = `Views: ${data}`;
    } catch (error) {
        console.error("Error fetching visitor count:", error);
        counter.innerHTML = "Views: --";
    }
}

// ========================================
// 2. SMOOTH SCROLL NAVIGATION
// ========================================
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const heroButtons = document.querySelectorAll('.hero-buttons a[href^="#"]');
    const allScrollLinks = [...navLinks, ...heroButtons];

    allScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('#navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                if (this.classList.contains('nav-links')) {
                    this.classList.add('active');
                }

                // Close mobile menu if open
                const mobileNav = document.querySelector('.nav-links');
                const hamburger = document.querySelector('.hamburger');
                if (mobileNav && mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
}

// ========================================
// 3. NAVBAR SCROLL EFFECT
// ========================================
function initNavbarScroll() {
    const navbar = document.querySelector('#navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// 4. MOBILE MENU TOGGLE
// ========================================
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// ========================================
// 5. INTERSECTION OBSERVER (Scroll Animations)
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// 6. TYPING EFFECT (Hero Section)
// ========================================
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    if (!typingElement) return;

    const phrases = [
        "Cloud Engineer",
        "DevOps Enthusiast",
        "AWS Specialist",
        "Full-Stack Developer"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        // When phrase is complete
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause before deleting
        }

        // When phrase is fully deleted
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing effect
    setTimeout(type, 1000); // Delay initial start
}

// ========================================
// 7. ACTIVE SECTION HIGHLIGHTING
// ========================================
function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    window.addEventListener('scroll', debounce(() => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// ========================================
// 8. PDF DOWNLOAD FUNCTIONALITY
// ========================================
function initPdfDownload() {
    const pdfButton = document.querySelector('.download-resume-btn');

    if (pdfButton) {
        pdfButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Option 1: Direct link to hosted PDF
            // window.open('/assets/Michael_Weiser_Resume.pdf', '_blank');

            // Option 2: For now, show alert (replace with actual PDF later)
            alert('Resume download will be available soon! Please contact me directly for a copy.');
        });
    }
}

// ========================================
// 9. BACK TO TOP BUTTON
// ========================================
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100));

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ========================================
// 10. UTILITY FUNCTIONS
// ========================================

// Debounce function for scroll events (performance optimization)
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// 11. INITIALIZE ALL FUNCTIONS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Resume website loaded - Modern redesign v2.0");

    // Initialize all features
    updateCounter();              // Existing visitor counter
    initSmoothScroll();           // Smooth navigation
    initNavbarScroll();           // Navbar scroll effects
    initMobileMenu();             // Mobile hamburger menu
    initScrollAnimations();       // Scroll-triggered animations
    initTypingEffect();           // Hero typing animation
    initActiveSection();          // Active nav link highlighting
    initPdfDownload();            // PDF resume download
    initBackToTop();              // Back to top button
});

// ========================================
// 12. PERFORMANCE MONITORING (Optional)
// ========================================

// Log page load time
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});
