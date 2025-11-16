// Frontend product rendering functionality

// Function to format price with commas
function formatPrice(price) {
  return '₨ ' + price.toLocaleString('en-IN');
}

let isInitialLoad = true;
let lastProductsHash = '';

// Function to render products
function renderProducts() {
  const products = getProducts();
  const grid = document.getElementById('productsGrid');
  
  if (!grid) return;
  
  // Create a simple hash to check if products actually changed
  const productsHash = JSON.stringify(products);
  if (productsHash === lastProductsHash && !isInitialLoad) {
    return; // Products haven't changed, skip re-render
  }
  lastProductsHash = productsHash;
  
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #776a5e;">No products available. Add products from the admin panel.</p>';
    isInitialLoad = false;
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'variety-card';
    
    // Handle image path - if it's a full URL, use it; otherwise assume it's in root
    const imageSrc = product.image.startsWith('http') ? product.image : product.image;
    
    card.innerHTML = `
      <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null; this.src='wine-placeholder.png';">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <span class="price">${formatPrice(product.price)}</span>
    `;
    
    grid.appendChild(card);
  });
  
  isInitialLoad = false;
}

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  
  // Only set up event listeners after initial load
  setTimeout(() => {
    // Listen for product updates from admin panel (cross-tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'whiskyProducts') {
        renderProducts();
      }
    });

    // Listen for custom event (same-window updates)
    window.addEventListener('productsUpdated', () => {
      renderProducts();
    });
  }, 100);
});

