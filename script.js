const loader = document.querySelector(".loader");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const revealItems = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const quantityEl = document.querySelector("#quantity");
const priceEl = document.querySelector("#price");
const bundleInputs = document.querySelectorAll('input[name="bundle"]');
const qtyButtons = document.querySelectorAll("[data-qty]");

const productConfig = {
  basePrice: 69.95,
  paypalBusinessEmail: "VUL_HIER_JE_PAYPAL_EMAIL_IN",
  bundleDiscounts: {
    1: 0,
    2: 0.1,
    3: 0.15
  },
  integrations: {
    payments: ["paypal"],
    analytics: ["tiktok_pixel", "meta_pixel", "microsoft_clarity", "google_analytics"],
    future: ["affiliate_codes", "influencer_dashboard", "subscriptions", "multi_product"]
  },
  emailTemplates: ["order-confirmation", "shipping", "abandoned-cart", "feedback-request"]
};

let quantity = 1;

window.addEventListener("load", () => {
  window.setTimeout(() => loader?.classList.add("hidden"), 420);
});

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => revealObserver.observe(item));

faqItems.forEach((item) => {
  item.addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");
    faqItems.forEach((other) => other.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  });
});

function getSelectedBundle() {
  return Number(document.querySelector('input[name="bundle"]:checked')?.value || 1);
}

function formatPrice(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function updatePrice() {
  const total = getCurrentTotal();
  if (quantityEl) quantityEl.textContent = String(quantity);
  if (priceEl) priceEl.textContent = formatPrice(total);
}

function getCurrentTotal() {
  const bundle = getSelectedBundle();
  const discount = productConfig.bundleDiscounts[bundle] || 0;
  const subtotal = productConfig.basePrice * bundle * quantity;
  return subtotal * (1 - discount);
}

function buildPayPalUrl() {
  const bundle = getSelectedBundle();
  const total = getCurrentTotal();
  const businessEmail = productConfig.paypalBusinessEmail;

  if (!businessEmail || businessEmail.includes("VUL_HIER")) {
    return "";
  }

  const params = new URLSearchParams({
    cmd: "_xclick",
    business: businessEmail,
    item_name: `Puriv UV-C waterfles zwart - bundel ${bundle}`,
    amount: total.toFixed(2),
    currency_code: "EUR",
    quantity: "1",
    no_shipping: "2",
    no_note: "1",
    return: `${window.location.origin}${window.location.pathname}#bestellen`,
    cancel_return: `${window.location.origin}${window.location.pathname}#bestellen`
  });

  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

qtyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.qty;
    quantity = direction === "plus" ? Math.min(quantity + 1, 9) : Math.max(quantity - 1, 1);
    updatePrice();
  });
});

bundleInputs.forEach((input) => input.addEventListener("change", updatePrice));
updatePrice();

document.querySelector(".checkout-button")?.addEventListener("click", () => {
  const bundle = getSelectedBundle();
  const eventPayload = {
    product: "Puriv UV-C waterfles",
    bundle,
    quantity,
    color: "Zwart"
  };

  window.dispatchEvent(new CustomEvent("puriv:add-to-cart", { detail: eventPayload }));
  const paypalUrl = buildPayPalUrl();
  if (!paypalUrl) {
    alert("Vul in script.js eerst je PayPal e-mailadres in bij paypalBusinessEmail.");
    return;
  }
  window.location.href = paypalUrl;
});

window.purivStorefront = productConfig;
