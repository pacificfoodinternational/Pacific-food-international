const body = document.body;
const menu = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const navClose = document.querySelector('.nav-close');
const menuBackdrop = document.createElement('button');
menuBackdrop.type = 'button';
menuBackdrop.className = 'nav-backdrop';
menuBackdrop.setAttribute('aria-label', 'Close navigation menu');
menuBackdrop.hidden = true;
if (menu) body.appendChild(menuBackdrop);
const navLinks = document.querySelectorAll('.nav-links a');

function handleMenuState(open) {
  if (!menu || !navToggle) return;

  menu.classList.toggle('open', open);
  body.classList.toggle('menu-open', open);
  menuBackdrop.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));

  if (open && navClose) {
    navClose.focus();
  } else if (!open) {
    navToggle.focus();
  }
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = menu && menu.classList.contains('open');
    handleMenuState(!isOpen);
  });
}

if (navClose) {
  navClose.addEventListener('click', () => handleMenuState(false));
}

if (menu) {
  menuBackdrop.addEventListener('click', () => handleMenuState(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      handleMenuState(false);
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => handleMenuState(false));

  const targetPath = link.getAttribute('href');
  const currentPath = window.location.pathname.split('/').pop();

  if (targetPath === currentPath || (currentPath === '' && targetPath === 'index.html')) {
    link.classList.add('active');
  }
});

const yearNode = document.querySelector('[data-year]');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const PRODUCT_CATALOG = [
  { id: 'apples', name: 'Apples', price: null },
  { id: 'bananas', name: 'Bananas', price: null },
  { id: 'oranges', name: 'Oranges', price: null },
  { id: 'grapes', name: 'Grapes', price: null },
  { id: 'mangoes', name: 'Mangoes', price: null },
  { id: 'strawberries', name: 'Strawberries', price: null },
  { id: 'tomatoes', name: 'Tomatoes', price: null },
  { id: 'carrots', name: 'Carrots', price: null },
  { id: 'potatoes', name: 'Potatoes', price: null },
  { id: 'onions', name: 'Onions', price: null },
  { id: 'broccoli', name: 'Broccoli', price: null },
  { id: 'lettuce', name: 'Lettuce', price: null },
  { id: 'cucumbers', name: 'Cucumbers', price: null }
];

const STORAGE_KEY = 'pf-wholesale-prices';

function getStoredPrices() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return stored;
  } catch (error) {
    return {};
  }
}

function mergeProductPrices() {
  const saved = getStoredPrices();
  PRODUCT_CATALOG.forEach((product) => {
    const savedPrice = saved[product.id];
    if (savedPrice !== undefined && savedPrice !== null && savedPrice !== '') {
      product.price = Number(savedPrice);
    } else {
      product.price = null;
    }
  });
}

