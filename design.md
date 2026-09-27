# design.md — UI/UX Design System

## 1. Design Direction

Create a premium international B2B trading company website.

Visual characteristics:
- Professional
- Trustworthy
- International
- Clean
- Modern
- Corporate
- Product-focused
- Strong typography
- Generous whitespace
- High-quality industrial/product imagery

Avoid:
- Excessive gradients
- Overly decorative layouts
- Excessive animations
- Crowded product cards
- Unnecessary glassmorphism

---

## 2. Color System

Use a configurable theme.

Recommended base:

```text
Primary:       #0B3A5B
Primary Dark:  #082C44
Secondary:     #D99A2B
Background:    #F7F8FA
Surface:       #FFFFFF
Text:          #17202A
Muted:         #667085
Border:        #E4E7EC
Success:       #16803C
Warning:       #B54708
Danger:        #D92D20
```

The admin should keep the same design language but use a denser dashboard layout.

---

## 3. Typography

Recommended:
- Inter
- Geist
- Manrope

Typography hierarchy:

```text
Hero Heading: 56–72px desktop
H1:           42–52px
H2:           32–40px
H3:           24–30px
Body:         16–18px
Small:        13–14px
```

Mobile typography should scale down responsively.

---

## 4. Header

Desktop:

```text
LOGO
About
Products
Services
Markets
News
Contact
                         [Request a Quote]
```

Requirements:
- Sticky header
- Mobile menu
- Active navigation state
- CTA button
- Optional language switcher

---

## 5. Homepage

### Hero

Large industrial/trading image with readable overlay.

Content:

```text
GLOBAL TRADE.
RELIABLE SUPPLY.

Connecting products, technology and markets
through dependable international trade solutions.

[Explore Products] [Request a Quote]
```

Include trust indicators beneath hero.

---

### Business Categories

Use 6–8 visual cards.

Example:

```text
Auto Parts
Machinery
Electronics
Hardware
Building Materials
Plastic Products
Office Supplies
Industrial Equipment
```

Each card:
- Icon/image
- Category name
- Short description
- Explore link

---

### Featured Products

Product card:

```text
┌─────────────────────┐
│                     │
│      PRODUCT IMAGE  │
│                     │
├─────────────────────┤
│ Product Name        │
│ Category            │
│ Short description   │
│                     │
│ [View Details]      │
└─────────────────────┘
```

Do not display fake prices unless the business actually provides public pricing.

Use:
- Request Quote
- Contact Supplier
instead.

---

## 6. Services Section

Service cards should communicate business capability rather than look like generic SaaS features.

Examples:
- Global Import & Export
- Trade Agency
- Supply Chain Management
- Freight Forwarding
- Technology Services
- IT Consulting

---

## 7. Global Markets

Use:
- World map
- Country/region cards
- Import/export indicators

Example:

```text
Global Markets
We connect suppliers and buyers across
key international markets.
```

Avoid claiming countries or regions that the company does not actually serve.

---

## 8. Product Detail Page

Structure:

```text
Breadcrumb
      ↓
Product Gallery | Product Information
                | Category
                | SKU
                | Specifications
                | Origin
                | Packaging
                | MOQ
                | [Request a Quote]

Description

Specifications

Applications

Related Products

Request Quote CTA
```

---

## 9. Quote Form UX

Keep the form simple.

Step 1:
```text
Product
Quantity
Destination
```

Step 2:
```text
Name
Company
Email
Phone
Message
Attachment
```

Confirmation:

```text
Thank you.
Your quotation request has been received.
Our team will review your request and contact you.
```

---

## 10. Admin Dashboard

Layout:

```text
┌──────────────┬─────────────────────────────┐
│ Sidebar      │ Header                      │
│              ├─────────────────────────────┤
│ Dashboard    │                             │
│ Products     │ KPI Cards                   │
│ Categories   │                             │
│ Services     │ Charts / Activity           │
│ Quotes       │                             │
│ News         │ Recent Quote Requests       │
│ Media        │                             │
│ Settings     │                             │
└──────────────┴─────────────────────────────┘
```

Dashboard KPIs:
- Total Products
- Published Products
- New Quotes
- Pending Quotes
- Contact Messages
- Published Articles

---

## 11. Tables

Admin tables should support:
- Search
- Filters
- Sorting
- Pagination
- Bulk selection
- Status badges
- Row actions

Example:

```text
Product | Category | Status | Updated | Actions
```

---

## 12. Forms

Use:
- Clear labels
- Required indicators
- Inline validation
- Helpful error messages
- Save / Cancel actions
- Confirmation before destructive actions

---

## 13. Responsive Design

Mobile:
- Hamburger navigation
- Single-column cards
- Sticky quote CTA where appropriate
- Touch-friendly controls
- Responsive tables with horizontal scrolling or mobile card view

Tablet:
- 2-column product grids
- Collapsible admin sidebar

Desktop:
- 3–4 column product grids
- Full navigation
- Two-column forms

---

## 14. Motion

Keep motion subtle:
- Fade/slide on section entry
- Card hover
- Button transitions
- Image zoom on product cards

Avoid animation that harms performance or distracts from product information.

---

## 15. Accessibility

Requirements:
- WCAG-conscious contrast
- Keyboard accessible navigation
- Semantic headings
- Alt text
- Accessible form labels
- Focus indicators
- Reduced-motion support

---

## 16. SEO UX

Every public page should have:
- Clear H1
- Breadcrumbs
- Internal links
- Descriptive URLs
- Useful page content
- Related content
- Metadata
- Structured data
