document.addEventListener("DOMContentLoaded", function () {
  const headerHTML = `
  <header>
    <div class="container nav">
      <a class="logo" href="index.html">
        Urban Barrels <span>Premium Collection</span>
      </a>

      <nav class="nav-links">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="shop.html">Shop</a>
        <a href="contact.html">Contact</a>
      </nav>

      <div class="nav-right"> 
        <a href="cart.html" class="cart-link">
            Cart <span id="cart-count">0</span>
        </a>
        <span class="nav-divider">|</span>
        <a href="register.html">Register</a>
        <span>/</span>
        <a href="login.html">Login</a>
      </div>
    </div>
  </header>
  `;

  // Insert header at the beginning of the body
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // Function to update cart count in header
  function updateHeaderCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement && window.CartLogic) {
        cartCountElement.textContent = window.CartLogic.getCartCount();
    }
  }

  // Initial update
  updateHeaderCartCount();

  // Listen for cart updates
  window.addEventListener('cartUpdated', updateHeaderCartCount);

  // Highlight active link
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a, .nav-right a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
});