function saveProductPrices() {
  const payload = {};
  PRODUCT_CATALOG.forEach((product) => {
    payload[product.id] = product.price;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function formatCurrency(value) {
  const amount = typeof value === 'number' ? value : 0;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function renderAdminPrices() {
  const grid = document.getElementById('adminPriceGrid');
  if (!grid) return;

  grid.innerHTML = '';

  PRODUCT_CATALOG.forEach((product) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin-item';

    const label = document.createElement('label');
    label.textContent = `${product.name} price per kg`;
    label.setAttribute('for', `admin-${product.id}`);

    const input = document.createElement('input');
    input.id = `admin-${product.id}`;
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.value = product.price !== null ? product.price : '';
    input.placeholder = 'Approved rate';
    input.addEventListener('change', (event) => {
      const nextValue = event.target.value.trim();
      product.price = nextValue === '' ? null : Number(nextValue);
      saveProductPrices();
      renderProductSelector();
      renderOrderSummary();
    });

    wrapper.append(label, input);
    grid.appendChild(wrapper);
  });
}

function getProductPrice(productId) {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  return product ? product.price : null;
}

function renderProductSelector() {
  const select = document.getElementById('productSelect');
  if (!select) return;

  select.innerHTML = '';

  PRODUCT_CATALOG.forEach((product) => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} — ${product.price !== null ? formatCurrency(product.price) + ' per kg' : 'Approved price pending'}`;
    select.appendChild(option);
  });
}

function getOrder() {
  try {
    const stored = JSON.parse(localStorage.getItem('pf-wholesale-order') || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
}

function saveOrder(order) {
  localStorage.setItem('pf-wholesale-order', JSON.stringify(order));
}

function updateProductQuantity(productId, nextQty) {
  const order = getOrder();
  const existingIndex = order.findIndex((item) => item.id === productId);

  if (existingIndex === -1) {
    order.push({ id: productId, quantity: Math.max(0, Number(nextQty) || 0) });
  } else {
    order[existingIndex].quantity = Math.max(0, Number(nextQty) || 0);
  }

  const cleaned = order.filter((item) => item.quantity > 0);
  saveOrder(cleaned);
  renderOrderSummary();
}

function addProductToOrder() {
  const productSelect = document.getElementById('productSelect');
  const quantityInput = document.getElementById('productQty');

  if (!productSelect || !quantityInput) return;

  const productId = productSelect.value;
  const quantity = Number(quantityInput.value);

  if (!productId || !(quantity > 0)) {
    return;
  }

  updateProductQuantity(productId, quantity);
  quantityInput.value = '10';
}

function removeProductFromOrder(productId) {
  const order = getOrder().filter((item) => item.id !== productId);
  saveOrder(order);
  renderOrderSummary();
}

function getProductSubtotal(productId, quantity) {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product || product.price === null || !Number.isFinite(product.price)) {
    return 0;
  }

  return product.price * quantity;
}

function renderOrderSummary() {
  const orderRows = document.getElementById('orderRows');
  const totalQuantityNode = document.getElementById('totalQuantity');
  const grandTotalNode = document.getElementById('grandTotal');
  const productList = document.getElementById('productList');

  if (!orderRows || !totalQuantityNode || !grandTotalNode) return;

  const order = getOrder();
  orderRows.innerHTML = '';
  if (productList) {
    productList.innerHTML = '';
  }

  if (order.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'summary-row item';
    emptyRow.innerHTML = '<span>No products selected</span><span></span><span></span><span>£0.00</span>';
    orderRows.appendChild(emptyRow);
    totalQuantityNode.textContent = '0 kg';
    grandTotalNode.textContent = '£0.00';
    return;
  }

  let totalQuantity = 0;
  let grandTotal = 0;

  order.forEach((item) => {
    const product = PRODUCT_CATALOG.find((entry) => entry.id === item.id);
    if (!product) return;

    const row = document.createElement('div');
    row.className = 'summary-row item';

    const subtotal = getProductSubtotal(product.id, item.quantity);
    const rateText = product.price !== null ? formatCurrency(product.price) : 'TBA';
    const subtotalText = product.price !== null ? formatCurrency(subtotal) : 'Pending';

    totalQuantity += item.quantity;
    grandTotal += subtotal;

    row.innerHTML = `
      <span>${product.name}</span>
      <span>${Number(item.quantity).toFixed(1)} kg</span>
      <span>${rateText}</span>
      <span>${subtotalText}</span>
    `;

    const rowControls = document.createElement('div');
    rowControls.className = 'inline-actions';

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '0.5';
    qtyInput.value = String(item.quantity);
    qtyInput.className = 'qty-input';
    qtyInput.addEventListener('input', (event) => {
      updateProductQuantity(product.id, event.target.value);
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-btn';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeProductFromOrder(product.id));

    rowControls.append(qtyInput, removeButton);

    const productRow = document.createElement('div');
    productRow.className = 'product-list-row';
    productRow.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <div class="small-tag">${product.price !== null ? formatCurrency(product.price) + ' / kg' : 'Approved price pending'}</div>
      </div>
      <div class="price-pill">${product.price !== null ? formatCurrency(subtotal) : 'Pending approval'}</div>
    `;
    productRow.appendChild(rowControls);

    const productList = document.getElementById('productList');
    if (productList) {
      const productListItem = document.createElement('div');
      productListItem.className = 'product-list-row';
      productListItem.innerHTML = `
        <div>
          <strong>${product.name}</strong>
          <div class="small-tag">${Number(item.quantity).toFixed(1)} kg · ${rateText === 'TBA' ? 'Price pending approval' : rateText + ' / kg'}</div>
        </div>
        <div class="price-pill">${subtotalText}</div>
        <div class="inline-actions">
          <input class="qty-input" type="number" min="0" step="0.5" value="${Number(item.quantity).toFixed(1)}" data-product-id="${product.id}" />
          <button type="button" class="remove-btn" data-remove="${product.id}">Remove</button>
        </div>
      `;

      productList.appendChild(productListItem);
      productListItem.querySelector('[data-remove]').addEventListener('click', () => removeProductFromOrder(product.id));
      const qtyField = productListItem.querySelector('.qty-input');
      qtyField.addEventListener('input', (event) => {
        updateProductQuantity(product.id, event.target.value);
      });
    }

    orderRows.appendChild(row);
  });

  totalQuantityNode.textContent = `${totalQuantity.toFixed(1)} kg`;
  grandTotalNode.textContent = formatCurrency(grandTotal);
}

function clearOrder() {
  localStorage.removeItem('pf-wholesale-order');
  renderOrderSummary();
}

function validateWholesaleForm() {
  const form = document.getElementById('wholesaleInquiryForm');
  if (!form) return true;

  const fields = [
    { name: 'customerName', label: 'Full name' },
    { name: 'companyName', label: 'Company name' },
    { name: 'customerPhone', label: 'Phone number' },
    { name: 'customerEmail', label: 'Email' },
    { name: 'deliveryAddress', label: 'Delivery address' }
  ];

  let valid = true;

  fields.forEach(({ name, label }) => {
    const field = form.querySelector(`[name="${name}"]`);
    const errorNode = form.querySelector(`[data-error="${name}"]`);
    const value = (field ? field.value : '').trim();

    if (!value) {
      valid = false;
      if (errorNode) errorNode.textContent = `${label} is required.`;
      if (field) field.setAttribute('aria-invalid', 'true');
      return;
    }

    if (name === 'customerEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
      if (errorNode) errorNode.textContent = 'Please enter a valid email address.';
      if (field) field.setAttribute('aria-invalid', 'true');
      return;
    }

    if (errorNode) errorNode.textContent = '';
    if (field) field.setAttribute('aria-invalid', 'false');
  });

  return valid;
}

function submitWholesaleInquiry(event) {
  event.preventDefault();

  const form = document.getElementById('wholesaleInquiryForm');
  const messageNode = document.getElementById('submissionMessage');
  if (!form || !messageNode) return;

  if (!validateWholesaleForm()) {
    messageNode.classList.remove('show');
    return;
  }

  if (getOrder().length === 0) {
    messageNode.textContent = 'Please add at least one product before submitting a wholesale inquiry.';
    messageNode.classList.add('show');
    return;
  }

  const payload = {
    customer: {
      name: form.customerName.value.trim(),
      company: form.companyName.value.trim(),
      phone: form.customerPhone.value.trim(),
      email: form.customerEmail.value.trim(),
      deliveryAddress: form.deliveryAddress.value.trim()
    },
    order: getOrder().map((item) => {
      const product = PRODUCT_CATALOG.find((entry) => entry.id === item.id);
      return {
        product: product ? product.name : item.id,
        quantityKg: Number(item.quantity),
        pricePerKg: product && product.price !== null ? product.price : null,
        subtotal: product && product.price !== null ? getProductSubtotal(item.id, item.quantity) : 0
      };
    })
  };

  const orderEndpoint = '';
  if (orderEndpoint) {
    fetch(orderEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      console.warn('Wholesale order endpoint is not configured. Request saved locally for later integration.');
    });
  } else {
    console.log('Wholesale inquiry payload:', payload);
  }

  messageNode.textContent = 'Your wholesale inquiry has been prepared successfully. Final pricing and availability will be confirmed by the company after review.';
  messageNode.classList.add('show');
  form.reset();
  clearOrder();
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const formMessage = document.querySelector('.success-message');

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const subject = (formData.get('subject') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;

    const fields = [
      { name: 'name', value: name },
      { name: 'email', value: email },
      { name: 'subject', value: subject },
      { name: 'message', value: message }
    ];

    fields.forEach(({ name, value }) => {
      const field = contactForm.querySelector(`[name="${name}"]`);
      const errorNode = contactForm.querySelector(`[data-error="${name}"]`);

      if (!value) {
        hasError = true;
        if (errorNode) errorNode.textContent = 'This field is required.';
        if (field) field.setAttribute('aria-invalid', 'true');
        return;
      }

      if (name === 'email' && !emailPattern.test(email)) {
        hasError = true;
        if (errorNode) errorNode.textContent = 'Please enter a valid email address.';
        if (field) field.setAttribute('aria-invalid', 'true');
        return;
      }

      if (errorNode) errorNode.textContent = '';
      if (field) field.setAttribute('aria-invalid', 'false');
    });

    if (hasError) {
      if (formMessage) {
        formMessage.classList.remove('show');
      }
      return;
    }

    contactForm.reset();
    if (formMessage) {
      formMessage.classList.add('show');
    }
  });
}

if (document.getElementById('productSelect')) {
  mergeProductPrices();
  renderProductSelector();
  renderAdminPrices();
  renderOrderSummary();

  const addButton = document.getElementById('addProductBtn');
  if (addButton) {
    addButton.addEventListener('click', addProductToOrder);
  }

  const clearOrderBtn = document.getElementById('clearOrderBtn');
  if (clearOrderBtn) {
    clearOrderBtn.addEventListener('click', clearOrder);
  }

  const inquiryForm = document.getElementById('wholesaleInquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', submitWholesaleInquiry);
  }
}
