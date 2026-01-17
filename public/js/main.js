// Live updates: Poll for new posts every 5 seconds on homepage
if (window.location.pathname === '/') {
  function fetchPosts() {
    fetch('/api/posts')
      .then(response => response.json())
      .then(posts => {
        const list = document.querySelector('.posts-list');
        if (list) {
          list.innerHTML = posts.map(post => `
            <li role="listitem">
              <div class="card post-preview">
                <article>
                  <h3><a href="/posts/${post.id}" class="post-link">${post.title}</a></h3>
                  <p class="post-body"> ${post.content.substring(0, 100)}...</p> 
                  <span class="post-meta">Comments: ${post.Comments ? post.Comments.length : 0}</span>  
                </article>
              </div>
            </li>
          `).join('');
        }
      })
      .catch(error => console.error('Error fetching posts:', error));
  }

  fetchPosts(); // Initial load
  setInterval(fetchPosts, 10000); // Poll every 5 seconds
}

// Form enhancements: Validation and loading states
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const button = form.querySelector('button[type="submit"]');
      const requiredFields = form.querySelectorAll('[required]');
      
      // Simple client-side validation
      let isValid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--danger-color)';
          isValid = false;
        } else {
          field.style.borderColor = '#E9ECEF';
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
        return;
      }
      
      // Loading state
      if (button) {
        button.textContent = 'Submitting...';
        button.disabled = true;
      }
      
      // Smooth scroll to top on submit (optional)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Reset border on input
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '#E9ECEF';
      });
    });
  });
  
  // Smooth scrolling for links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});