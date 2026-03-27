const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");
const floatingLogo = document.querySelector(".floating-logo");
const dropdownParents = document.querySelectorAll(".has-dropdown");
const productsCatalog = document.querySelector("#productsCatalog");
const productCategoryNav = document.querySelector("#productCategoryNav");
const catalogSearch = document.querySelector("#catalogSearch");
const starFilter = document.querySelector("#starFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const catalogResultNote = document.querySelector("#catalogResultNote");
const catalogReset = document.querySelector("#catalogReset");
const samePageHashLinks = document.querySelectorAll('a[href^="#"]');
const pageShell = document.querySelector(".page-shell");
const isLocalPreview =
  window.location.protocol === "file:" ||
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const apiBaseUrl = String(
  window.SIMBA_SITE_CONFIG?.apiBaseUrl ||
    document.documentElement.dataset.apiBaseUrl ||
    (isLocalPreview ? "http://127.0.0.1:3000" : "")
)
  .trim()
  .replace(/\/+$/, "");
const buildApiUrl = (path) => `${apiBaseUrl}${path}`;
const getPageContext = () => {
  const pathName = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  const pageTitle = document.title.trim() || "Simba Agro Chemicals";
  return `${pageTitle} | ${pathName}`;
};
const escapeSupportHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const ensureSupportClientId = () => {
  const storageKey = "simba-support-client-id";
  const existingId = window.localStorage.getItem(storageKey);
  if (existingId) return existingId;

  const clientId = `simba-${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
  window.localStorage.setItem(storageKey, clientId);
  return clientId;
};
const supportFaq = [
  {
    keywords: ["price", "rate", "mrp", "cost"],
    reply:
      "Aap product prices directly catalog page par dekh sakte hain. Agar bulk rate chahiye ho to WhatsApp support se turant connect kar sakte hain.",
  },
  {
    keywords: ["product", "catalog", "insecticide", "herbicide", "fungicide", "pgr"],
    reply:
      "Hum insecticides, herbicides, fungicides, aur PGR categories support karte hain. Main aapko relevant section tak guide kar sakta hoon ya aap products page open kar sakte hain.",
  },
  {
    keywords: ["delivery", "dispatch", "bulk", "supply"],
    reply:
      "Bulk supply aur dispatch support ke liye team requirement receive karke fastest route share karti hai. Aap quantity aur location bhej dijiye.",
  },
  {
    keywords: ["contact", "call", "phone", "email"],
    reply:
      "Aap humein WhatsApp par +91 79054 96176 ya email info@simbaagro.com par directly reach kar sakte hain.",
  },
];

const initializeInfrastructureNav = () => {
  const navLists = document.querySelectorAll(".site-nav > ul");

  navLists.forEach((navList) => {
    if (navList.querySelector('[data-nav-item="infrastructure"]')) return;

    const infrastructureItem = document.createElement("li");
    infrastructureItem.className = "has-dropdown";
    infrastructureItem.dataset.navItem = "infrastructure";
    infrastructureItem.innerHTML = `
      <a href="infrastructure.html">Infrastructure</a>
      <ul class="dropdown-menu">
        <li><a href="infrastructure.html">Overview</a></li>
        <li><a href="manufacturing-unit.html">Manufacturing Unit</a></li>
        <li><a href="quality-department.html">Quality Department</a></li>
      </ul>
    `;

    const trigger = infrastructureItem.querySelector(":scope > a");
    trigger?.addEventListener("click", (event) => {
      if (window.innerWidth <= 780) {
        const hasOpenClass = infrastructureItem.classList.contains("open");

        if (!hasOpenClass) {
          event.preventDefault();
          document.querySelectorAll(".has-dropdown").forEach((parent) => {
            if (parent !== infrastructureItem) parent.classList.remove("open");
          });
          infrastructureItem.classList.add("open");
        } else if (trigger.getAttribute("href")?.startsWith("#")) {
          infrastructureItem.classList.remove("open");
        }
      }
    });

    const productsItem = navList.children[1];
    if (productsItem?.nextSibling) {
      navList.insertBefore(infrastructureItem, productsItem.nextSibling);
    } else {
      navList.appendChild(infrastructureItem);
    }
  });
};

const markPageLoaded = () => {
  document.body.classList.add("page-loaded");
};

if (document.fonts?.ready) {
  const fallbackTimer = window.setTimeout(markPageLoaded, 1200);

  document.fonts.ready
    .then(() => {
      window.clearTimeout(fallbackTimer);
      requestAnimationFrame(markPageLoaded);
    })
    .catch(() => {
      window.clearTimeout(fallbackTimer);
      requestAnimationFrame(markPageLoaded);
    });
} else {
  requestAnimationFrame(markPageLoaded);
}

const normalizeProductKey = (value = "") =>
  value
    .toUpperCase()
    .replace(/&AMP;/g, "AND")
    .replace(/[^A-Z0-9]+/g, "");

const productNameAliases = {
  DURON50: "DIRON",
  ETHIWIN50: "ETHIWIN",
  HAVALDAR: "HAWALDAR",
  FUGWIN: "FUNGWIN",
  VOLZOLPLUS: "VOLZOL",
};

const brandProductTitles = (titles) => {
  titles.forEach((title) => {
    if (title.querySelector(".sim-prefix")) return;

    const originalText = title.textContent.trim();
    const brandedText = originalText.replace(/^Sim-/i, "").trim();
    title.innerHTML = `<span class="product-brandline"><span class="sim-prefix">SIM</span><span class="sim-hyphen">-</span><span class="sim-product-name">${brandedText}</span></span>`;
  });
};

const initializeCategoryCards = () => {
  const categoryBlocks = document.querySelectorAll(".category-block");

  if (!categoryBlocks.length || !productCategoryNav) return;

  const categoryImages = {
    insecticides: { src: "insecticides.png", label: "Insecticides" },
    herbicides: { src: "herbicides.png", label: "Herbicides" },
    fungicides: { src: "fungicides.png", label: "Fungicides" },
    pgrs: { src: "pgrs.png", label: "PGRs" },
  };

  productCategoryNav.innerHTML = "";

  const openCategory = (targetId) => {
    categoryBlocks.forEach((block) => {
      const isActive = block.id === targetId;
      block.classList.toggle("category-hidden", !isActive);
      block.classList.toggle("category-active", isActive);

      block.querySelectorAll(".product-entry").forEach((entry) => {
        entry.open = isActive;
      });
    });

    productCategoryNav.querySelectorAll(".category-media-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.target === targetId);
    });
  };

  categoryBlocks.forEach((block, index) => {
    const config = categoryImages[block.id];
    if (!config) return;

    const mediaCard = document.createElement("button");
    mediaCard.className = "category-media-card";
    mediaCard.type = "button";
    mediaCard.dataset.target = block.id;
    mediaCard.innerHTML = `
      <span class="category-card-thumb-wrap">
        <img src="${config.src}" alt="${config.label}" class="category-card-thumb" />
      </span>
      <span class="category-card-copy">
        <strong>${config.label}</strong>
        <small>View listed products</small>
      </span>
      <span class="category-card-arrow" aria-hidden="true">&rarr;</span>
    `;

    mediaCard.addEventListener("click", () => {
      openCategory(block.id);
      block.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    productCategoryNav.appendChild(mediaCard);

    if (index !== 0) {
      block.classList.add("category-hidden");
      return;
    }

    block.classList.add("category-active");
    block.querySelectorAll(".product-entry").forEach((entry) => {
      entry.open = true;
    });
    mediaCard.classList.add("active");
  });
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

initializeInfrastructureNav();

if (dropdownParents.length) {
  dropdownParents.forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    if (!trigger) return;

    trigger.addEventListener("click", (event) => {
      if (window.innerWidth <= 780) {
        const hasOpenClass = item.classList.contains("open");
        const href = trigger.getAttribute("href");

        if (!hasOpenClass) {
          event.preventDefault();
          dropdownParents.forEach((parent) => {
            if (parent !== item) parent.classList.remove("open");
          });
          item.classList.add("open");
          return;
        }

        if (href === "#" || href?.startsWith("#")) {
          item.classList.remove("open");
        }
      }
    });
  });
}

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
    observer.observe(item);
  });
}

if (contactForm && formNote) {
  if (!contactForm.querySelector('[name="company"]')) {
    const honeypotField = document.createElement("input");
    honeypotField.type = "text";
    honeypotField.name = "company";
    honeypotField.tabIndex = -1;
    honeypotField.autocomplete = "off";
    honeypotField.setAttribute("aria-hidden", "true");
    honeypotField.style.position = "absolute";
    honeypotField.style.left = "-9999px";
    honeypotField.style.opacity = "0";
    contactForm.appendChild(honeypotField);
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const requirementType = String(formData.get("requirement_type") || "").trim();
    const requirementSubject = String(formData.get("subject") || "").trim();
    const productInterest = [requirementType, requirementSubject].filter(Boolean).join(" | ");
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      product_interest: productInterest || requirementType || requirementSubject || "General Inquiry",
      message: String(formData.get("message") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      page_context: getPageContext(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      formNote.textContent = "Please fill in the required inquiry details first.";
      return;
    }

    formNote.textContent = "Sending your inquiry to Simba support...";
    submitButton?.setAttribute("disabled", "disabled");

    try {
      const response = await fetch(buildApiUrl("/api/contact/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to submit inquiry right now.");
      }

      formNote.textContent =
        result.message ||
        "Thank you. Your inquiry has been sent successfully and the team will connect with you shortly.";
      contactForm.reset();
    } catch (error) {
      formNote.textContent =
        error.message ||
        "Inquiry could not be submitted right now. Please try again or use WhatsApp support.";
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}

if (floatingLogo) {
  floatingLogo.addEventListener("click", (event) => {
    const isHomePage =
      window.location.pathname.endsWith("/index.html") ||
      window.location.pathname.endsWith("\\index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname === "";

    if (isHomePage) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

if (productsCatalog && window.PRODUCTS_DATA?.categories) {
  const categories = window.PRODUCTS_DATA.categories;
  const updateResultNote = (visibleCategories) => {
    if (!catalogResultNote) return;

    const totalVisibleProducts = visibleCategories.reduce(
      (sum, category) => sum + category.products.length,
      0
    );
    const totalCategories = visibleCategories.length;

    if (!totalVisibleProducts) {
      catalogResultNote.textContent =
        "No matching product found. Try a different product name, star rating, or category.";
      return;
    }

    catalogResultNote.textContent = `Showing ${totalVisibleProducts} product${
      totalVisibleProducts === 1 ? "" : "s"
    } across ${totalCategories} categor${totalCategories === 1 ? "y" : "ies"}.`;
  };

  if (categoryFilter) {
    categoryFilter.innerHTML = `
      <option value="all">All categories</option>
      ${categories
        .map(
          (category) =>
            `<option value="${category.slug}">${category.name} (${category.products.length})</option>`
        )
        .join("")}
    `;
  }

  const renderVariantRows = (variants) =>
    variants
      .map(
        (variant) => `
          <tr>
            <td>${variant.packingSize || "-"}</td>
            <td>${variant.caseSize || "-"}</td>
            <td>${variant.packType || "-"}</td>
            <td>${variant.unitPerCase || "-"}</td>
            <td>${variant.creditPricePer || "-"}</td>
            <td>${variant.creditPriceUnit || "-"}</td>
            <td>${variant.gst || "-"}</td>
            <td>${variant.gstWithCreditRate || "-"}</td>
            <td>${variant.mrp || "-"}</td>
          </tr>
        `
      )
      .join("");

  const renderRichProduct = (categorySlug, product) => {
    const detailMap = window.PRODUCTS_RICH_DATA?.[categorySlug];
    const productKey = normalizeProductKey(product.name);
    const technicalKey = normalizeProductKey(product.details || "");
    const aliasKey = productNameAliases[productKey];
    const detailEntry =
      detailMap?.[productKey] ||
      (aliasKey ? detailMap?.[aliasKey] : null) ||
      Object.values(detailMap || {}).find((entry) => {
        const entryNameKey = normalizeProductKey(entry.sourceName || "");
        const entryTechnicalKey = normalizeProductKey(entry.technicalName || "");
        return technicalKey && (entryNameKey === technicalKey || entryTechnicalKey === technicalKey);
      });

    if (!detailEntry) {
      return "";
    }

    return `
      <div class="rich-product-body">
        <div class="rich-product-copy detail-html">${detailEntry.detailHtml || ""}</div>
      </div>
    `;
  };

  const renderCatalog = (visibleCategories) => {
    if (!visibleCategories.length) {
      productsCatalog.innerHTML = `
        <section class="category-block catalog-empty-state">
          <div class="category-header">
            <div>
              <p class="eyebrow">No match</p>
              <h3>No products matched your filters.</h3>
            </div>
          </div>
          <div class="product-list">
            <article class="catalog-empty-copy">
              <p>Try a broader search term, change the star filter, or reset all filters.</p>
            </article>
          </div>
        </section>
      `;
      updateResultNote([]);
      return;
    }

    productsCatalog.innerHTML = visibleCategories
      .map(
        (category) => `
          <section class="category-block" id="${category.slug}">
            <div class="category-header">
              <div>
                <p class="eyebrow">Category</p>
                <h3>${category.name}</h3>
              </div>
              <span class="category-count">${category.products.length} products</span>
            </div>
            <div class="product-list">
              ${category.products
                .map(
                  (product, index) => `
                    <details class="product-entry"${index === 0 ? " open" : ""}>
                      <summary>
                        <span class="product-index">${product.srNo || "-"}</span>
                        <span class="product-meta">
                          <strong>${product.name}</strong>
                          <span>${product.details || "Product details as per price list."}</span>
                        </span>
                        <span class="product-star">${product.star || "Listed"}</span>
                      </summary>
                      <div class="product-table-wrap">
                        <table class="product-table">
                          <thead>
                            <tr>
                              <th>Packing</th>
                              <th>Case Size</th>
                              <th>Pack Type</th>
                              <th>Unit/Case</th>
                              <th>Credit Price</th>
                              <th>Price/Unit</th>
                              <th>GST</th>
                              <th>GST Rate/Unit</th>
                              <th>MRP</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${renderVariantRows(product.variants)}
                          </tbody>
                        </table>
                        ${renderRichProduct(category.slug, product)}
                      </div>
                    </details>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    brandProductTitles(productsCatalog.querySelectorAll(".product-meta strong"));
    initializeCategoryCards();
    updateResultNote(visibleCategories);
  };

  const applyCatalogFilters = () => {
    const searchTerm = catalogSearch?.value.trim().toLowerCase() || "";
    const selectedStar = starFilter?.value || "all";
    const selectedCategory = categoryFilter?.value || "all";

    const visibleCategories = categories
      .filter((category) => selectedCategory === "all" || category.slug === selectedCategory)
      .map((category) => ({
        ...category,
        products: category.products.filter((product) => {
          const matchesStar = selectedStar === "all" || product.star === selectedStar;
          if (!matchesStar) return false;

          if (!searchTerm) return true;

          const searchHaystack = [
            product.srNo,
            product.name,
            product.details,
            product.star,
            ...(product.variants || []).flatMap((variant) => [
              variant.packingSize,
              variant.packType,
              variant.caseSize,
            ]),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchHaystack.includes(searchTerm);
        }),
      }))
      .filter((category) => category.products.length > 0);

    renderCatalog(visibleCategories);
  };

  applyCatalogFilters();

  if (catalogSearch) {
    catalogSearch.addEventListener("input", applyCatalogFilters);
  }

  if (starFilter) {
    starFilter.addEventListener("change", applyCatalogFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyCatalogFilters);
  }

  if (catalogReset) {
    catalogReset.addEventListener("click", () => {
      if (catalogSearch) catalogSearch.value = "";
      if (starFilter) starFilter.value = "all";
      if (categoryFilter) categoryFilter.value = "all";
      applyCatalogFilters();
    });
  }
}

const productTitles = document.querySelectorAll(".product-meta strong");

if (productTitles.length) {
  brandProductTitles(productTitles);
}

if (samePageHashLinks.length) {
  samePageHashLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

if (pageShell && !document.querySelector(".site-footer")) {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-grid">
      <section class="footer-brand">
        <p class="footer-kicker">Simba Agro Chemicals Pvt. Ltd.</p>
        <h2>Reliable crop solutions with stronger brand presence.</h2>
        <p>
          Built for agriculture-focused markets with category-led product presentation, responsive support, and a cleaner digital identity.
        </p>
        <div class="footer-badges">
          <span>Product Catalog</span>
          <span>Business Support</span>
          <span>Responsive Inquiry</span>
        </div>
      </section>

      <section class="footer-links">
        <h3>Quick Links</h3>
        <a href="index.html">Home</a>
        <a href="index.html#about-us">About Us</a>
        <a href="products.html">Our Products</a>
        <a href="index.html#facility">Infrastructure</a>
        <a href="index.html#quality">Quality</a>
        <a href="index.html#contact">Contact</a>
      </section>

      <section class="footer-links">
        <h3>Product Categories</h3>
        <a href="products.html#insecticides">Insecticides</a>
        <a href="products.html#herbicides">Herbicides</a>
        <a href="products.html#fungicides">Fungicides</a>
        <a href="products.html#pgrs">PGRs</a>
      </section>

      <section class="footer-contact">
        <h3>Contact</h3>
        <a href="https://wa.me/917905496176" target="_blank" rel="noreferrer">+91 79054 96176</a>
        <a href="mailto:info@simbaagro.com">info@simbaagro.com</a>
        <p>K-II/67-B First Floor Block K-II Gali No 2 Sangam Vihar, Delhi 110080</p>
        <div class="footer-socials">
          <a href="https://wa.me/917905496176" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="mailto:info@simbaagro.com">Email</a>
        </div>
      </section>
    </div>
    <div class="footer-bottom-bar">
      <p>Copyright &copy; Simba Agro Chemicals Pvt. Ltd. All rights reserved.</p>
    </div>
  `;
  pageShell.appendChild(footer);
}

if (!document.querySelector(".support-chat-widget")) {
  const supportWidget = document.createElement("section");
  supportWidget.className = "support-chat-widget";
  supportWidget.innerHTML = `
    <button class="support-chat-launcher" type="button" aria-expanded="false" aria-controls="supportChatPanel">
      <span class="support-chat-pulse"></span>
      <span class="support-chat-launcher-icon" aria-hidden="true"></span>
      <span class="support-chat-launcher-copy">
        <strong>Support</strong>
        <small>Chat with us</small>
      </span>
    </button>

    <div class="support-chat-panel" id="supportChatPanel" hidden>
      <div class="support-chat-header">
        <div>
          <p>Simba Support</p>
          <strong>How can we help today?</strong>
        </div>
        <button class="support-chat-close" type="button" aria-label="Close support chat">×</button>
      </div>

      <div class="support-chat-body">
        <div class="support-chat-messages" aria-live="polite"></div>
        <div class="support-chat-quick-actions">
          <button type="button" data-quick-message="Show product categories">Product categories</button>
          <button type="button" data-quick-message="I need bulk pricing">Bulk pricing</button>
          <button type="button" data-quick-message="Help me contact support">Contact support</button>
        </div>
      </div>

      <form class="support-chat-form">
        <input
          class="support-chat-input"
          type="text"
          name="supportMessage"
          placeholder="Type your message..."
          autocomplete="off"
        />
        <button class="support-chat-send" type="submit">Send</button>
      </form>

      <a
        class="support-chat-escalate"
        href="https://wa.me/917905496176?text=Hello%20Simba%20Agro%20Chemicals%2C%20I%20need%20support."
        target="_blank"
        rel="noreferrer"
      >
        <span class="support-chat-escalate-icon" aria-hidden="true">◔</span>
        Escalate to WhatsApp
      </a>
    </div>
  `;

  document.body.appendChild(supportWidget);

  const launcher = supportWidget.querySelector(".support-chat-launcher");
  const panel = supportWidget.querySelector(".support-chat-panel");
  const closeButton = supportWidget.querySelector(".support-chat-close");
  const messages = supportWidget.querySelector(".support-chat-messages");
  const form = supportWidget.querySelector(".support-chat-form");
  const input = supportWidget.querySelector(".support-chat-input");
  const quickActions = supportWidget.querySelectorAll("[data-quick-message]");
  const supportClientId = ensureSupportClientId();
  const renderedMessageIds = new Set();
  let supportPollTimer = 0;
  let supportSessionId = "";
  let supportSessionReady = false;
  let supportFallbackNoticeShown = false;

  const pushMessage = (author, text, options = {}) => {
    if (options.id && renderedMessageIds.has(options.id)) {
      return null;
    }

    if (options.id) {
      renderedMessageIds.add(options.id);
    }

    const authorLabel =
      author === "admin" ? "Simba Team" : author === "bot" ? "Simba" : "You";
    const bubble = document.createElement("article");
    bubble.className = `support-chat-message support-chat-message-${author}`;
    bubble.innerHTML = `
      <span class="support-chat-author">${authorLabel}</span>
      <p>${escapeSupportHtml(text)}</p>
    `;

    if (options.typing) {
      bubble.classList.add("support-chat-message-typing");
      bubble.innerHTML = `
        <span class="support-chat-author">Simba</span>
        <div class="support-chat-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
    }

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  const renderServerMessages = (messageList = []) => {
    messageList.forEach((message) => {
      if (!message?.id || !message?.text) return;
      pushMessage(message.sender === "admin" ? "admin" : "user", message.text, {
        id: message.id,
      });
    });
  };

  const findReply = (message) => {
    const normalized = message.toLowerCase();
    const matched = supportFaq.find((item) =>
      item.keywords.some((keyword) => normalized.includes(keyword))
    );

    if (matched) return matched.reply;

    return "Thank you. Aap apni requirement type kijiye ya WhatsApp escalation use kijiye, team aapko jaldi guide karegi.";
  };

  const sendBotReply = (message) => {
    const typingBubble = pushMessage("bot", "", { typing: true });
    window.setTimeout(() => {
      typingBubble.remove();
      pushMessage("bot", findReply(message));
    }, 950);
  };

  const showSupportFallback = (message) => {
    if (supportFallbackNoticeShown) return;
    supportFallbackNoticeShown = true;
    pushMessage(
      "bot",
      message ||
        "Live support abhi connect nahi ho pa raha. Aap message try kar sakte hain, ya WhatsApp escalation use kijiye."
    );
  };

  const ensureSupportSession = async () => {
    if (supportSessionReady) return true;

    try {
      const response = await fetch(buildApiUrl("/api/chat/session"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: supportClientId,
          page_context: getPageContext(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to start support chat.");
      }

      supportSessionReady = true;
      supportSessionId = result.session_id || supportSessionId;
      renderServerMessages(result.messages);
      return true;
    } catch {
      showSupportFallback();
      return false;
    }
  };

  const pollSupportMessages = async () => {
    if (!supportSessionReady) return;

    try {
      const response = await fetch(
        `${buildApiUrl("/api/chat/messages")}?client_id=${encodeURIComponent(supportClientId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to fetch support replies.");
      }

      supportSessionId = result.session_id || supportSessionId;
      renderServerMessages(result.messages);
    } catch {
      showSupportFallback("Telegram support temporarily unavailable hai. WhatsApp ya contact form bhi use kar sakte hain.");
    }
  };

  const startSupportPolling = () => {
    if (supportPollTimer) return;
    supportPollTimer = window.setInterval(pollSupportMessages, 4000);
  };

  const stopSupportPolling = () => {
    if (!supportPollTimer) return;
    window.clearInterval(supportPollTimer);
    supportPollTimer = 0;
  };

  const sendSupportMessage = async (message) => {
    const pendingBubble = pushMessage("user", message);
    input?.setAttribute("disabled", "disabled");

    const ready = await ensureSupportSession();
    if (!ready) {
      input?.removeAttribute("disabled");
      sendBotReply(message);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/chat/message"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: supportClientId,
          page_context: getPageContext(),
          message,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to send support message.");
      }

      pendingBubble?.remove();
      supportSessionId = result.session_id || supportSessionId;
      renderServerMessages(result.messages);
      startSupportPolling();
    } catch {
      pendingBubble?.remove();
      showSupportFallback("Message send nahi ho paya. Aap dubara try kijiye ya WhatsApp escalation use kijiye.");
      sendBotReply(message);
    } finally {
      input?.removeAttribute("disabled");
      input?.focus();
    }
  };

  const openSupportChat = async () => {
    panel.hidden = false;
    supportWidget.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    if (!messages.childElementCount) {
      pushMessage(
        "bot",
        "Namaste! Main Simba support desk hoon. Aapka message team ko Telegram par live deliver hoga."
      );
    }
    const ready = await ensureSupportSession();
    if (ready) {
      startSupportPolling();
      await pollSupportMessages();
    }
    window.setTimeout(() => input?.focus(), 120);
  };

  const closeSupportChat = () => {
    supportWidget.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    stopSupportPolling();
  };

  launcher.addEventListener("click", () => {
    if (supportWidget.classList.contains("open")) {
      closeSupportChat();
      return;
    }
    openSupportChat();
  });

  closeButton?.addEventListener("click", closeSupportChat);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input?.value.trim();
    if (!message) return;

    input.value = "";
    await sendSupportMessage(message);
  });

  quickActions.forEach((button) => {
    button.addEventListener("click", async () => {
      const quickMessage = button.dataset.quickMessage;
      if (!quickMessage) return;
      await openSupportChat();
      await sendSupportMessage(quickMessage);
    });
  });
}
