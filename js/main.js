document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
    revealElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hide preloader when window is fully loaded
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');

            // Immediately reveal elements already in viewport
            const revealElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('visible');
                }
            });

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 300); // Shorter timeout
        }
    });

    // Hero Section Mouse Parallax
    const hero = document.querySelector('.hero');
    if (hero) {
        const layers = hero.querySelectorAll('.hero-blob, .floating-icon');
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / 50;
            const y = (e.clientY - window.innerHeight / 2) / 50;

            layers.forEach(layer => {
                const speed = layer.getAttribute('data-speed') || 1;
                const xOffset = x * speed;
                const yOffset = y * speed;
                layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });

        hero.addEventListener('mouseleave', () => {
            layers.forEach(layer => {
                layer.style.transform = `translate(0, 0)`;
            });
        });
    }

    // Research Tab Filtering
    const tabBtns = document.querySelectorAll('.tab-btn');
    const researchCards = document.querySelectorAll('.research-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const target = btn.getAttribute('data-target');

            researchCards.forEach(card => {
                if (target === 'all' || card.getAttribute('data-category') === target) {
                    card.classList.remove('hidden');
                    // Add a tiny delay for staggered animation if desired
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.classList.add('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                }
            });
        });
    });

    // Scroll Top Button Logic
    const topBtn = document.getElementById('scrollTop');
    if (topBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                topBtn.classList.add('show');
            } else {
                topBtn.classList.remove('show');
            }
        });

        topBtn.onclick = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    }
});
