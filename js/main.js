// Basic interactions like fade-in on scroll or menu toggle can go here

document.addEventListener('DOMContentLoaded', () => {
    // Select all research cards and apply a stagger effect if they exist
    const cards = document.querySelectorAll('.research-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
