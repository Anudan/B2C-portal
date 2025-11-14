/* ---------------- PRODUCTS DATA ---------------- */
const PRODUCTS = [
    { id: 1, title: "Retro Sneakers", price: 49.99, category: "Footwear", img: "https://picsum.photos/200?random=1", desc: "Cool retro design." },
    { id: 2, title: "Classic Watch", price: 129.0, category: "Accessories", img: "https://picsum.photos/200?random=2", desc: "Luxury feel." },
    { id: 3, title: "Denim Jacket", price: 89.5, category: "Apparel", img: "https://picsum.photos/200?random=3", desc: "Stylish denim." }
  ];
  
  /* ---------------- STATE ---------------- */
  let cart = {};
  let selectedProduct = null;
  
  /* ---------------- DOM ---------------- */
  const productsEl = document.getElementById("products");
  const categorySelect = document.getElementById("category");
  const searchInput = document.getElementById("search");
  const cartCount = document.getElementById("cart-count");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  
  /* Modal */
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalPrice = document.getElementById("modal-price");
  const modalAdd = document.getElementById("modal-add");
  const modalClose = document.getElementById("modal-close");
  
  /* ---------------- FUNCTIONS ---------------- */
  
  function renderProducts(list) {
    productsEl.innerHTML = "";
    list.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");
  
      card.innerHTML = `
        <img src="${p.img}">
        <div class="card-body">
          <h3>${p.title}</h3>
          <div class="price">$${p.price}</div>
          <button onclick="openModal(${p.id})">View</button>
        </div>
      `;
      productsEl.appendChild(card);
    });
  }
  
  function openModal(id) {
    const p = PRODUCTS.find(item => item.id === id);
    selectedProduct = p;
  
    modalImg.src = p.img;
    modalTitle.innerText = p.title;
    modalDesc.innerText = p.desc;
    modalPrice.innerText = "$" + p.price;
  
    modal.classList.remove("hidden");
  }
  
  modalClose.onclick = () => modal.classList.add("hidden");
  
  /* Add to Cart */
  modalAdd.onclick = () => {
    const id = selectedProduct.id;
    if (!cart[id]) {
      cart[id] = { ...selectedProduct, qty: 1 };
    } else {
      cart[id].qty++;
    }
    modal.classList.add("hidden");
    updateCart();
  };
  
  function updateCart() {
    cartItemsEl.innerHTML = "";
    let total = 0;
    let count = 0;
  
    Object.values(cart).forEach(item => {
      total += item.qty * item.price;
      count += item.qty;
  
      const div = document.createElement("div");
      div.innerHTML = `
        ${item.title} x ${item.qty}
        <br> $${(item.qty * item.price).toFixed(2)}
        <hr>
      `;
      cartItemsEl.appendChild(div);
    });
  
    cartCount.innerText = count;
    cartTotalEl.innerText = "Total: $" + total.toFixed(2);
  }
  
  /* Search */
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    const filtered = PRODUCTS.filter(p => p.title.toLowerCase().includes(q));
    renderProducts(filtered);
  };
  
  /* Init */
  renderProducts(PRODUCTS);
  