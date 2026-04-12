/* ============================================================
   Faster Than Light — Main JavaScript
   ============================================================ */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var targetId = this.getAttribute('href').slice(1);
    var target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Contact form — basic submit handler
// Replace the action URL with your Cloudflare Worker or preferred form endpoint
var contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '送出中…';

    var data = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      usecase: contactForm.usecase.value,
    };

    // TODO: Replace with your actual form submission endpoint
    // Example: fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
    // For now, simulate success after a short delay
    setTimeout(function () {
      btn.textContent = '✅ 已收到，我們將盡快與您聯繫！';
      btn.style.background = '#2a7a4f';
      contactForm.reset();
    }, 1000);
  });
}

// Intersection Observer — fade-in animation on scroll
if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.benefit-card, .stat-card, .use-case-item, .collab-card').forEach(function (el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}
