(function initProductPage() {
  const root = document.querySelector("[data-pdp]");
  const missing = document.querySelector("[data-pdp-missing]");
  if (!root || !window.getProduct) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? window.getProduct(id) : null;

  if (!product) {
    if (missing) missing.hidden = false;
    return;
  }

  root.hidden = false;
  document.title = product.name + " — benteveo";

  const buy = root.querySelector("[data-pdp-buy]");
  buy.dataset.id = product.id;
  buy.dataset.name = product.name;
  buy.dataset.price = String(product.price);
  buy.dataset.meta = product.meta;
  buy.dataset.blurb = product.blurb;
  if (product.fixedSize) buy.dataset.fixedSize = product.fixedSize;
  else delete buy.dataset.fixedSize;

  root.querySelector("[data-pdp-meta]").textContent = product.meta;
  root.querySelector("[data-pdp-name]").textContent = product.name;
  root.querySelector("[data-pdp-blurb]").textContent = product.blurb;
  root.querySelector("[data-pdp-desc]").textContent = product.description || "";
  root.querySelector("[data-pdp-price]").textContent = money(product.price);

  const sizes = root.querySelector("[data-pdp-sizes]");
  const hint = root.querySelector("[data-pdp-hint]");
  if (product.fixedSize) {
    sizes.hidden = true;
    if (hint) hint.hidden = true;
  } else {
    sizes.hidden = false;
  }

  const main = root.querySelector("[data-pdp-main]");
  const thumbs = root.querySelector("[data-pdp-thumbs]");
  const images = product.images && product.images.length
    ? product.images
    : [{ src: product.image, alt: product.alt || product.name }];

  function showImage(index) {
    const image = images[index] || images[0];
    main.src = image.src;
    main.alt = image.alt || product.name;
    if (product.objectPosition) main.style.objectPosition = product.objectPosition;
    else main.style.removeProperty("object-position");
    thumbs.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("is-on", i === index);
      btn.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  thumbs.innerHTML = images
    .map(
      (image, index) =>
        `<button type="button" class="pdp__thumb" data-action="pdp-thumb" data-index="${index}" aria-label="Foto ${index + 1}" role="listitem">
          <img src="${image.src}" alt="">
        </button>`
    )
    .join("");
  showImage(0);

  const relatedHost = root.querySelector("[data-pdp-related]");
  const related = window.PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4);
  const bagSvg =
    '<svg aria-hidden="true" fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M8 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7.2 9.5h9.6c.7 0 1.3.6 1.2 1.3l-.8 9.2a1.4 1.4 0 0 1-1.4 1.3H8.2a1.4 1.4 0 0 1-1.4-1.3l-.8-9.2c-.1-.7.5-1.3 1.2-1.3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.5 12.5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

  relatedHost.innerHTML = related
    .map((item) => {
      const img = item.images[0];
      const pos = item.objectPosition
        ? ` style="object-position:${item.objectPosition}"`
        : "";
      const badge = item.badge
        ? `<span class="badge">${item.badge}</span>`
        : "";
      return `<article class="pcard" data-cat="${item.cat}" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}"${item.fixedSize ? ` data-fixed-size="${item.fixedSize}"` : ""} data-meta="${item.meta}" data-blurb="${item.blurb}">
        <a class="ph" href="${productHref(item.id)}">
          <img src="${img.src}" alt="${img.alt}"${pos}>
          ${badge}
        </a>
        <div class="pinfo">
          <div class="pinfo__text">
            <h3><a href="${productHref(item.id)}">${item.name}</a></h3>
            <p class="price">${money(item.price)}</p>
            <p class="meta">${item.meta}</p>
          </div>
          <button class="add" type="button" data-action="add" aria-label="Agregar a la bolsa">${bagSvg}</button>
        </div>
      </article>`;
    })
    .join("");

  document.addEventListener("click", (event) => {
    const thumb = event.target.closest("[data-action='pdp-thumb']");
    if (!thumb || !root.contains(thumb)) return;
    showImage(Number(thumb.dataset.index));
  });
})();
