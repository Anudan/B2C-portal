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
        <a href="register.html">Register</a>
        <span>/</span>
        <a href="login.html">Login</a>
      </div>
    </div>
  </header>
  `;

  // Insert header at the beginning of the body
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // Highlight active link
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a, .nav-right a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
});
