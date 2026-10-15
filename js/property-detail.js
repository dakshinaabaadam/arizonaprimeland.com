(function () {
  "use strict";
  const root = document.getElementById("property-detail");
  if (!root) return;
  const properties = window.APL_PROPERTIES || [];
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id") || "montebello-lot-e";
  const property = properties.find((item) => item.id === requestedId);
  const notFound = document.getElementById("property-not-found");
  if (!property) {
    root.hidden = true;
    notFound.hidden = false;
    document.title = "Property Not Found | ArizonaPrimeLand.com";
    return;
  }
  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const location = `${property.city}, ${property.stateCode} ${property.zip}`;
  const similarGrid = document.getElementById("similar-property-results");
  if (similarGrid) {
    const related = properties
      .filter((item) => item.id !== property.id)
      .sort((a, b) => {
        const score = (item) =>
          (item.city === property.city ? 0 : 10) +
          (item.propertyType === property.propertyType ? 0 : 3) +
          Math.min(Math.abs(item.price - property.price) / 100000, 9);
        return score(a) - score(b);
      })
      .slice(0, 3);
    const formatPrice = (amount) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    related.forEach((item) => {
      const href = `property-detail.html?id=${encodeURIComponent(item.id)}`;
      const card = document.createElement("article");
      card.className = "property-card";
      const imageLink = document.createElement("a");
      imageLink.className = "property-card__image-link";
      imageLink.href = href;
      imageLink.setAttribute("aria-label", `View ${item.title}`);
      const image = document.createElement("img");
      image.className = "property-card__image";
      image.src = item.images?.[0] || "assets/images/desert-landscape-placeholder.jpg";
      image.alt = item.imageAlt || "Representative Arizona landscape; not a parcel photograph.";
      image.loading = "lazy";
      imageLink.append(image);
      const badge = document.createElement("span");
      badge.className = "status-badge";
      badge.textContent = item.status;
      imageLink.append(badge);
      card.append(imageLink);

      const body = document.createElement("div");
      body.className = "property-card__body";
      const title = document.createElement("h3");
      title.className = "property-card__title";
      const titleLink = document.createElement("a");
      titleLink.href = href;
      titleLink.textContent = item.title;
      title.append(titleLink);
      body.append(title);
      const where = document.createElement("p");
      where.className = "property-card__location";
      where.textContent = `⌖ ${item.city}, ${item.stateCode} ${item.zip}`;
      body.append(where);
      const facts = document.createElement("div");
      facts.className = "property-card__facts";
      [
        `${item.acres.toFixed(2)} acres`,
        item.propertyType,
      ].forEach((fact) => {
        const span = document.createElement("span");
        span.textContent = fact;
        facts.append(span);
      });
      body.append(facts);
      const bottom = document.createElement("div");
      bottom.className = "property-card__bottom";
      const price = document.createElement("strong");
      price.className = "property-price";
      price.textContent = formatPrice(item.price);
      bottom.append(price);
      const details = document.createElement("a");
      details.className = "button button--small";
      details.href = href;
      details.textContent = "View Details →";
      bottom.append(details);
      body.append(bottom);
      card.append(body);
      similarGrid.append(card);
    });
  }
  document.title = `${property.title} | ArizonaPrimeLand.com`;
  setText("detail-title", property.title);
  setText("detail-breadcrumb-title", property.title);
  setText("detail-price", money(property.price));
  setText("detail-status", property.status);
  setText("detail-location", location);
  setText("detail-type", property.propertyType);
  setText("detail-acreage", `${property.acres.toFixed(2)} Acres`);
  setText("detail-financing", property.financing);
  setText("detail-price-acre", `${money(property.pricePerAcre)} per acre`);
  const pricePerAcreNote = byId("detail-price-acre-note");
  if (property.pricePerAcreNote) {
    pricePerAcreNote.textContent = property.pricePerAcreNote;
    pricePerAcreNote.hidden = false;
  }
  setText("detail-table-price", money(property.price));
  setText("detail-table-price-acre", money(property.pricePerAcre));
  setText("detail-table-type", property.propertyType);
  setText("detail-table-acreage", `${property.acres.toFixed(2)} Acres`);
  setText("detail-table-financing", property.financing);
  setText("detail-apn", property.apn);
  setText("detail-mls", property.mlsNumber);
  setText("detail-zoning", property.zoning);
  setText("detail-cross-street", property.crossStreet);
  setText("detail-city", property.city);
  setText("detail-state", property.state);
  setText("detail-country", property.country);
  setText("detail-zip", property.zip);
  setText("detail-agent-name", property.listedBy);
  setText("detail-agent-role", property.agentRole);
  setText("detail-agent-email", property.agentEmail);
  setText("detail-agent-phone", property.agentPhoneDisplay);
  setText("detail-remarks", property.remarks);
  const remarksPanel = byId("detail-remarks-panel");
  remarksPanel.hidden = !String(property.remarks || "").trim();
  const featurePanel = byId("detail-features-panel");
  const featureList = byId("detail-property-features");
  const propertyFeatures = property.propertyFeatures || property.features || [];
  featureList.replaceChildren(...propertyFeatures.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  }));
  featurePanel.hidden = propertyFeatures.length === 0;
  const directionsPanel = byId("detail-directions-panel");
  setText("detail-directions", property.directions || "");
  directionsPanel.hidden = !property.directions;
  const emailLink = byId("detail-agent-email-link");
  const mailtoLink = byId("detail-agent-mailto");
  if (property.agentEmail) {
    emailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(property.agentEmail)}`;
    emailLink.target = "_blank";
    emailLink.rel = "noopener noreferrer";
    mailtoLink.href = `mailto:${property.agentEmail}`;
  } else {
    emailLink.hidden = true;
    mailtoLink.hidden = true;
  }
  const phoneLink = byId("detail-agent-phone-link");
  if (property.agentPhoneTel) phoneLink.href = `tel:${property.agentPhoneTel}`;
  else phoneLink.hidden = true;
  const mapQuery = property.latitude && property.longitude
    ? `${property.latitude}, ${property.longitude}`
    : `${property.crossStreet}, ${property.city}, ${property.stateCode} ${property.zip}`;
  byId("detail-area-map-link").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  byId("detail-area-map-link").target = "_blank";
  byId("detail-area-map-link").rel = "noopener noreferrer";
  setText("detail-location-note", property.latitude && property.longitude
    ? "Coordinates are supplied by the source listing; verify the parcel boundary before visiting."
    : "Map search is based on the source cross streets and does not show verified parcel boundaries.");
  setText("detail-area-map-link", property.latitude && property.longitude
    ? "Open source coordinates ↗"
    : "Open source-area map ↗");

  const mainImage = byId("detail-main-image");
  const thumbs = byId("detail-gallery-thumbnails");
  let activeIndex = 0;
  function displayImage(index) {
    activeIndex = (index + property.images.length) % property.images.length;
    mainImage.src = property.images[activeIndex];
    mainImage.alt = `${property.title} — Just Land gallery image ${activeIndex + 1} of ${property.images.length}`;
    setText("detail-image-count", `${activeIndex + 1} / ${property.images.length}`);
    thumbs.querySelectorAll("button").forEach((button, i) => {
      button.classList.toggle("is-active", i === activeIndex);
      button.setAttribute("aria-pressed", String(i === activeIndex));
    });
  }
  byId("detail-area-preview-image").src = property.images[0];
  byId("detail-area-preview-image").alt = `${property.title} listing photo; not a verified boundary map.`;
  property.images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-thumb";
    button.setAttribute("aria-label", `Show listing image ${index + 1} of ${property.images.length}`);
    button.setAttribute("aria-pressed", String(index === 0));
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    button.append(image);
    button.addEventListener("click", () => displayImage(index));
    thumbs.append(button);
  });
  byId("gallery-previous").addEventListener("click", () => displayImage(activeIndex - 1));
  byId("gallery-next").addEventListener("click", () => displayImage(activeIndex + 1));
  const lightbox = byId("gallery-lightbox");
  const lightboxImage = byId("lightbox-image");
  byId("gallery-enlarge").addEventListener("click", () => {
    lightboxImage.src = mainImage.src;
    lightboxImage.alt = mainImage.alt;
    lightbox.hidden = false;
    byId("gallery-close").focus();
  });
  function closeLightbox() { lightbox.hidden = true; byId("gallery-enlarge").focus(); }
  byId("gallery-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !lightbox.hidden) closeLightbox(); });
  displayImage(0);

  const sourceNote = byId("detail-source-note");
  if (property.imported && sourceNote) {
    sourceNote.replaceChildren(document.createTextNode(
      `${property.images.length} photo${property.images.length === 1 ? "" : "s"} from this property's Just Land gallery. `
    ));
    const sourceLink = document.createElement("a");
    sourceLink.href = property.sourceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = "View original listing ↗";
    sourceNote.append(sourceLink);
    if (property.dataNote) {
      const note = document.createElement("span");
      note.className = "image-source-note__detail";
      note.textContent = ` ${property.dataNote}`;
      sourceNote.append(note);
    }
  }

  const inquiryForm = byId("property-inquiry-form");
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = byId("property-inquiry-status");
    if (!inquiryForm.checkValidity()) {
      inquiryForm.reportValidity();
      return;
    }
    const formData = new FormData(inquiryForm);
    const subject = `Property inquiry: ${property.title}`;
    const body = `Hello,\n\nI am interested in ${property.title}.\n\nName: ${formData.get("name")}\nPhone: ${formData.get("phone")}\nEmail: ${formData.get("email")}\nMessage: ${formData.get("message") || "(No additional message)"}\n\nPlease contact me about this property.`;
    const compose = property.agentEmail
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(property.agentEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      : property.sourceUrl;
    status.textContent = property.agentEmail
      ? "Opening a draft addressed to the listed agent. This does not send the message automatically."
      : "No contact email was included in the extracted record. Opening the source listing so you can contact its listing team.";
    status.hidden = false;
    window.open(compose, "_blank", "noopener,noreferrer");
  });

  const saveButton = byId("save-property-button");
  const savedMessage = byId("save-property-status");
  const FAVORITES_KEY = "apl-demo-favorites";
  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch (_error) { return []; }
  }
  function updateSaveButton() {
    const saved = getFavorites().includes(property.id);
    saveButton.setAttribute("aria-pressed", String(saved));
    saveButton.textContent = saved ? "♥ Saved to This Browser" : "♡ Save Property";
  }
  saveButton.addEventListener("click", () => {
    const auth = window.APL?.readDemoAuth();
    if (!auth || !auth.isLoggedIn) {
      savedMessage.textContent = "Sign in to the demo account first; saved properties are stored only in this browser.";
      savedMessage.hidden = false;
      return;
    }
    const favorites = getFavorites();
    const next = favorites.includes(property.id) ? favorites.filter((id) => id !== property.id) : [...favorites, property.id];
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch (_error) {
      savedMessage.textContent = "This browser did not allow saving this property.";
      savedMessage.hidden = false;
      return;
    }
    updateSaveButton();
    savedMessage.textContent = next.includes(property.id) ? "Saved in this browser's demo favorites." : "Removed from demo favorites.";
    savedMessage.hidden = false;
  });
  updateSaveButton();
}());
