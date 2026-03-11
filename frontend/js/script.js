const counter = document.querySelector('.counter-number');

async function updateCounter() {
    try {
        let response = await fetch('https://f6h5vxmxnalzynul32fctncntq0knwca.lambda-url.us-west-2.on.aws/');
        if (!response.ok) throw new Error('Network error');
        let data = await response.json();
        counter.textContent = data;
        counter.dataset.count = data;
    } catch (error) {
        console.error('Counter fetch failed:', error);
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.timeline-item').forEach((item) => {
        observer.observe(item);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCounter();
    initScrollAnimations();
});
