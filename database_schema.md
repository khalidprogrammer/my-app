# database_schema.md — Database Schema

## 1. Database

Recommended:
- PostgreSQL

MySQL is also supported if it is preferred by the deployment environment.

Use:
- UUID or CUID primary keys
- Foreign keys
- Timestamps
- Indexes on slugs/status/search fields
- Soft deletion where business data should be retained

---

## 2. Entity Relationship Overview

```text
users
  |
  +---- roles

categories
  |
  +---- products
          |
          +---- product_images
          |
          +---- product_specifications

services

markets

quotes
  |
  +---- quote_items
          |
          +---- products

news_categories
  |
  +---- news_articles

media

contact_messages

site_settings
```

---

## 3. users

```text
users
-----
id                 PK
name               varchar
email              varchar UNIQUE
password_hash      varchar
status             enum(active,inactive)
last_login_at      datetime nullable
created_at         datetime
updated_at         datetime
```

Indexes:
- email
- status

---

## 4. roles

```text
roles
-----
id                 PK
name               varchar UNIQUE
description        text nullable
created_at         datetime
updated_at         datetime
```

---

## 5. user_roles

```text
user_roles
----------
user_id            FK -> users.id
role_id            FK -> roles.id
PRIMARY KEY(user_id, role_id)
```

---

## 6. permissions

```text
permissions
-----------
id                 PK
name               varchar UNIQUE
description        text nullable
created_at         datetime
updated_at         datetime
```

Example:
```text
products.view
products.create
products.update
products.delete
quotes.view
quotes.update
services.manage
news.manage
settings.manage
users.manage
```

---

## 7. role_permissions

```text
role_permissions
----------------
role_id            FK -> roles.id
permission_id      FK -> permissions.id
PRIMARY KEY(role_id, permission_id)
```

---

## 8. categories

```text
categories
----------
id                 PK
parent_id          FK -> categories.id nullable
name               varchar
slug               varchar UNIQUE
description        text nullable
image_id           FK -> media.id nullable
sort_order         integer DEFAULT 0
status             enum(active,inactive)
seo_title          varchar nullable
seo_description    text nullable
created_at         datetime
updated_at         datetime
deleted_at         datetime nullable
```

Self-referencing parent_id allows future subcategories.

---

## 9. products

```text
products
--------
id                 PK
category_id        FK -> categories.id
name               varchar
slug               varchar UNIQUE
sku                varchar UNIQUE nullable
short_description  text nullable
description        text nullable
brand              varchar nullable
model              varchar nullable
origin             varchar nullable
applications       text nullable
packaging          varchar nullable
moq                decimal nullable
unit               varchar nullable
featured           boolean DEFAULT false
status             enum(draft,published,archived)
seo_title          varchar nullable
seo_description    text nullable
created_by         FK -> users.id nullable
updated_by         FK -> users.id nullable
created_at         datetime
updated_at         datetime
deleted_at         datetime nullable
```

Indexes:
- category_id
- status
- featured
- slug
- sku

---

## 10. product_images

```text
product_images
--------------
id                 PK
product_id         FK -> products.id
media_id           FK -> media.id
sort_order         integer DEFAULT 0
is_primary         boolean DEFAULT false
created_at         datetime
```

---

## 11. product_specifications

```text
product_specifications
----------------------
id                 PK
product_id         FK -> products.id
name               varchar
value              text
sort_order         integer DEFAULT 0
created_at         datetime
updated_at         datetime
```

This flexible structure allows different product categories to have different specifications.

---

## 12. services

```text
services
--------
id                 PK
name               varchar
slug               varchar UNIQUE
short_description  text nullable
description        text nullable
image_id           FK -> media.id nullable
sort_order         integer DEFAULT 0
status             enum(draft,published,archived)
seo_title          varchar nullable
seo_description    text nullable
created_at         datetime
updated_at         datetime
deleted_at         datetime nullable
```

---

## 13. markets

```text
markets
-------
id                 PK
name               varchar
slug               varchar UNIQUE
country_code       varchar nullable
type               enum(import,export,both)
description        text nullable
image_id           FK -> media.id nullable
status             enum(active,inactive)
sort_order         integer DEFAULT 0
created_at         datetime
updated_at         datetime
```

---

## 14. quotes

```text
quotes
------
id                 PK
reference_no       varchar UNIQUE
customer_name      varchar
company_name       varchar nullable
email              varchar
phone              varchar nullable
country            varchar nullable
city               varchar nullable
destination        varchar nullable
message            text nullable
attachment_id      FK -> media.id nullable
status             enum(
                     new,
                     contacted,
                     quotation_sent,
                     negotiation,
                     confirmed,
                     completed,
                     rejected,
                     archived
                   )
assigned_to        FK -> users.id nullable
created_at         datetime
updated_at         datetime
```

Indexes:
- reference_no
- status
- email
- assigned_to
- created_at

---

## 15. quote_items

