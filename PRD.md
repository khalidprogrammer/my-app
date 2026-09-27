# PRD.md — Dynamic Import & Export Trading Website

## 1. Product Overview

### Product Name
Dynamic Import & Export Trading Website

### Product Type
B2B corporate trading, import/export, product catalog, service platform, and quotation management system.

### Purpose
Build a professional, multilingual-ready, SEO-friendly website for a trading company whose business scope includes import/export, agency services, wholesale and retail trading, machinery and equipment, auto parts, electronics, building materials, technology services, supply-chain services, freight forwarding, consulting, marketing, translation, and online sales.

The public website should present the company professionally, allow visitors to discover products and services, and allow prospective customers to submit quotation and business inquiries. An authenticated admin dashboard will manage products, categories, services, content, inquiries, media, and website settings.

---

## 2. Business Scope

The website must represent the following business activities:

### Trading
- Import and export of goods
- Import and export of technology
- Import/export agency services
- Domestic trade agency services
- Wholesale of auto parts
- Retail of auto parts
- Wholesale of hardware products
- Sales of machinery and equipment
- Sales of electronic products
- Sales of building materials
- Sales of plastic products
- Sales of machinery parts and components
- Sales of office supplies
- Sales of daily necessities
- Sales of mechanical and electrical equipment
- Sales of power facility equipment and materials
- Online sales excluding goods requiring licenses
- Online sales of prepackaged food

### Technology
- Technical services
- Technology development
- Technical consultation
- Technical exchange
- Technology transfer
- Technology promotion
- Information technology consulting

### Logistics and Supply Chain
- Supply chain management
- Domestic freight forwarding agency services
- Loading and unloading

### Professional Services
- Translation services
- Marketing planning
- Advertising design and agency services
- Personal internet live-streaming services

---

## 3. Goals

1. Establish a professional international trading company presence.
2. Create a searchable product catalog.
3. Generate B2B leads through quotation requests.
4. Clearly communicate the company's business categories and services.
5. Allow administrators to manage website content without changing source code.
6. Build SEO-friendly product, category, service, and article pages.
7. Provide a scalable foundation for future customer accounts and online ordering.
8. Make the website responsive across desktop, tablet, and mobile.
9. Keep product and inquiry workflows simple for staff.

---

## 4. Target Users

### Public Users
- Importers
- Exporters
- Wholesale buyers
- Retail customers
- Distributors
- Procurement officers
- Businesses seeking machinery/equipment
- Technology-service customers
- Logistics/supply-chain partners

### Administrators
- Super Admin
- Content Manager
- Product Manager
- Sales/Business Development
- Inquiry Manager

---

## 5. MVP Features

### 5.1 Homepage
- Hero section
- Company introduction
- Business categories
- Featured products
- Core services
- Global trade/market section
- Company statistics
- Why choose us
- Latest news/articles
- CTA: Request a Quote
- Contact section
- Footer

### 5.2 About
- Company overview
- Mission and vision
- Business scope
- Company advantages
- Geographic/business coverage
- Certifications or licenses where applicable

### 5.3 Product Catalog
- Product categories
- Product listing
- Search
- Category filtering
- Pagination
- Featured products
- Product detail pages
- Product specifications
- Product images/gallery
- Related products
- Request Quote button

### 5.4 Services
Each service has:
- Title
- Slug
- Description
- Image
- Benefits
- Process
- CTA

Core service pages:
- Import & Export
- Import & Export Agency
- Domestic Trade Agency
- Supply Chain Management
- Freight Forwarding
- Technology Services
- IT Consulting
- Translation
- Marketing & Advertising
- Loading & Unloading

### 5.5 Markets
- Countries/regions served
- Import markets
- Export markets
- Market descriptions
- Optional map

### 5.6 Quote Request
Visitors can submit:
- Product
- Quantity
- Unit
- Destination country
- Destination city/port
- Name
- Company
- Email
- Phone
- Message
- Attachment

Inquiry statuses:
- New
- Contacted
- Quotation Sent
- Negotiation
- Confirmed
- Completed
- Rejected
- Archived

### 5.7 Contact
- Contact form
- Company address
- Phone
- Email
- Business hours
- Map
- Social links

### 5.8 News / Articles
- Articles
- Categories
- Featured article
- Search
- Related articles
- Author
- Publish date
- SEO metadata

### 5.9 Admin Dashboard
- Dashboard statistics
- Product management
- Category management
- Service management
- Market management
- Quote management
- Contact messages
- News management
- Media management
- Homepage content
- Website settings
- Admin users and roles

---

## 6. Product Management

Product fields:
- Name
- Slug
- SKU
- Category
- Short description
- Full description
- Main image
- Gallery
- Specifications
- Brand
- Model
- Origin
- Applications
- Packaging
- MOQ
- Unit
- Featured
- Status
- SEO title
- SEO description
- SEO keywords
- Created at
- Updated at

Product status:
- Draft
- Published
- Archived

---

## 7. Category Management

Categories must be dynamic.

Initial categories:

1. Auto Parts
2. Hardware Products
3. Machinery & Equipment
4. Machinery Parts & Components
5. Electronic Products
6. Building Materials
7. Plastic Products
8. Office Supplies
9. Daily Necessities
10. Mechanical & Electrical Equipment
11. Power Facility Equipment & Materials
12. Prepackaged Food
13. Technology Services

Admin can add, edit, reorder, activate/deactivate, and delete categories where safe.

---

## 8. SEO Requirements

Every indexable page should support:
- SEO title
- Meta description
- Canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Slug
- Structured data where applicable

Generate:
- sitemap.xml
- robots.txt
- Open Graph metadata
- Product structured data
- Organization structured data
- Breadcrumb structured data

---

## 9. Non-Functional Requirements

### Performance
- Server-side rendering where appropriate
- Optimized images
- Lazy loading
- Minimal JavaScript
- Pagination
- Database indexes
- Caching for public content

### Security
- Authentication
- Authorization/RBAC
- CSRF protection where applicable
- Input validation
- File upload validation
- Rate limiting on public forms
- Secure password storage
- Audit logging for important admin actions

### Accessibility
- Semantic HTML
- Keyboard navigation
- Accessible forms
- Sufficient contrast
- Alt text for images
- Visible focus states

### Responsive Design
Support:
- Mobile
- Tablet
- Laptop
- Large desktop

---

## 10. Future Features

Not required for MVP:
- Customer accounts
- Online ordering
- Payment gateway
- Real-time shipment tracking
- Supplier portal
- Customer portal
- Multi-language CMS
- Currency conversion
- Product comparison
- Live chat
- CRM integration
- ERP integration
- Warehouse integration
- Advanced analytics

---

## 11. Success Metrics

- Number of quote requests
- Contact form submissions
- Product page visits
- Organic search traffic
- Top landing pages
- Conversion rate from product pages to quote requests
- Admin response time to inquiries
