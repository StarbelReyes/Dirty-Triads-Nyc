(() => {
    const CART_KEY = 'dt_cart_v1';
  
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
    function slugify(s){
      return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    }
  
    function loadCart(){
      try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
      catch(e){ return []; }
    }
    function saveCart(items){
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      updateCartCount(items);
    }
  
    function findItem(items, id){
      return items.find(i => i.id === id);
    }
  
    function addToCart({id, name, price, image}){
      const items = loadCart();
      const existing = findItem(items, id);
      if(existing){ existing.qty += 1; }
      else { items.push({ id, name, price, image, qty: 1 }); }
      saveCart(items);
      renderCart();
      openCart();
    }
  
    function removeFromCart(id){
      let items = loadCart();
      items = items.filter(i => i.id !== id);
      saveCart(items);
      renderCart();
    }
  
    function setQty(id, qty){
      let items = loadCart();
      const it = findItem(items, id);
      if(!it) return;
      it.qty = Math.max(1, qty|0);
      saveCart(items);
      renderCart();
    }
  
    function changeQty(id, delta){
      let items = loadCart();
      const it = findItem(items, id);
      if(!it) return;
      it.qty += delta;
      if(it.qty <= 0){
        items = items.filter(i => i.id !== id);
      }
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      updateCartCount(items);
      renderCart();
    }
  
    function subtotal(items){
      return items.reduce((acc, it) => acc + it.price * it.qty, 0);
    }
  
    function formatUSD(n){ return `$${n.toFixed(2)}`; }
  
    // ===== UI: Drawer =====
    const cartEl = document.createElement('div');
    cartEl.id = 'cart';
    cartEl.className = 'cart-overlay';
    cartEl.innerHTML = `
      <div class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
        <header class="cart-header">
          <h2 id="cartTitle">Your Cart</h2>
          <button class="cart-close" aria-label="Close cart">&times;</button>
        </header>
        <ul class="cart-items" id="cartItems"></ul>
        <footer class="cart-footer">
          <div class="cart-row">
            <span>Subtotal</span>
            <strong id="cartSubtotal">$0.00</strong>
          </div>
          <button id="checkoutBtn" class="btn btn-primary">Checkout</button>
        </footer>
      </div>
      <div class="cart-backdrop" tabindex="-1"></div>
    `;
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(cartEl);
      attachCartTriggers();
      renderCart();
      updateCartCount(loadCart());
    });
  
    function openCart(){
      cartEl.classList.add('open');
      document.body.style.overflow = 'hidden';
      $('.cart-close', cartEl)?.focus();
    }
    function closeCart(){
      cartEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  
    function attachCartTriggers(){
        // 1) Global click delegation for add-to-cart
        document.addEventListener('click', (e) => {
          const addBtn = e.target.closest('.card .btn');
          if(addBtn){
            const card = addBtn.closest('.card');
            if(!card) return;
            const name = $('.title', card)?.textContent.trim() || 'Item';
            const priceText = $('.price', card)?.textContent.trim() || '$0';
            const price = parseFloat(priceText.replace(/[^0-9.]/g,'')) || 0;
            const img = $('.thumb img', card)?.getAttribute('src') || '';
            const id = card.getAttribute('data-id') || slugify(name);
            addToCart({ id, name, price, image: img });
            return;
          }
      
          // 2) Cart open button
          if(e.target.closest('#cartButton')){ openCart(); return; }
      
          // 3) Cart controls (qty +/-, remove)
          const dec = e.target.closest('.qty-btn[data-delta="-1"]');
          const inc = e.target.closest('.qty-btn[data-delta="+1"]');
          const rem = e.target.closest('.cart-remove');
          if(dec){ changeQty(dec.getAttribute('data-id'), -1); return; }
          if(inc){ changeQty(inc.getAttribute('data-id'), +1); return; }
          if(rem){ removeFromCart(rem.getAttribute('data-id')); return; }
        });
      
        // Qty manual input (delegate change)
        document.addEventListener('change', (e) => {
          const inp = e.target.closest('.qty-input');
          if(inp){
            const id = inp.getAttribute('data-id');
            setQty(id, parseInt(inp.value || '1', 10));
          }
        });
      
        // Ensure we have a cart button (if you didn't add it in HTML)
        let navCartBtn = document.getElementById('cartButton');
        if(!navCartBtn){
          const navInner = document.querySelector('.navbar .nav-inner');
          if(navInner){
            navCartBtn = document.createElement('button');
            navCartBtn.id = 'cartButton';
            navCartBtn.className = 'cart-button';
            navCartBtn.setAttribute('aria-label', 'Open cart');
            navCartBtn.innerHTML = '🛒 <span id="cartCount" class="cart-count">0</span>';
            navInner.appendChild(navCartBtn);
          }
        }
      
        // Close controls
        $('.cart-close', cartEl)?.addEventListener('click', closeCart);
        $('.cart-backdrop', cartEl)?.addEventListener('click', closeCart);
        document.addEventListener('keydown', (e) => {
          if(e.key === 'Escape' && cartEl.classList.contains('open')) closeCart();
        });
      
        // Fake checkout
        $('#checkoutBtn', cartEl)?.addEventListener('click', () => {
          alert('Checkout not wired yet. You can export this cart to your backend later.');
        });
      }
  
    function renderCart(){
      const items = loadCart();
      const list = $('#cartItems', cartEl);
      list.innerHTML = '';
      if(items.length === 0){
        list.innerHTML = '<li class="cart-empty">Your cart is empty.</li>';
      } else {
        for(const it of items){
          const li = document.createElement('li');
          li.className = 'cart-item';
          li.innerHTML = `
            <img src="${it.image || ''}" alt="" class="cart-thumb" />
            <div class="cart-info">
              <div class="cart-name">${it.name}</div>
              <div class="cart-price">${formatUSD(it.price)}</div>
              <div class="cart-qty">
                <button class="qty-btn" data-id="${it.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
                <input class="qty-input" type="number" min="1" value="${it.qty}" data-id="${it.id}" aria-label="Quantity for ${it.name}" />
                <button class="qty-btn" data-id="${it.id}" data-delta="+1" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="cart-remove" data-id="${it.id}" aria-label="Remove ${it.name}">Remove</button>
          `;
          list.appendChild(li);
        }
      }
      $('#cartSubtotal', cartEl).textContent = formatUSD(subtotal(items));
  
      // Attach item controls
      $$('.qty-btn', cartEl).forEach(b => {
        const id = b.getAttribute('data-id');
        const delta = b.getAttribute('data-delta') === '+1' ? +1 : -1;
        b.addEventListener('click', () => changeQty(id, delta));
      });
      $$('.qty-input', cartEl).forEach(inp => {
        const id = inp.getAttribute('data-id');
        inp.addEventListener('change', () => setQty(id, parseInt(inp.value || '1', 10)));
      });
      $$('.cart-remove', cartEl).forEach(b => {
        const id = b.getAttribute('data-id');
        b.addEventListener('click', () => removeFromCart(id));
      });
    }
  
    function updateCartCount(items){
      const count = items.reduce((acc, it) => acc + it.qty, 0);
      const badge = document.getElementById('cartCount');
      if(badge) badge.textContent = String(count);
    }
  
    // ===== Minimal styles injection (only if your CSS doesn't include these) =====
    const style = document.createElement('style');
    style.innerHTML = `
      .cart-button{ margin-left:auto; padding:10px 12px; border-radius:12px; border:1px solid #24262b; background:#11131a; color:#e7eaf3; box-shadow: var(--shadow); }
      .cart-count{ background:#e7eaf3; color:#11131a; border-radius:999px; padding:2px 8px; font-size:.8rem; margin-left:6px; }
      .cart-overlay{ position: fixed; inset: 0; display:none; z-index: 100; }
      .cart-overlay.open{ display:block; }
      .cart-backdrop{ position:absolute; inset:0; background: rgba(0,0,0,.4); }
      .cart-panel{ position:absolute; right:0; top:0; bottom:0; width:min(420px, 100%); background: linear-gradient(180deg,#131419,#0f1013); border-left:1px solid #24262b; box-shadow: -8px 0 24px rgba(0,0,0,.3); display:flex; flex-direction:column; }
      .cart-header{ display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid #24262b; }
      .cart-items{ list-style:none; margin:0; padding:0; overflow:auto; flex:1; }
      .cart-item{ display:grid; grid-template-columns: 84px 1fr auto; gap:12px; align-items:center; padding:12px 16px; border-bottom:1px solid #1b1d22; }
      .cart-thumb{ width:84px; height:84px; object-fit:cover; border-radius:12px; background:#0c0d10; }
      .cart-info{ display:flex; flex-direction:column; gap:6px; }
      .cart-name{ font-weight:600; }
      .cart-price{ opacity:.9; }
      .cart-qty{ display:flex; align-items:center; gap:8px; }
      .qty-btn{ padding:4px 10px; border-radius:10px; border:1px solid #24262b; background:#151821; color:#e7eaf3; }
      .qty-input{ width:56px; padding:6px 8px; border-radius:10px; border:1px solid #24262b; background:#0e1016; color:#e7eaf3; text-align:center; }
      .cart-remove{ border:none; background:transparent; color:#adb3c2; text-decoration:underline; cursor:pointer; }
      .cart-footer{ padding:16px; border-top:1px solid #24262b; display:flex; flex-direction:column; gap:12px; }
      .cart-row{ display:flex; justify-content:space-between; }
      .btn.btn-primary{ padding:12px 14px; border-radius:12px; border:1px solid #24262b; background:#e7eaf3; color:#0d0f14; font-weight:600; }
    `;
    document.head.appendChild(style);
  })();