
window.addEventListener('DOMContentLoaded', function () {
  const PRODUCTS_KEY = 'dtc_products_v1';

  // Try #shopGrid first; fallback: find section whose h2 says “Latest Collection”
  const grid =
    document.getElementById('shopGrid') ||
    [...document.querySelectorAll('section')].find(s =>
      /latest collection/i.test(s.querySelector('h2')?.textContent || '')
    )?.querySelector('.grid');

  if (!grid) return;

  // Build a set of existing ids/names so we don't duplicate cards
  const existingIds = new Set(
    [...grid.querySelectorAll('.card')].map(c =>
      c.getAttribute('data-id') ||
      (c.querySelector('.title')?.textContent.trim().toLowerCase() || '')
    )
  );

  const admin = (JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]'))
    .filter(p => p && p.active);

  const toAdd = admin.filter(p =>
    !existingIds.has(p.id) &&
    !existingIds.has((p.name || '').toLowerCase())
  );

  // Prepend Admin items to Latest Collection
  const html = toAdd.map(p => `
    <article class="card" aria-label="${p.name}" data-id="${p.id}">
      <div class="thumb">
        <img src="${p.image || p.imageUrl || ''}" alt="${p.name}">
      </div>
      <div class="card-body">
        <div class="title">${p.name}</div>
        <div class="price">$${Number(p.price || 0).toFixed(2)}</div>
        <button class="btn">Add to cart</button>
      </div>
    </article>
  `).join('');

  grid.insertAdjacentHTML('afterbegin', html);
});
