(() => {
  const products = [
    {id:'rainbow-bites',name:'Rainbow Bites',category:'sour',meta:'sour candy · 3 oz',price:1.5,emoji:'🍭',bg:'#ffe3f1',tag:'fan favorite'},
    {id:'sour-belts',name:'Sour Power Belts',category:'sour',meta:'sour candy · 2 oz',price:1.25,emoji:'🪄',bg:'#e6dbfa'},
    {id:'gummy-bears',name:'Gummy Bears',category:'gummy',meta:'gummy candy · 3 oz',price:1.5,emoji:'🧸',bg:'#fff0c9',tag:'classic'},
    {id:'peach-rings',name:'Peach Rings',category:'gummy',meta:'gummy candy · 3 oz',price:1.5,emoji:'🍑',bg:'#ffe1c9'},
    {id:'fruit-drops',name:'Fruit Drops',category:'hard',meta:'hard candy · 2 oz',price:1,emoji:'💎',bg:'#d9f3f0'},
    {id:'peppermints',name:'Cool Peppermints',category:'hard',meta:'hard candy · 2 oz',price:.75,emoji:'🌙',bg:'#dff0fa'},
    {id:'movie-butter',name:'Movie Butter Popcorn',category:'popcorn',meta:'popcorn · share size',price:2,emoji:'🍿',bg:'#fff0b2',tag:'share size'},
    {id:'kettle-corn',name:'Sweet Kettle Corn',category:'popcorn',meta:'popcorn · share size',price:2,emoji:'✨',bg:'#fff5d9'},
    {id:'sea-salt',name:'Sea Salt Chips',category:'chips',meta:'chips · 2 oz',price:1.25,emoji:'🥨',bg:'#e3eff6'},
    {id:'bbq-crunch',name:'BBQ Crunch Chips',category:'chips',meta:'chips · 2 oz',price:1.25,emoji:'🌶️',bg:'#f8ddd4'},
    {id:'choc-chip',name:'Chocolate Chip Cookies',category:'cookies',meta:'cookies · 2 pack',price:1.5,emoji:'🍪',bg:'#f3e2cb',tag:'baked today'},
    {id:'sprinkle',name:'Sprinkle Cookies',category:'cookies',meta:'cookies · 2 pack',price:1.5,emoji:'🧁',bg:'#f7dce5'}
  ];
  let cart = JSON.parse(localStorage.getItem('snack-shack-cart') || '{}');
  const $ = id => document.getElementById(id);
  const money = n => `$${n.toFixed(2)}`;
  const grid = $('product-grid');
  function renderProducts(filter='all') {
    grid.innerHTML = products.filter(p => filter === 'all' || p.category === filter).map(p => `<article class="product-card"><div class="product-art" style="--art-bg:${p.bg};--art-bg2:#ffffff66"><span class="product-emoji">${p.emoji}</span></div>${p.tag ? `<span class="tag">${p.tag}</span>` : ''}<div class="product-info"><h3>${p.name}</h3><div class="product-meta">${p.meta}</div><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`).join('');
  }
  function save(){localStorage.setItem('snack-shack-cart', JSON.stringify(cart));}
  function renderCart(){
    const ids = Object.keys(cart).filter(id => cart[id] > 0); let total=0, count=0;
    $('cart-items').innerHTML = ids.length ? ids.map(id => {const p=products.find(x=>x.id===id), qty=cart[id]; total += p.price*qty; count += qty; return `<div class="cart-line"><div class="cart-thumb">${p.emoji}</div><div><h3>${p.name}</h3><small>${money(p.price)} each</small><div class="qty"><button data-minus="${id}" aria-label="Remove one ${p.name}">−</button><span>${qty}</span><button data-plus="${id}" aria-label="Add one ${p.name}">+</button></div></div><span class="line-price">${money(p.price*qty)}</span></div>`}).join('') : '<div class="empty-cart">Your cart is waiting for a little joy.<br>Browse the menu to add a snack!</div>';
    $('cart-count').textContent=count; $('cart-total').textContent=money(total); $('checkout').disabled=!ids.length; $('checkout').style.opacity=ids.length?1:.5;
  }
  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)}
  function setDrawer(open){$('cart-drawer').classList.toggle('open',open);$('drawer-overlay').classList.toggle('open',open);$('cart-drawer').setAttribute('aria-hidden',String(!open));if(open) renderCart()}
  document.addEventListener('click', e => {
    const add=e.target.closest('[data-add]'); if(add){cart[add.dataset.add]=(cart[add.dataset.add]||0)+1;save();renderCart();toast('Added to your snack cart ✦');return}
    const plus=e.target.closest('[data-plus]'), minus=e.target.closest('[data-minus]'); if(plus||minus){const id=(plus||minus).dataset.plus||(plus||minus).dataset.minus;cart[id]=Math.max(0,(cart[id]||0)+(plus?1:-1));if(!cart[id])delete cart[id];save();renderCart();return}
    const tab=e.target.closest('[data-filter]');if(tab){document.querySelectorAll('.category').forEach(x=>x.classList.remove('active'));tab.classList.add('active');renderProducts(tab.dataset.filter)}
  });
  $('cart-open').onclick=()=>setDrawer(true);$('cart-close').onclick=()=>setDrawer(false);$('drawer-overlay').onclick=()=>setDrawer(false);
  $('checkout').onclick=()=>{if(Object.keys(cart).length){$('checkout-modal').classList.add('open');$('checkout-modal').setAttribute('aria-hidden','false');$('name').focus()}};
  function closeModal(){$('checkout-modal').classList.remove('open');$('checkout-modal').setAttribute('aria-hidden','true')}
  $('modal-close').onclick=closeModal;$('checkout-modal').addEventListener('click',e=>{if(e.target.id==='checkout-modal')closeModal()});
  $('place-order').onclick=()=>{const name=$('name').value.trim()||'friend';const count=Object.values(cart).reduce((a,b)=>a+b,0);cart={};save();renderCart();closeModal();setDrawer(false);toast(`Thanks, ${name}! Your ${count} snack${count===1?'':'s'} will be ready at lunch ✦`)};
  renderProducts();renderCart();
})();
