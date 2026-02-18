const defaultItems = [
  {
    id: crypto.randomUUID(),
    title: "תיק קלאסי קלאפ מדיום",
    brand: "Chanel",
    category: "תיקים",
    condition: "מצוין",
    price: 16200,
    description: "עור כבש עם אבזמי זהב, מאומת סידורי.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: crypto.randomUUID(),
    title: "Submariner Date 41mm",
    brand: "Rolex",
    category: "שעונים",
    condition: "כמו חדש",
    price: 18000,
    description: "דגם 2022 פלדת אל-חלד, כולל מסמכים וכרטיס אחריות.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: crypto.randomUUID(),
    title: "Rockstud Pumps",
    brand: "Valentino",
    category: "נעליים",
    condition: "טוב",
    price: 1450,
    description: "עור בגוון ניוד, מידה 38.5, שחיקה קלה בסוליה.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: crypto.randomUUID(),
    title: "צעיף משי מונוגרם",
    brand: "Louis Vuitton",
    category: "אקססוריז",
    condition: "מצוין",
    price: 980,
    description: "צעיף מרובע 140 ס״מ בגווני כחול כהה וקרמל.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
  }
];

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

let listings = storage.get("luxeloop.listings", defaultItems);
let cart = storage.get("luxeloop.cart", []);
let favorites = storage.get("luxeloop.favorites", []);

const el = {
  grid: document.querySelector("#listingGrid"),
  template: document.querySelector("#itemTemplate"),
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categoryFilter"),
  condition: document.querySelector("#conditionFilter"),
  maxPrice: document.querySelector("#priceFilter"),
  priceValue: document.querySelector("#priceValue"),
  resetFilters: document.querySelector("#resetFilters"),
  resultCount: document.querySelector("#resultCount"),
  sellForm: document.querySelector("#sellForm"),
  sellNavBtn: document.querySelector("#sellNavBtn"),
  cartBtn: document.querySelector("#openCartBtn"),
  cartCount: document.querySelector("#cartCount"),
  cartDialog: document.querySelector("#cartDialog"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartTotal: document.querySelector("#cartTotal"),
  checkout: document.querySelector("#checkoutBtn"),
  toast: document.querySelector("#toast")
};

function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1800);
}

function money(amount) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

function hydrateCategories() {
  const cats = ["all", ...new Set(listings.map((x) => x.category))];
  el.category.innerHTML = cats.map((c) => `<option value="${c}">${c === "all" ? "הכול" : c}</option>`).join("");
}

function filteredListings() {
  const term = el.search.value.trim().toLowerCase();
  const cat = el.category.value;
  const cond = el.condition.value;
  const max = Number(el.maxPrice.value);

  return listings.filter((item) => {
    const matchesText = !term || `${item.title} ${item.brand} ${item.category}`.toLowerCase().includes(term);
    const matchesCat = cat === "all" || !cat || item.category === cat;
    const matchesCond = cond === "all" || item.condition === cond;
    const matchesPrice = item.price <= max;
    return matchesText && matchesCat && matchesCond && matchesPrice;
  });
}

function addToCart(itemId) {
  const entry = cart.find((it) => it.id === itemId);
  if (entry) entry.qty += 1;
  else cart.push({ id: itemId, qty: 1 });
  storage.set("luxeloop.cart", cart);
  renderCart();
  toast("נוסף לעגלה");
}

function toggleFavorite(itemId) {
  if (favorites.includes(itemId)) favorites = favorites.filter((x) => x !== itemId);
  else favorites.push(itemId);
  storage.set("luxeloop.favorites", favorites);
  renderListings();
}

