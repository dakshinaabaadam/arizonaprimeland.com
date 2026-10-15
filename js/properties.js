(function () {
  "use strict";
  const form = document.getElementById("property-filters");
  const grid = document.getElementById("property-results");
  if (!form || !grid) return;
  const records = Array.isArray(window.APL_PROPERTIES) ? window.APL_PROPERTIES : [];
  const count = document.getElementById("results-count");
  const activeTags = document.getElementById("active-filter-tags");
  const empty = document.getElementById("property-empty-state");
  const emptyDetails = document.getElementById("empty-state-details");
  const status = document.getElementById("property-results-status");
  const sort = document.getElementById("sort-properties");
  const filterToggle = document.getElementById("filter-toggle");
  const filterPanel = document.getElementById("filter-panel");

  function populateCityFilter() {
    const citySelect = form.elements.city;
    if (!citySelect) return;
    const cities = [...new Set(records.map((property) => property.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    citySelect.replaceChildren(new Option("Any city", ""));
    cities.forEach((city) => citySelect.add(new Option(city, city)));
  }

  const fields = ["query", "type", "priceMin", "priceMax", "acresMin", "acresMax", "feature", "state", "city", "zip"];
  function clean(value) { return String(value || "").trim(); }
  function readFilters() {
    return Object.fromEntries(fields.map((key) => [key, clean(form.elements[key]?.value)]));
  }
  function setFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    fields.forEach((key) => {
      if (params.has(key) && form.elements[key]) form.elements[key].value = params.get(key);
    });
  }
  function includesText(record, query) {
    if (!query) return true;
    const searchableFields = [record.title, record.city, record.state, record.zip, record.apn, record.mlsNumber]
      .filter((value) => value && value !== "Not provided");
    const haystack = searchableFields.join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase());
  }
  function describeFilters(filters) {
    const labels = [];
    const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
    if (filters.query) labels.push(`Search: ${filters.query}`);
    if (filters.type) labels.push(filters.type);
    if (filters.priceMin) labels.push(`Min ${money(filters.priceMin)}`);
    if (filters.priceMax) labels.push(`Max ${money(filters.priceMax)}`);
    if (filters.acresMin) labels.push(`${filters.acresMin}+ acres`);
    if (filters.acresMax) labels.push(`Up to ${filters.acresMax} acres`);
    if (filters.feature === "mountain-views") labels.push("Mountain views");
    if (filters.feature === "surrounded-by-homes") labels.push("Surrounded by homes");
    if (filters.state && filters.state.toLowerCase() !== "arizona") labels.push(filters.state);
    if (filters.city) labels.push(filters.city);
    if (filters.zip) labels.push(`ZIP ${filters.zip}`);
    return labels;
  }
  function getFilteredRecords() {
    const f = readFilters();
    let filtered = records.filter((p) => {
      if (!includesText(p, f.query)) return false;
      if (f.type && String(p.propertyType || "").toLowerCase() !== f.type.toLowerCase()) return false;
      if (f.priceMin && Number(p.price) < Number(f.priceMin)) return false;
      if (f.priceMax && Number(p.price) > Number(f.priceMax)) return false;
      if (f.acresMin && Number(p.acres) < Number(f.acresMin)) return false;
      if (f.acresMax && Number(p.acres) > Number(f.acresMax)) return false;
      const features = Array.isArray(p.features) ? p.features : [];
      if (f.feature === "mountain-views" && !features.some((x) => x.toLowerCase().includes("mountain"))) return false;
      if (f.feature === "surrounded-by-homes" && !features.some((x) => x.toLowerCase().includes("surrounded"))) return false;
      if (f.state && p.state.toLowerCase() !== f.state.toLowerCase() && p.stateCode.toLowerCase() !== f.state.toLowerCase()) return false;
      if (f.city && p.city.toLowerCase() !== f.city.toLowerCase()) return false;
      if (f.zip && p.zip !== f.zip) return false;
      return true;
    });
    if (sort?.value === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sort?.value === "price-high") filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }
  function makeEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function currency(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
  }
  function createCard(property) {
    const article = makeEl("article", "property-card");
    const imageLink = makeEl("a", "property-card__image-link");
    imageLink.href = `property-detail.html?id=${encodeURIComponent(property.id)}`;
    imageLink.setAttribute("aria-label", `View ${property.title}`);
    const img = makeEl("img", "property-card__image");
    img.src = property.images?.[0] || "assets/images/desert-landscape-placeholder.jpg";
    img.alt = property.imageAlt || "Property image placeholder.";
    img.loading = "lazy";
    imageLink.append(img);
    const badge = makeEl("span", "status-badge", property.status);
    imageLink.append(badge);
    article.append(imageLink);

    const body = makeEl("div", "property-card__body");
    const title = makeEl("h3", "property-card__title");
    const titleLink = makeEl("a", "", property.title);
    titleLink.href = imageLink.href;
    title.append(titleLink);
    body.append(title);
    const location = makeEl("p", "property-card__location", `⌖ ${property.city}, ${property.stateCode} ${property.zip}`);
    body.append(location);
    const facts = makeEl("div", "property-card__facts");
    facts.append(makeEl("span", "", `${property.acres.toFixed(2)} acre${property.acres === 1 ? "" : "s"}`));
    facts.append(makeEl("span", "", property.propertyType));
    body.append(facts);
    const bottom = makeEl("div", "property-card__bottom");
    bottom.append(makeEl("strong", "property-price", currency(property.price)));
    const link = makeEl("a", "button button--small", "View Details →");
    link.href = imageLink.href;
    bottom.append(link);
    body.append(bottom);
    article.append(body);
    return article;
  }
  function render() {
    const filtered = getFilteredRecords();
    const filters = readFilters();
    const filterLabels = describeFilters(filters);
    grid.replaceChildren();
    filtered.forEach((p) => grid.append(createCard(p)));
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "property" : "properties"} found`;
    activeTags.replaceChildren(...filterLabels.map((label) => makeEl("span", "active-filter-tag", label)));
    activeTags.hidden = filterLabels.length === 0;
    if (!filtered.length && emptyDetails) {
      emptyDetails.textContent = filterLabels.length
        ? `No listing matches ${filterLabels.join(" · ")}. Try raising the maximum price or widening another filter.`
        : "No properties are currently available. Please check back soon.";
    }
    empty.hidden = filtered.length > 0;
    status.textContent = `${filtered.length} ${filtered.length === 1 ? "property matches" : "properties match"} the current filters.`;
  }
  function updateQueryString() {
    const params = new URLSearchParams();
    Object.entries(readFilters()).forEach(([key, value]) => { if (value) params.set(key, value); });
    if (sort && sort.value !== "price-high") params.set("sort", sort.value);
    const query = params.toString();
    history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const f = readFilters();
    if ((f.priceMin && f.priceMax && Number(f.priceMin) > Number(f.priceMax)) ||
        (f.acresMin && f.acresMax && Number(f.acresMin) > Number(f.acresMax))) {
      status.textContent = "Minimum values must be less than or equal to maximum values.";
      status.setAttribute("role", "alert");
      return;
    }
    status.removeAttribute("role");
    updateQueryString();
    render();
  });
  form.addEventListener("input", () => { status.removeAttribute("role"); });
  sort?.addEventListener("change", () => { updateQueryString(); render(); });
  document.getElementById("clear-empty-filters")?.addEventListener("click", () => { document.getElementById("clear-property-filters")?.click(); });
  document.getElementById("clear-property-filters")?.addEventListener("click", () => {
    form.reset();
    form.elements.state.value = "Arizona";
    if (sort) sort.value = "price-high";
    history.replaceState(null, "", window.location.pathname);
    render();
  });
  filterToggle?.addEventListener("click", () => {
    const open = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.setAttribute("aria-expanded", String(!open));
    filterPanel.classList.toggle("is-open", !open);
  });
  populateCityFilter();
  setFiltersFromURL();
  const initialSort = new URLSearchParams(window.location.search).get("sort");
  if (initialSort && sort) sort.value = initialSort;
  render();
  const initialParams = new URLSearchParams(window.location.search);
  if (fields.some((field) => initialParams.has(field))) {
    requestAnimationFrame(() => document.getElementById("results-heading")?.scrollIntoView({ block: "start" }));
  }
}());
