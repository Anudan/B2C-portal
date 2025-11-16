// ============================================
// ADMIN PANEL - PRODUCT MANAGEMENT
// ============================================

// Step 1: Get all products from storage
let products = getProducts();

// Step 2: Get HTML elements we need to work with
const productTable = document.getElementById('productTableBody');
const productForm = document.getElementById('productForm');

// Step 3: Get all form input fields
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('name');
const productDescInput = document.getElementById('description');
const productPriceInput = document.getElementById('price');
const productImageInput = document.getElementById('image');

// ============================================
// FUNCTION: Display all products in the table
// ============================================
function renderTable() {
  // Clear the table first
  productTable.innerHTML = "";
  
  // Loop through each product and create a table row
  products.forEach(product => {
    // Create a new table row
    const row = document.createElement('tr');
    
    // Fill the row with product data
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>${product.image}</td>
      <td>
        <button type="button" class="btn-danger">Delete</button>
      </td>
    `;
    
    // When you click on a row, load that product into the form
    row.addEventListener('click', (event) => {
      // Don't load if clicking the delete button
      if (event.target.matches('.btn-danger')) return;
      loadProductIntoForm(product);
    });
    
    // When you click delete button, remove that product
    const deleteButton = row.querySelector('.btn-danger');
    deleteButton.addEventListener('click', () => {
      removeProduct(product.id);
    });
    
    // Add the row to the table
    productTable.appendChild(row);
  });
}

// ============================================
// FUNCTION: Load a product into the form for editing
// ============================================
function loadProductIntoForm(product) {
  productIdInput.value = product.id;
  productNameInput.value = product.name;
  productDescInput.value = product.description;
  productPriceInput.value = product.price;
  productImageInput.value = product.image;
}

// ============================================
// FUNCTION: Delete a product
// ============================================
function removeProduct(productId) {
  // Remove the product from the array
  products = products.filter(product => product.id !== productId);
  
  // Save the updated list
  saveProducts(products);
  
  // Refresh the table
  renderTable();
  
  // If we deleted the product that was being edited, clear the form
  if (productIdInput.value && Number(productIdInput.value) === productId) {
    productForm.reset();
    productIdInput.value = "";
  }
}

// ============================================
// FUNCTION: Handle form submission (Add or Update)
// ============================================
productForm.addEventListener('submit', (event) => {
  // Prevent page from refreshing
  event.preventDefault();
  
  // Get values from the form
  const productId = productIdInput.value ? Number(productIdInput.value) : Date.now();
  const productName = productNameInput.value.trim();
  const productDescription = productDescInput.value.trim();
  const productPrice = Number(productPriceInput.value);
  const productImage = productImageInput.value.trim() || "wine-placeholder.png";
  
  // Create the product object
  const newProduct = {
    id: productId,
    name: productName,
    description: productDescription,
    price: productPrice,
    image: productImage
  };
  
  // Check if this product already exists (for editing)
  const existingProductIndex = products.findIndex(p => p.id === productId);
  
  if (existingProductIndex >= 0) {
    // Update existing product
    products[existingProductIndex] = newProduct;
  } else {
    // Add new product
    products.push(newProduct);
  }
  
  // Save to storage
  saveProducts(products);
  
  // Refresh the table
  renderTable();
  
  // Clear the form
  productForm.reset();
  productIdInput.value = "";
});

// ============================================
// INITIAL SETUP: Show products when page loads
// ============================================
renderTable();
