// Products storage using localStorage
// This allows both admin and frontend to access the same product data

// Default products
const defaultProducts = [
  {
    id: 1,
    name: 'Whisky 1',
    description: 'Rich, bold and full-bodied with notes of dark berries & oak.',
    price: 2500,
    image: 'wine1.png'
  },
  {
    id: 2,
    name: 'Whisky 2',
    description: 'Smooth & velvety with soft tannins and plum aromas.',
    price: 2200,
    image: 'wine2.png'
  },
  {
    id: 3,
    name: 'Whisky 3',
    description: 'Light-bodied, elegant and fruity — a sophisticated favourite.',
    price: 3000,
    image: 'wine3.png'
  },
  {
    id: 4,
    name: 'Whisky 4',
    description: 'Crisp white wine with citrus, peach and vanilla notes.',
    price: 2700,
    image: 'wine4.png'
  }
];

function getProducts() {
  const stored = localStorage.getItem('whiskyProducts');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default products if none exist (without triggering event)
  localStorage.setItem('whiskyProducts', JSON.stringify(defaultProducts));
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem('whiskyProducts', JSON.stringify(products));
  // Dispatch custom event to notify other pages of the update
  window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
}

