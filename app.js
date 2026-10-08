const KEY = "benteveo-bolsa";
const MAIL_KEY = "benteveo-mail";

const money = (n) =>
  "$" + Math.round(n).toLocaleString("es-AR");

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(KEY)) || [];
} catch {
  cart = [];
}

const cartEl = document.getElementById("cart");
const shade = document.querySelector(".shade");
const productDialog = document.getElementById("product-dialog");
const storyDialog = document.getElementById("story-dialog");
const guideDialog = document.getElementById("guide-dialog");

function save() {
  localStorage.setItem(KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const body = document.querySelector("[data-cart-body]");
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(count);
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.querySelector("[data-cart-total]").textContent = money(total);

  if (!cart.length) {
    body.innerHTML = '<p class="empty-cart">Todavía no hay nada. La ropa está más arriba.</p>';
    return;
  }

  body.innerHTML = cart
    .map((item) => {
      const card = document.querySelector(`.pcard[data-id="${item.id}"] img`);
      const src = card ? card.getAttribute("src") : "";
      return `<div class="line">
        <img src="${src}" alt="">
        <div>
          <h3>${item.name}</h3>
          <p>${item.size === "Único" ? "Pieza única" : "Talle " + item.size} · ${money(item.price)}</p>
          <div class="qty">
            <button type="button" data-action="qty" data-dir="-1" data-key="${item.key}" aria-label="Restar">–</button>
            <span>${item.qty}</span>
            <button type="button" data-action="qty" data-dir="1" data-key="${item.key}" aria-label="Sumar">+</button>
          </div>
        </div>
        <button type="button" class="ghost" data-action="remove" data-key="${item.key}">Sacar</button>
      </div>`;
    })
    .join("");
}

function openCart() {
  cartEl.classList.add("is-open");
  cartEl.setAttribute("aria-hidden", "false");
  shade.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartEl.classList.remove("is-open");
  cartEl.setAttribute("aria-hidden", "true");
  shade.hidden = true;
  document.body.style.overflow = "";
}

function hostOf(node) {
  return node.closest(".pcard, .modal__product") || productDialog;
}

function fixedSize(host) {
  if (host.classList.contains("pcard")) return host.dataset.fixedSize || "";
  return productDialog.dataset.fixedSize || "";
}

function chosenSize(host) {
  const fixed = fixedSize(host);
  if (fixed) return fixed;
  const on = host.querySelector(".sizes:not([hidden]) button.is-on");
  return on ? on.dataset.size : "";
}

function markSize(host, size) {
  host.querySelectorAll(".sizes button").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.size === size);
  });
  const hint = host.querySelector(".size-hint");
  if (hint) hint.hidden = true;
}

function addFrom(host) {
  const size = chosenSize(host);
  const hint = host.querySelector(".size-hint");
  if (!size) {
    if (hint) hint.hidden = false;
    return;
  }

  const source = host.classList.contains("pcard")
    ? host
    : document.querySelector(`.pcard[data-id="${productDialog.dataset.id}"]`);
  const id = source.dataset.id;
  const key = id + "-" + size;
  const found = cart.find((item) => item.key === key);
  if (found) found.qty += 1;
  else {
    cart.push({
      key,
      id,
      name: source.dataset.name,
      price: Number(source.dataset.price),
      size,
      qty: 1,
    });
  }
  save();

  const button = host.querySelector(".add");
  if (button) {
    button.classList.add("is-done");
    const previous = button.textContent;
    button.textContent = "Listo";
    setTimeout(() => {
      button.classList.remove("is-done");
      button.textContent = previous;
    }, 900);
  }
}

function openProduct(card) {
  const img = card.querySelector("img");
  productDialog.querySelector("[data-p-img]").src = img.src;
  productDialog.querySelector("[data-p-img]").alt = img.alt;
  productDialog.querySelector("[data-p-meta]").textContent = card.dataset.meta;
  productDialog.querySelector("[data-p-name]").textContent = card.dataset.name;
  productDialog.querySelector("[data-p-blurb]").textContent = card.dataset.blurb;
  productDialog.querySelector("[data-p-price]").textContent = money(card.dataset.price);
  productDialog.dataset.id = card.dataset.id;
  const sizes = productDialog.querySelector("[data-p-sizes]");
  const hint = productDialog.querySelector("[data-p-hint]");
  if (card.dataset.fixedSize) {
    productDialog.dataset.fixedSize = card.dataset.fixedSize;
    sizes.hidden = true;
    if (hint) hint.hidden = true;
  } else {
    delete productDialog.dataset.fixedSize;
    sizes.hidden = false;
    markSize(productDialog, chosenSize(card));
  }
  productDialog.showModal();
}