```text
quote_items
-----------
id                 PK
quote_id           FK -> quotes.id
product_id         FK -> products.id nullable
product_name       varchar
quantity           decimal
unit               varchar nullable
notes              text nullable
created_at         datetime
updated_at         datetime
```

Store product_name as a snapshot so historical inquiries remain understandable even if a product is renamed.

---

## 16. quote_status_history

```text
quote_status_history
--------------------
id                 PK
quote_id           FK -> quotes.id
old_status         varchar nullable
new_status         varchar
changed_by         FK -> users.id nullable
note               text nullable
created_at         datetime
```

---

## 17. news_categories

```text
news_categories
---------------
id                 PK
name               varchar
slug               varchar UNIQUE
created_at         datetime
updated_at         datetime
```

---

## 18. news_articles

```text
news_articles
-------------
id                 PK
category_id        FK -> news_categories.id nullable
title              varchar
slug               varchar UNIQUE
excerpt            text nullable
content            text
featured_image_id  FK -> media.id nullable
author_id          FK -> users.id nullable
status             enum(draft,published,archived)
published_at       datetime nullable
seo_title          varchar nullable
seo_description    text nullable
created_at         datetime
updated_at         datetime
deleted_at         datetime nullable
```

Indexes:
- slug
- status
- published_at
- category_id

---

## 19. media

```text
media
-----
id                 PK
file_name          varchar
storage_key        varchar
url                text
mime_type          varchar
file_size          bigint
width              integer nullable
height             integer nullable
alt_text           varchar nullable
uploaded_by        FK -> users.id nullable
created_at         datetime
updated_at         datetime
```

---

## 20. contact_messages

```text
contact_messages
----------------
id                 PK
name               varchar
company_name       varchar nullable
email              varchar
phone              varchar nullable
subject            varchar nullable
message            text
status             enum(new,read,replied,archived)
assigned_to        FK -> users.id nullable
created_at         datetime
updated_at         datetime
```

---

## 21. site_settings

```text
site_settings
-------------
id                 PK
key                varchar UNIQUE
value              text nullable
type               enum(string,text,number,boolean,json)
updated_by         FK -> users.id nullable
created_at         datetime
updated_at         datetime
```

Example keys:

```text
site_name
site_logo
site_favicon
company_email
company_phone
company_address
company_description
facebook_url
linkedin_url
instagram_url
whatsapp_number
default_seo_title
default_seo_description
```

---

## 22. homepage_sections

```text
homepage_sections
-----------------
id                 PK
section_key        varchar UNIQUE
title              varchar nullable
subtitle           text nullable
content            text nullable
image_id           FK -> media.id nullable
settings_json      json nullable
sort_order         integer DEFAULT 0
status             enum(active,inactive)
created_at         datetime
updated_at         datetime
```

Possible sections:

```text
hero
business_categories
featured_products
services
markets
statistics
why_choose_us
news
cta
```

---

## 23. audit_logs

```text
audit_logs
----------
id                 PK
user_id            FK -> users.id nullable
action             varchar
entity_type        varchar
entity_id          varchar nullable
old_values         json nullable
new_values         json nullable
ip_address         varchar nullable
user_agent         text nullable
created_at         datetime
```

Use this for important admin operations.

---

## 24. Key Relationships

```text
Category 1 ---- N Products

Product 1 ---- N ProductImages

Product 1 ---- N ProductSpecifications

Quote 1 ---- N QuoteItems

Product 1 ---- N QuoteItems

Quote 1 ---- N QuoteStatusHistory

NewsCategory 1 ---- N NewsArticles

User N ---- N Role

Role N ---- N Permission

User 1 ---- N AuditLogs
```

---

## 25. Recommended Constraints

- Product slug must be unique.
- Category slug must be unique.
- Service slug must be unique.
- Market slug must be unique.
- Article slug must be unique.
- Quote reference number must be unique.
- Product SKU should be unique when provided.
- Deleting a category with products should be blocked or require reassignment.
- Deleting a product referenced by historical quote items should be prevented; archive instead.
- Media records referenced by content should not be physically deleted without checking references.

---

## 26. Initial Seed Data

Seed these categories:

```text
Auto Parts
Hardware Products
Machinery & Equipment
Machinery Parts & Components
Electronic Products
Building Materials
Plastic Products
Office Supplies
Daily Necessities
Mechanical & Electrical Equipment
Power Facility Equipment & Materials
Prepackaged Food
```

Seed these services:

```text
Import & Export
Import & Export Agency
Domestic Trade Agency
Supply Chain Management
Freight Forwarding
Loading & Unloading
Technical Services
Technology Development
Technology Consultation
Technology Transfer
Technology Promotion
Information Technology Consulting
Translation Services
Marketing Planning
Advertising Design & Agency
```

Seed roles:

```text
SUPER_ADMIN
CONTENT_MANAGER
PRODUCT_MANAGER
SALES_MANAGER
INQUIRY_MANAGER
```