function renderListings() {
  const items = filteredListings();
  el.grid.innerHTML = "";

  if (!items.length) {
    el.grid.innerHTML = '<p class="card" style="padding:1rem">לא נמצאו פריטים תואמים. נסו לשנות את הסינון.</p>';
  }

  items.forEach((item) => {
    const frag = el.template.content.cloneNode(true);
    const root = frag.querySelector(".item");

    const img = frag.querySelector(".item-image");
    img.src = item.image || "https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&w=800&q=80";
    img.alt = item.title;

    frag.querySelector(".item-title").textContent = item.title;
    frag.querySelector(".item-brand").textContent = item.brand;
    frag.querySelector(".item-desc").textContent = item.description;
    frag.querySelector(".meta").textContent = `${item.category} • ${item.condition}`;
    frag.querySelector(".price").textContent = money(item.price);

    const favBtn = frag.querySelector(".favorite");
    const isFav = favorites.includes(item.id);
    favBtn.textContent = isFav ? "♥" : "♡";
    favBtn.classList.toggle("active", isFav);
    favBtn.addEventListener("click", () => toggleFavorite(item.id));

    frag.querySelector(".add-btn").addEventListener("click", () => addToCart(item.id));

    root.dataset.id = item.id;
    el.grid.appendChild(frag);
  });

  el.resultCount.textContent = `${items.length} פריט${items.length === 1 ? "" : "ים"}`;
}

function renderCart() {
  el.cartCount.textContent = cart.reduce((n, item) => n + item.qty, 0);
  el.cartItems.innerHTML = "";

  if (!cart.length) {
    el.cartItems.innerHTML = '<p style="color:#5f6370">העגלה שלך ריקה.</p>';
    el.cartTotal.textContent = money(0);
    return;
  }

  let total = 0;

  cart.forEach((cartItem) => {
    const item = listings.find((x) => x.id === cartItem.id);
    if (!item) return;
    const subtotal = item.price * cartItem.qty;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <div style="font-size:.85rem;color:#5f6370">${item.brand} • כמות ${cartItem.qty}</div>
      </div>
      <div>
        <div>${money(subtotal)}</div>
        <button data-id="${item.id}" class="ghost" style="margin-top:.3rem">הסרה</button>
      </div>
    `;

    row.querySelector("button").addEventListener("click", () => {
      cart = cart.filter((x) => x.id !== item.id);
      storage.set("luxeloop.cart", cart);
      renderCart();
    });

    el.cartItems.appendChild(row);
  });

  el.cartTotal.textContent = money(total);
}

function saveListing(listing) {
  listings.unshift(listing);
  storage.set("luxeloop.listings", listings);
  hydrateCategories();
  renderListings();
}

function initializeEvents() {
  [el.search, el.category, el.condition, el.maxPrice].forEach((node) => {
    node.addEventListener("input", renderListings);
    node.addEventListener("change", renderListings);
  });

  el.maxPrice.addEventListener("input", () => {
    el.priceValue.textContent = money(Number(el.maxPrice.value));
  });

  el.resetFilters.addEventListener("click", () => {
    el.search.value = "";
    el.category.value = "all";
    el.condition.value = "all";
    el.maxPrice.value = el.maxPrice.max;
    el.priceValue.textContent = money(Number(el.maxPrice.max));
    renderListings();
  });

  el.sellForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(el.sellForm);
    const payload = {
      id: crypto.randomUUID(),
      title: fd.get("title").toString().trim(),
      brand: fd.get("brand").toString().trim(),
      category: fd.get("category").toString(),
      condition: fd.get("condition").toString(),
      price: Number(fd.get("price")),
      description: fd.get("description").toString().trim(),
      image: fd.get("image").toString().trim()
    };

    if (!payload.title || !payload.brand || !payload.price || !payload.description) return;

    saveListing(payload);
    el.sellForm.reset();
    toast("המודעה פורסמה בהצלחה");
  });

  el.sellNavBtn.addEventListener("click", () => {
    el.sellForm.scrollIntoView({ behavior: "smooth", block: "center" });
    el.sellForm.querySelector("input")?.focus();
  });

  el.cartBtn.addEventListener("click", () => {
    renderCart();
    el.cartDialog.showModal();
  });

  el.closeCart.addEventListener("click", () => el.cartDialog.close());

  el.checkout.addEventListener("click", () => {
    if (!cart.length) return toast("העגלה ריקה");
    cart = [];
    storage.set("luxeloop.cart", cart);
    renderCart();
    el.cartDialog.close();
    toast("הרכישה הושלמה בהצלחה. תודה!");
  });
}

function boot() {
  hydrateCategories();
  el.category.value = "all";
  el.maxPrice.max = "18000";
  el.maxPrice.value = el.maxPrice.max;
  el.priceValue.textContent = money(Number(el.maxPrice.value));
  renderListings();
  renderCart();
  initializeEvents();
}

boot();