function openStory(article) {
  storyDialog.querySelector("[data-s-kicker]").textContent =
    article.querySelector(".eyebrow").textContent;
  storyDialog.querySelector("[data-s-title]").textContent =
    article.querySelector("h3").textContent;
  const more = article.querySelector(".more").textContent;
  const lead = article.querySelector("p:not(.eyebrow):not(.more)").textContent;
  storyDialog.querySelector("[data-s-body]").textContent = lead + " " + more;
  storyDialog.showModal();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "menu") {
    const links = document.getElementById("links");
    const open = links.classList.toggle("is-open");
    target.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (action === "filter") {
    document.querySelectorAll(".chip").forEach((chip) => {
      const on = chip === target;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const cat = target.dataset.cat;
    let shown = 0;
    document.querySelectorAll(".pcard").forEach((card) => {
      const hide = cat !== "todo" && card.dataset.cat !== cat;
      card.hidden = hide;
      if (!hide) shown += 1;
    });
    document.getElementById("empty").hidden = shown !== 0;
  }

  if (action === "size") {
    markSize(hostOf(target), target.dataset.size);
  }

  if (action === "add") addFrom(hostOf(target));

  if (action === "open-product") openProduct(target.closest(".pcard"));

  if (action === "open-cart") openCart();
  if (action === "close-cart") closeCart();

  if (action === "qty") {
    const item = cart.find((line) => line.key === target.dataset.key);
    if (!item) return;
    item.qty += Number(target.dataset.dir);
    if (item.qty <= 0) cart = cart.filter((line) => line.key !== item.key);
    save();
  }

  if (action === "remove") {
    cart = cart.filter((line) => line.key !== target.dataset.key);
    save();
  }

  if (action === "checkout") {
    document.querySelector("[data-checkout-note]").hidden = false;
  }

  if (action === "story") openStory(target.closest(".story"));
  if (action === "guide") guideDialog.showModal();

  if (action === "close-dialog") {
    target.closest("dialog").close();
  }
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

document.getElementById("links").addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.getElementById("links").classList.remove("is-open");
    document.querySelector(".burger").setAttribute("aria-expanded", "false");
  }
});

const form = document.getElementById("letter-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email");
  localStorage.setItem(MAIL_KEY, String(email));
  form.hidden = true;
  document.getElementById("thanks").hidden = false;
});

if (localStorage.getItem(MAIL_KEY)) {
  form.hidden = true;
  document.getElementById("thanks").hidden = false;
}

renderCart();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const drift = document.querySelector(".band__media img");

if (drift && !reduceMotion) {
  let scheduled = false;
  const place = () => {
    scheduled = false;
    const parent = drift.parentElement;
    const rect = parent.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const progress = (view - rect.top) / (view + rect.height);
    const y = (0.5 - progress) * 36;
    drift.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.08)`;
  };
  const request = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(place);
  };
  document.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  place();
}

const finePointer = window.matchMedia("(pointer: fine)").matches;
const cursor = document.querySelector(".cursor");
const heroMedia = document.querySelector(".hero__media");
const heroImg = heroMedia && heroMedia.querySelector("img");

if (cursor && finePointer && !reduceMotion) {
  document.documentElement.classList.add("has-cursor");
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let cx = x;
  let cy = y;
  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    cursor.classList.add("is-on");
  });
  document.documentElement.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-on");
  });
  const follow = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    cursor.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

if (heroMedia && heroImg && finePointer && !reduceMotion) {
  heroMedia.addEventListener("pointermove", (event) => {
    const box = heroMedia.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    heroImg.style.transform = `translate3d(${(px * -22).toFixed(1)}px, ${(py * -14).toFixed(1)}px, 0) scale(1.08)`;
  });
  heroMedia.addEventListener("pointerleave", () => {
    heroImg.style.transform = "";
  });
}

document.querySelectorAll(".ph, .looks__frame").forEach((face) => {
  if (!finePointer || reduceMotion) return;
  const img = face.querySelector("img");
  if (!img) return;
  face.addEventListener("pointermove", (event) => {
    const box = face.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    img.style.transform = `scale(1.08) translate(${(-x * 16).toFixed(1)}px, ${(-y * 12).toFixed(1)}px)`;
  });
  face.addEventListener("pointerleave", () => {
    img.style.transform = "";
  });
});
