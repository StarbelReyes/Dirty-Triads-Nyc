(function(){
    const KEY='dtc_cart_v1';
    const $=(s,r=document)=>r.querySelector(s);
    const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
    const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
    const save=it=>{localStorage.setItem(KEY,JSON.stringify(it));updateBadge(it)};
    const fmt=n=>`$${n.toFixed(2)}`;
    const sub=it=>it.reduce((a,x)=>a+x.price*x.qty,0);
    const byId=(it,id)=>it.find(x=>x.id===id);
  
    const cartEl=document.getElementById('dtc-cart');
    const itemsEl=document.getElementById('dtcItems');
    const subEl=document.getElementById('dtcSubtotal');
  
    function open(){ cartEl.classList.add('dtc-open'); document.body.style.overflow='hidden'; }
    function close(){ cartEl.classList.remove('dtc-open'); document.body.style.overflow=''; }
  
    function render(){
      const items=load();
      itemsEl.innerHTML='';
      if(items.length===0){ itemsEl.innerHTML='<li class="dtc-item">Your cart is empty.</li>'; }
      else{
        for(const it of items){
          const li=document.createElement('li');
          li.className='dtc-item';
          li.innerHTML=`
            <img class="dtc-thumb" src="${it.image||''}" alt="">
            <div>
              <div style="font-weight:600">${it.name}</div>
              <div>${fmt(it.price)}</div>
              <div class="dtc-qty">
                <button class="dtc-qtybtn" data-id="${it.id}" data-d="-1">−</button>
                <input class="dtc-inp" type="number" min="1" value="${it.qty}" data-id="${it.id}">
                <button class="dtc-qtybtn" data-id="${it.id}" data-d="+1">+</button>
              </div>
            </div>
            <button class="dtc-remove" data-id="${it.id}">Remove</button>
          `;
          itemsEl.appendChild(li);
        }
      }
      subEl.textContent=fmt(sub(items));
    }
  
    function add({id,name,price,image}){
      const items=load();
      const ex=byId(items,id);
      if(ex) ex.qty+=1; else items.push({id,name,price,image,qty:1});
      save(items); render(); open();
    }
    function change(id,d){
      let items=load();
      const it=byId(items,id); if(!it) return;
      it.qty+=d;
      if(it.qty<=0) items=items.filter(x=>x.id!==id);
      save(items); render();
    }
    function setQty(id,q){
      const items=load();
      const it=byId(items,id); if(!it) return;
      it.qty=Math.max(1, q|0);
      save(items); render();
    }
    function removeItem(id){
      const items=load().filter(x=>x.id!==id);
      save(items); render();
    }
    function updateBadge(items){
      const c=items.reduce((a,x)=>a+x.qty,0);
      const b=document.getElementById('cartCount');
      if(b) b.textContent=String(c);
    }
  
    // Ensure there is a navbar button
    (function ensureButton(){
      let btn=document.getElementById('cartButton');
      if(!btn){
        const inner=document.querySelector('.navbar .nav-inner');
        if(inner){
          btn=document.createElement('button');
          btn.id='cartButton';
          btn.className='dtc-cart-button';
          btn.setAttribute('aria-label','Open cart');
          btn.innerHTML='🛒 <span id="cartCount" class="dtc-cart-count">0</span>';
          inner.insertBefore(btn, inner.querySelector('#hamburger')||null);
        }
      }else{
        btn.classList.add('dtc-cart-button');
        const span = btn.querySelector('#cartCount') || (()=>{const s=document.createElement('span');s.id='cartCount';btn.appendChild(s);return s})();
        span.classList.add('dtc-cart-count');
      }
      updateBadge(load());
    })();
  
    // Global delegation: add-to-cart, qty, remove, open/close
    document.addEventListener('click', (e)=>{
      // Add to cart from product card
      const addBtn = e.target.closest('.card .btn');
      if(addBtn){
        const card=addBtn.closest('.card'); if(!card) return;
        const name=('.title',card) && card.querySelector('.title') ? card.querySelector('.title').textContent.trim() : 'Item';
        const priceText=card.querySelector('.price')?.textContent.trim() || '$0';
        const price=parseFloat(priceText.replace(/[^0-9.]/g,''))||0;
        const img=card.querySelector('.thumb img')?.getAttribute('src')||'';
        const id=card.getAttribute('data-id')||slug(name);
        add({id,name,price,image:img});
        return;
      }
      if(e.target.closest('#cartButton')){ open(); return; }
      if(e.target.closest('#dtc-cart .dtc-close') || e.target.closest('#dtc-cart .dtc-backdrop')){ close(); return; }
      const qtyBtn=e.target.closest('#dtc-cart .dtc-qtybtn');
      if(qtyBtn){ change(qtyBtn.getAttribute('data-id'), qtyBtn.getAttribute('data-d')==='+1'?+1:-1); return; }
      const rem=e.target.closest('#dtc-cart .dtc-remove');
      if(rem){ removeItem(rem.getAttribute('data-id')); return; }
    });
    document.addEventListener('change',(e)=>{
      const inp=e.target.closest('#dtc-cart .dtc-inp');
      if(inp){ setQty(inp.getAttribute('data-id'), parseInt(inp.value||'1',10)); }
    });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && cartEl.classList.contains('dtc-open')) close(); });
  
    // Initial render
    render();
  })();