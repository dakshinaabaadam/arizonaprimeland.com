(function () {
  "use strict";
  const form = document.getElementById("home-property-search");
  if (!form) return;
  const featuredHost = document.getElementById("home-featured-listing");

  function makeEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
  }
  function wireCarousel(track, previousId, nextId, cardWidth) {
    const scroll = (direction) => track.scrollBy({ left: direction * Math.max(cardWidth, track.clientWidth * 0.8), behavior: "smooth" });
    document.getElementById(previousId)?.addEventListener("click", () => scroll(-1));
    document.getElementById(nextId)?.addEventListener("click", () => scroll(1));
  }
  function renderFeaturedListings() {
    if (!featuredHost) return;
    const properties = [...(window.APL_PROPERTIES || [])].sort((a, b) => a.price - b.price);
    if (!properties.length) {
      featuredHost.append(makeEl("p", "muted", "No properties are available yet."));
      return;
    }
    const cards = properties.map((property) => {
      const url = `property-detail.html?id=${encodeURIComponent(property.id)}`;
      const card = makeEl("article", "property-card property-card--featured");
      const mediaLink = makeEl("a", "property-card__image-link");
      mediaLink.href = url;
      mediaLink.setAttribute("aria-label", `View ${property.title} details`);
      const img = makeEl("img", "property-card__image");
      img.src = property.images?.[0] || "assets/images/desert-landscape-placeholder.jpg";
      img.alt = property.imageAlt || "Property image placeholder.";
      img.loading = "lazy";
      mediaLink.append(img, makeEl("span", "status-badge", property.status));
      card.append(mediaLink);
      const body = makeEl("div", "property-card__body");
      const heading = makeEl("h3", "property-card__title");
      const headingLink = makeEl("a", "", property.title);
      headingLink.href = url;
      heading.append(headingLink);
      body.append(heading, makeEl("p", "property-card__location", `⌖ ${property.city}, ${property.stateCode} ${property.zip}`));
      const facts = makeEl("div", "property-card__facts");
      facts.append(makeEl("span", "", `${property.acres.toFixed(2)} acre${property.acres === 1 ? "" : "s"}`), makeEl("span", "", property.propertyType));
      body.append(facts);
      const bottom = makeEl("div", "property-card__bottom");
      bottom.append(makeEl("strong", "property-price", formatMoney(property.price)));
      const detailsLink = makeEl("a", "button button--small", "View Details →");
      detailsLink.href = url;
      bottom.append(detailsLink);
      body.append(bottom);
      card.append(body);
      return card;
    });
    featuredHost.replaceChildren(...cards);
    wireCarousel(featuredHost, "deals-carousel-previous", "deals-carousel-next", 370);
  }
  renderFeaturedListings();

  function renderSampleReviews() {
    const host = document.getElementById("home-review-carousel");
    if (!host) return;
    const reviews = [
      ["Jordan M.", "Finding the right starting point", "I started by narrowing the search to a price range and a manageable lot size. Being able to compare several Arizona locations in one place helped me understand what kinds of options were available before I spent time following up. The property cards made it easy to spot the details I wanted to ask about."],
      ["Riley T.", "A clearer way to compare locations", "I wanted a broad overview before deciding where to focus. Browsing the city cards first gave me a quick sense of the different areas, and I could move straight from a city into its matching listings. I also appreciated having acreage and asking price visible together, so I could make a shortlist and come back to the details later."],
      ["Casey R.", "Useful details at a glance", "When looking at land, I usually have a list of basic questions about size, location, and price. The listing cards put those basics up front, and the detail page gives me a place to review the rest of the information. It made the browsing process feel organized and helped me know what I still needed to verify."],
      ["Avery K.", "Easy to explore on my own", "I was able to browse at my own pace without having to guess which listings matched the location I had in mind. The filters and city links made it simple to change direction, compare a few options, and open a property when I wanted more information. I would use the same approach again when researching another area."],
      ["Morgan S.", "A helpful first step in land research", "The site gave me a practical starting point for exploring land opportunities around Arizona. I could scan the catalog, check the lot sizes and prices, and then decide which property details needed a closer look. That kind of overview is helpful when you are still learning what questions to ask before moving forward."],
      ["Taylor D.", "Simple to build a shortlist", "I was comparing properties across a few different cities and wanted to keep the process straightforward. Filtering the catalog helped me narrow down the options, while the cards kept the key facts easy to scan. Once I found a few possibilities, opening the full listing pages gave me a better checklist for my follow-up research."],
      ["Cameron P.", "Good overview of the available options", "I liked being able to see the inventory as a group instead of opening listings one at a time. Location, acreage, and price gave me a useful basis for comparison, and the links made it easy to dig further into a property that caught my attention. It is a convenient way to begin researching land in a new area."],
      ["Jamie L.", "A more organized search", "The combination of city browsing and property filters made it easier to approach my search in stages. First I explored areas, then compared the lots that fit the size and budget I had in mind. Having the property details one click away helped me keep track of what I would want to confirm directly before making any decisions."]
    ];
    host.replaceChildren(...reviews.map(([name, title, quote]) => {
      const card = makeEl("article", "review-card");
      const top = makeEl("div", "review-card__top");
      top.append(makeEl("span", "review-card__stars", "★★★★★"), makeEl("span", "review-card__sample", "SAMPLE"));
      card.append(top, makeEl("h3", "review-card__title", title), makeEl("p", "review-card__copy", `“${quote}”`));
      const person = makeEl("div", "review-card__person");
      const initials = name.split(" ").map((part) => part[0]).join("");
      person.append(makeEl("span", "review-card__avatar", initials), makeEl("span", "review-card__name", name));
      card.append(person);
      return card;
    }));
    wireCarousel(host, "reviews-carousel-previous", "reviews-carousel-next", 470);
  }
  renderSampleReviews();

  function catalogCities() {
    const counts = new Map();
    (window.APL_PROPERTIES || []).forEach((property) => {
      if (!property.city) return;
      counts.set(property.city, (counts.get(property.city) || 0) + 1);
    });
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }
  function renderAvailableCities() {
    const cities = catalogCities();
    const select = document.getElementById("home-city");
    const grid = document.getElementById("home-city-grid");
    if (select) {
      cities.forEach(([city]) => select.add(new Option(city, city)));
    }
    if (!grid) return;
    const cityImages = {
      "Buckeye": "assets/images/city-buckeye-generated.png",
      "Flagstaff": "assets/images/city-flagstaff-generated.png",
      "Phoenix": "assets/images/city-phoenix-generated.png",
      "Prescott": "assets/images/city-prescott-generated.png",
      "Sierra Vista": "assets/images/city-sierra-vista-generated.png",
      "Tonopah": "assets/images/city-tonopah-generated.png",
      "Tucson": "assets/images/city-tucson-generated.png",
      "Yuma": "assets/images/city-yuma-generated.png"
    };
    cities.forEach(([city, count]) => {
      const card = makeEl("a", "city-card");
      card.href = `prime-properties.html?city=${encodeURIComponent(city)}`;
      card.setAttribute("aria-label", `Browse ${count} ${count === 1 ? "property" : "properties"} in ${city}`);
      const image = document.createElement("img");
      image.src = cityImages[city] || "assets/images/desert-landscape-placeholder.jpg";
      image.alt = `Illustrative high-resolution Arizona landscape for ${city}`;
      image.loading = "lazy";
      card.append(image, makeEl("span", "", city), makeEl("small", "", `${count} ${count === 1 ? "property" : "properties"} available →`));
      grid.append(card);
    });
    if (!cities.length) grid.append(makeEl("p", "muted", "No cities are available in the catalog yet."));
    const previous = document.getElementById("city-carousel-previous");
    const next = document.getElementById("city-carousel-next");
    const scrollCities = (direction) => grid.scrollBy({ left: direction * Math.max(320, grid.clientWidth * 0.78), behavior: "smooth" });
    previous?.addEventListener("click", () => scrollCities(-1));
    next?.addEventListener("click", () => scrollCities(1));
  }
  renderAvailableCities();

  document.querySelectorAll(".process-flow .step-card").forEach((card) => {
    const activate = () => {
      document.querySelectorAll(".process-flow .step-card").forEach((step) => {
        const selected = step === card;
        step.classList.toggle("is-active", selected);
        step.setAttribute("aria-pressed", String(selected));
      });
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  function queryFromForm() {
    const data = new FormData(form);
    const params = new URLSearchParams();
    const mapping = {
      query: "query", type: "type", priceMin: "priceMin", priceMax: "priceMax",
      acresMin: "acresMin", acresMax: "acresMax", feature: "feature", state: "state",
      city: "city", zip: "zip"
    };
    Object.entries(mapping).forEach(([key, field]) => {
      const value = String(data.get(key) || "").trim();
      if (value && !(key === "state" && value === "Arizona")) params.set(field, value);
    });
    return params;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const minPrice = form.elements.priceMin.value;
    const maxPrice = form.elements.priceMax.value;
    const minAcres = form.elements.acresMin.value;
    const maxAcres = form.elements.acresMax.value;
    const status = document.getElementById("home-search-status");
    if ((minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) ||
        (minAcres && maxAcres && Number(minAcres) > Number(maxAcres))) {
      status.textContent = "Each minimum must be less than or equal to its maximum.";
      status.hidden = false;
      return;
    }
    const params = queryFromForm();
    window.location.href = "prime-properties.html" + (params.toString() ? "?" + params.toString() : "");
  });
}());
