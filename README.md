# ArizonaPrimeLand.com — Frontend Website

A multi-page, responsive frontend built using **plain HTML5, CSS3, and vanilla JavaScript (ES6+)**. No frameworks, package manager, build step, CSS libraries, or external runtime dependencies are used.

## Pages

- `index.html` — Homepage hero and search, documented featured listing, cities, how-to steps, reviews placeholder, and seller CTA.
- `sell-your-land.html` — Seller lead form, client-side validation, local demo success state, benefits, and three-step process.
- `prime-properties.html` — Filterable property listing, sorting, query-string hydration, clear filters, result count, and empty state. Displays all 16 records from the provided Just Land extraction.
- `property-detail.html?id=montebello-lot-e` — Listing details, gallery controls, available agent contact links, location/search panel, and inquiry helper; this original property URL remains valid.
- `login-register.html` — Login and registration tabs, password show/hide, Forgot Password state, demo session state, and logout.

## Run locally

1. Extract the project ZIP to a folder.
2. Open `index.html` in a current desktop browser.
3. For an optional local HTTP server, run `python -m http.server 8000` from the project folder, then visit `http://localhost:8000`.

No npm install is needed. Standard links navigate between the HTML files; `URLSearchParams` preserves search state between the home page and the listing page.

## Source-of-truth rules

`js/data.js` contains all 16 Just Land records with each live detail page's available listing fields, agent contact, remarks, cross street, identifiers, and gallery. The source pages list Jawahar Dodani (`joe@dodaniproperties.com`, `4802007127`) as the contact agent. Each listing image is stored locally under `assets/images/properties/`; the prime properties card uses the first photo and its detail page offers the complete captured gallery. Verify current details with Just Land before use in a transaction:

- Just Land's detail pages show listings as Active. Some pages leave the remarks blank; those panels are hidden rather than filled with invented copy.
- The Lot E remarks describe a 5-acre tract split into five lots while the listing itself is 1 acre; confirm that the remarks apply to that specific lot.
- The 39500 W Indian School listing shows 20 acres in the listing data while the remarks refer to 155 acres; confirm the scope with the agent.
- The 37400 W Hayes detail page displays $0.00 per acre. The site calculates $40,441.18 using its $55,000 price and 1.36-acre size.
- Verify current price and availability, parcel boundaries, access, zoning, agent details, and imagery directly with Just Land before publication or transaction use.
- Confirm current price and availability, parcel boundaries, access, zoning, agent details, and actual imagery directly with the source before publication or transaction use.
- The logo is an image extracted from the original brief. Replace it with the approved transparent production logo when available.
- City tiles and several supporting landscape images are crops from generated design mockups and are **visual placeholders only**, not genuine property photographs or claims of city inventory. Replace them with licensed/owner-approved image assets.
- Reviews are intentionally not fabricated. Add only real, permissioned testimonials.
- The company phone number shown in the original reference needs owner confirmation and is not displayed as a company contact on the site.
- The footer's legal links are intentionally not written as unsupported policy pages. Add approved Terms and Privacy documents before production.

## Interactive behavior

### Property search and listings

- Search fields cover name/MLS, type, min/max price, min/max acreage, features, state, city, and ZIP.
- Filters apply to the local in-memory record array and update the count and empty state.
- Search state is stored in the URL with `URLSearchParams`; results can be sorted by high or low price.
- `View Details` routes to `property-detail.html?id=<property-id>` rather than relying on card position.
- All 16 Just Land listings are available in the local catalog; filters and city links use this shared data. The listing cards use the first source photo, and detail pages expose the remaining photos when present.

### Sell Your Land form

- Required fields: name, phone, email, location, acreage, and land type. Additional details are optional.
- Client-side validation checks name length, email validity, a 10-digit US phone number, non-empty location/type, and positive acreage.
- A valid demo submission resets the form and displays: `Thank you for submitting your land details! Our team will contact you soon.`
- **No email or backend request is made** by this demo handler. Configure an approved HTTPS endpoint or form service before treating submissions as received by the company.

### Login/Register

- Login, Register, Forgot Password, show/hide password, demo sign-in, and Logout are interactive.
- Demo auth state uses `sessionStorage` for the email and non-sensitive flags only. No password or real authentication token is stored.
- Any syntactically valid email and non-empty password can simulate login. Registration also simulates successful account creation after validating the inputs and matching passwords.
- Forgot Password displays the neutral required confirmation text but sends no email.
- **This is not secure authentication and must not be deployed as a production account system.** Connect an approved backend/auth provider using HTTPS, server-side validation, rate limiting, secure cookie/session controls, and real password recovery.

### Email / contact

- Company email links open a Gmail compose draft addressed to `joe@arizonaprimeland.com`; a `mailto:` fallback is provided.
- Agent email actions open a Gmail compose draft where the extraction supplied an email; otherwise, contact links are omitted.
- The property inquiry form opens a prefilled Gmail draft when an agent email is available, or the Just Land properties page when it is not. It does not send automatically, and no submission is stored.
- The map link opens a broad Google Maps search for Tonopah, Arizona 85354. It does not claim to show verified parcel boundaries or precise directions.

## Files

```text
ArizonaPrimeLand_Website/
  index.html
  sell-your-land.html
  prime-properties.html
  property-detail.html
  login-register.html
  css/
    styles.css
    design-tokens-reference.css
  js/
    data.js
    site.js
    home.js
    sell-your-land.js
    properties.js
    property-detail.js
    auth.js
  assets/
    images/                runtime images and clearly named placeholders
    logo/                  source logo from supplied brief
    design-references/     generated design mockups for comparison only
    source-reference/      source listing screenshots for verification
```

## QA checklist

- [ ] Verify all links and active nav states on desktop and mobile widths.
- [ ] Check mobile menu with keyboard, Enter/Space, and Escape.
- [ ] Test all seller form invalid and success paths.
- [ ] Test each listing filter alone and in combinations, Clear All, sorting, query reload, and no-results state.
- [ ] Test gallery thumbnails, next/previous controls, lightbox close button, Escape, contact links, and unknown property IDs.
- [ ] Test login/register tab switching, password visibility, password mismatch, forgot-password acknowledgment, logged-in nav, and logout.
- [ ] Replace placeholder images and verify the exact property data before publishing.
- [ ] Connect real form delivery and real authentication before production; do not treat demo state or draft email creation as a real submission.
