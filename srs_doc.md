# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## 1. Document Information

**System:** Ayurvedic & Wellness E-Commerce Platform  
**Version:** 1.0  
**System Type:** Full-stack transactional D2C e-commerce application  
**Target Market:** India  
**Primary Interfaces:** Customer Web App + Admin Web App + Backend APIs  
**Status:** System Specification

---

# 2. System Overview

The system shall provide a complete e-commerce platform for Ayurvedic, herbal, wellness, nutrition and lifestyle products.

The system shall consist of:

1. Customer storefront
2. Customer account system
3. Product/catalogue service
4. Search system
5. Cart service
6. Checkout service
7. Payment service
8. Order management service
9. Inventory service
10. Batch/expiry service
11. Shipping integration layer
12. Returns/refund service
13. Review service
14. Coupon service
15. Customer support system
16. CMS
17. Analytics system
18. Behaviour tracking system
19. Error monitoring system
20. Audit logging system
21. Admin application
22. Authentication/authorization layer
23. Notification system
24. Reporting layer

---

# 3. High-Level Architecture

Recommended logical architecture:

```text
Customer Web App
        |
        v
API / Application Layer
        |
  +-----+-----+---------+---------+
  |     |     |         |         |
Auth  Catalog Cart   Checkout  Analytics
  |     |     |         |         |
  +-----+-----+---------+---------+
        |
     Database
        |
  +-----+---------+---------+---------+
  |               |                   |
Payment        Shipping           Notifications
Provider       Provider            Providers
```

Admin:

```text
Admin Web App
      |
      v
Authenticated API
      |
+-----+------+-------+-------+
|     |      |       |       |
CMS Orders Inventory Analytics
|     |      |       |       |
+-----+------+-------+-------+
            |
         Database
```

External providers must be abstracted behind service interfaces.

---

# 4. Functional Requirements

## FR-001 Authentication

The system shall provide secure authentication.

### Inputs

- Email
- Password
- Phone/OTP where configured

### Functions

- Register
- Login
- Logout
- Forgot password
- Reset password
- Session management

### Security

Passwords shall never be stored in plaintext.

---

## FR-002 Customer Profile

Authenticated customers shall be able to:

- View profile
- Edit permitted profile information
- Manage phone/email where supported
- Manage notification preferences
- Request account deletion

---

## FR-003 Address Management

Customers shall be able to:

- Add address
- Edit address
- Delete address
- Set default address

Address data shall be validated before checkout.

---

# 5. Product Management

## FR-004 Product Creation

Admins with product permissions shall be able to create products containing:

- Product name
- Slug
- Brand
- Category
- Description
- Short description
- Product status
- Featured flag
- Bestseller flag
- New-arrival flag

---

## FR-005 Product Pricing

Each product/variant shall support:

- MRP
- Selling price
- Discount
- Tax configuration
- Optional cost price

Final checkout pricing shall always be calculated server-side.

---

## FR-006 Product Variants

Variants shall support configurable attributes including:

- Size
- Weight
- Pack size
- Quantity
- Flavour
- Product-specific attributes

Each variant shall have:

- SKU
- Price
- MRP
- Inventory
- Weight
- Dimensions
- Optional barcode

---

## FR-007 Product Information

The system shall support:

- Ingredients
- Key ingredients
- Benefits
- Directions
- Usage instructions
- Warnings
- Precautions
- Storage
- Net quantity
- Manufacturer
- Manufacturer address
- Batch
- Expiry
- License/certification information
- Customer-care information

The system shall not automatically invent medical claims or certifications.

---

# 6. Catalogue

## FR-008 Categories

Admins shall be able to:

- Create category
- Edit category
- Archive category
- Assign products
- Manage ordering
- Manage SEO metadata

---

## FR-009 Product Listing

The system shall provide:

- Pagination or infinite loading
- Filtering
- Sorting
- Product counts
- Responsive layout

---

# 7. Search

## FR-010 Search

Search shall support:

- Product name
- Category
- Ingredients
- Tags
- Partial matches
- Typo tolerance
- Synonyms

Search shall return relevant products based on indexed metadata.

---

## FR-011 Search Analytics

Every relevant search event shall be capable of recording:

- Search term
- Timestamp
- Session
- User where available
- Results count
- Clicked result
- Conversion relationship

No-result searches shall be identifiable.

---

# 8. Cart

## FR-012 Cart Creation

A customer shall be able to create a cart containing:

- Product
- Variant
- Quantity

---

## FR-013 Cart Validation

Before checkout the server shall validate:

- Product availability
- Variant
- Current price
- Current discount
- Inventory
- Coupon validity
- Tax
- Shipping

Client-submitted totals shall never be trusted.

---

# 9. Wishlist

## FR-014 Wishlist

Customers shall be able to:

- Add product
- Remove product
- Move product to cart

Authenticated wishlists shall persist.

---

# 10. Checkout

## FR-015 Checkout

Checkout shall collect:

- Customer information
- Delivery address
- Shipping method
- Coupon
- Payment method

The system shall generate a final server-side order amount.

---

# 11. Payment

## FR-016 Payment Initiation

The backend shall create a payment transaction using the configured provider.

---

## FR-017 Payment Verification

Payment success shall only be accepted after backend verification.

---

## FR-018 Webhook Processing

The system shall:

1. Receive webhook.
2. Validate signature.
3. Validate event ID.
4. Check whether event has already been processed.
5. Process event transactionally.
6. Record webhook result.
7. Return appropriate response.

Duplicate webhooks shall not cause duplicate business operations.

---

## FR-019 Payment Failure

Payment failure shall:

- Update payment state
- Preserve appropriate order state
- Release inventory where applicable
- Allow safe retry

---

## FR-020 Refund

Refund processing shall support:

- Full refund
- Partial refund
- Refund status
- Provider reference
- Failure/retry handling

---

# 12. Order Management

## FR-021 Order Creation

An order shall be created only after successful validation of:

- Customer/cart
- Product
- Price
- Inventory
- Coupon
- Tax
- Payment/order state

Order creation shall be transactional.

---

## FR-022 Order State Machine

Valid states shall include:

```text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURN_APPROVED
RETURN_REJECTED
RETURNED
REFUND_INITIATED
REFUNDED
```

The backend shall prevent invalid state transitions.

---

# 13. Inventory

## FR-023 Inventory Tracking

The system shall maintain:

- Available quantity
- Reserved quantity
- Sold quantity
- Damaged quantity
- Returned quantity

---

## FR-024 Inventory Reservation

During checkout, inventory shall be reserved transactionally.

If the quantity requested exceeds available stock, checkout shall fail safely.

---

## FR-025 Concurrent Checkout

The system shall prevent overselling when multiple users attempt to purchase the same final inventory simultaneously.

---

## FR-026 Inventory Release

Reserved stock shall be released when:

- Payment expires
- Payment fails
- Order is cancelled
- Reservation timeout occurs

---

# 14. Batch Management

## FR-027 Batch

Batch records shall support:

- Batch number
- Manufacturing date
- Expiry date
- Quantity
- MRP
- Supplier

---

## FR-028 FEFO

Where applicable, stock allocation shall prioritize earlier expiry dates.

Expired inventory shall not be sellable.

---

# 15. Shipping

## FR-029 Shipping Interface

The application shall provide an abstraction supporting:

```text
checkServiceability()
getRate()
createShipment()
cancelShipment()
trackShipment()
generateLabel()
```

The implementation shall allow replacement of shipping providers.

---

# 16. Returns

## FR-030 Return Request

Eligible customers shall be able to:

- Select order
- Select product
- Select reason
- Submit return request
- Upload supporting image where supported

---

## FR-031 Return Processing

Admin shall be able to:

- Approve
- Reject
- Request additional information
- Process replacement
- Initiate refund

---

# 17. Reviews

## FR-032 Review Eligibility

The system shall determine review eligibility from order/purchase history.

---

## FR-033 Review Moderation

Reviews shall support:

```text
PENDING
APPROVED
REJECTED
```

"Verified Purchase" shall only be shown when purchase eligibility is confirmed.

---

# 18. Coupons

## FR-034 Coupon Validation

The backend shall validate:

- Coupon existence
- Active status
- Start date
- Expiry
- Minimum order value
- Product/category restrictions
- User usage limit
- Global usage limit
- Maximum discount

---

# 19. Invoicing

## FR-035 Invoice

The system shall generate invoices containing configurable:

- Invoice number
- Date
- Customer information
- Billing address
- Shipping address
- Product
- Quantity
- Price
- Discount
- Tax
- Total

Tax rules/rates shall be configurable and must not be hard-coded without verified business requirements.

---

# 20. Customer Support

## FR-036 Support Tickets

Ticket fields shall include:

- Ticket ID
- Customer
- Order
- Category
- Priority
- Status
- Messages
- Attachments
- Created timestamp
- Updated timestamp
- Assigned staff member

---

# 21. CMS

## FR-037 Homepage CMS

Admins shall manage:

- Hero banners
- Homepage sections
- Featured products
- Promotional content

Banner fields shall include:

- Desktop image
- Mobile image
- Heading
- Subtitle
- CTA
- Destination
- Order
- Status
- Start date
- End date

---

## FR-038 Blog

Blog content shall support:

- Title
- Slug
- Author
- Cover image
- Category
- Rich text
- Related products
- SEO metadata
- Publish date

---

# 22. Analytics

## FR-039 Event Tracking

The system shall provide centralized event tracking.

Example event types:

```text
PAGE_VIEW
PRODUCT_VIEW
SEARCH
SEARCH_RESULT_CLICK
FILTER_USED
SORT_USED
ADD_TO_CART
REMOVE_FROM_CART
WISHLIST_ADD
CHECKOUT_START
COUPON_ATTEMPT
PAYMENT_INITIATED
PAYMENT_FAILED
PAYMENT_SUCCESS
PURCHASE
```

---

## FR-040 Analytics Event Structure

Events should contain, where applicable:

- Event ID
- Event name
- Timestamp
- Anonymous session ID
- User ID
- Page
- Product ID
- Category ID
- Order ID
- Device
- Browser
- Traffic source
- Metadata

Sensitive values must never be recorded.

---

# 23. Behaviour Analytics

## FR-041 Funnel

The system shall calculate:

```text
Visitors
   ↓
Product Views
   ↓
Add To Cart
   ↓
Checkout
   ↓
Payment
   ↓
Purchase
```

It shall calculate:

- Stage users
- Conversion rate
- Drop-off rate

---

## FR-042 Product Analytics

The system shall calculate:

- Views
- Add-to-cart
- Wishlist
- Checkout
- Purchase
- Revenue
- Conversion
- Rating
- Reviews
- Returns
- Refunds

---

## FR-043 Search Analytics

The system shall identify:

- Popular search terms
- No-result searches
- Search click rate
- Search conversion

---

# 24. Optimization Engine

## FR-044 Optimization Insights

The system shall identify patterns including:

- High views/low conversion
- High cart abandonment
- Mobile conversion problems
- Checkout drop-off
- No-result searches
- High wishlist/low purchase
- Payment failure spikes
- Conversion decline

Insights must be generated only from sufficient available data.

---

# 25. Error Logging

## FR-045 Error Log

Each error should support:

- Error ID
- Timestamp
- Severity
- Category
- Message
- Stack trace for authorized users
- Page/endpoint
- HTTP status
- User/session reference
- Order ID
- Product ID
- Browser
- Device
- Environment
- Correlation ID
- First seen
- Last seen
- Occurrence count
- Status

---

## FR-046 Error Severity

Minimum levels:

```text
INFO
WARNING
ERROR
CRITICAL
```

---

## FR-047 Error Status

```text
NEW
INVESTIGATING
RESOLVED
IGNORED
```

---

# 26. Error Spike Detection

The system should compare error activity against historical/normal levels.

It should flag abnormal increases in:

- Payment failures
- Checkout failures
- API failures
- Authentication failures
- Database errors
- Shipping errors

---

# 27. Webhook Logs

## FR-048 Webhook Log

Track:

- Provider
- Event type
- Event ID
- Received timestamp
- Processing status
- Retry count
- Response
- Related payment
- Related order
- Error

---

# 28. API Health

## FR-049 Integration Health

Monitor:

- Payment
- Shipping
- Email
- SMS/WhatsApp
- Storage
- Database
- Internal APIs

Metrics:

- Availability
- Response time
- Failure rate
- Last successful request
- Last failure

---

# 29. RBAC

## FR-050 Roles

Minimum roles:

```text
SUPER_ADMIN
PRODUCT_MANAGER
ORDER_MANAGER
CONTENT_MANAGER
SUPPORT_MANAGER
```

Permissions shall be enforced at API/server level.

---

# 30. Audit Logging

## FR-051 Audit Events

Sensitive administrative actions shall generate audit events.

Example:

```text
PRICE_UPDATED
STOCK_UPDATED
PRODUCT_PUBLISHED
PRODUCT_ARCHIVED
COUPON_CREATED
REFUND_APPROVED
ORDER_STATUS_CHANGED
CUSTOMER_UPDATED
ROLE_UPDATED
```

Audit records should include:

- User
- Action
- Entity
- Entity ID
- Previous value where appropriate
- New value where appropriate
- Timestamp
- Correlation ID

---

# 31. Security Requirements

## NFR-001 Authentication Security

The system shall use secure authentication mechanisms.

---

## NFR-002 Password Security

Passwords shall be securely hashed.

---

## NFR-003 Authorization

Every protected operation shall validate authorization server-side.

---

## NFR-004 Input Validation

All external input shall be validated and sanitized as appropriate.

---

## NFR-005 Secret Management

Secrets shall be stored in environment/configuration management systems and never committed to source code.

---

## NFR-006 Payment Security

Payment signatures and webhook signatures shall be independently verified.

---

## NFR-007 Sensitive Data

The system shall never log:

- Passwords
- OTPs
- CVV
- Card numbers
- Payment secrets
- Authentication tokens

---

# 32. Privacy Requirements

The system shall:

- Minimize collected personal data.
- Support analytics consent where required.
- Avoid sensitive behaviour tracking.
- Provide configurable retention.
- Support data deletion/anonymization workflows where required.
- Provide privacy policy support.

---

# 33. Performance Requirements

The application should:

- Optimize images.
- Lazy-load non-critical assets.
- Minimize JavaScript bundle size.
- Avoid unnecessary API calls.
- Use database indexes.
- Use caching where appropriate.
- Avoid unnecessary animations.

The customer storefront must remain usable on mobile networks and lower-end devices.

---

# 34. Responsive Requirements

Required viewport testing:

```text
360px
390px
414px
Tablet
Laptop
Desktop
Large Desktop
```

There must be:

- No horizontal overflow
- Touch-friendly controls
- Responsive images
- Mobile navigation
- Mobile filters
- Mobile checkout
- Mobile-friendly account pages

---

# 35. Accessibility Requirements

The system shall provide:

- Semantic HTML
- Keyboard navigation
- Focus states
- Form labels
- Accessible errors
- Alternative text
- Sufficient contrast
- Accessible buttons
- Screen-reader-compatible structure

---

# 36. Database Requirements

Recommended relational entities:

```text
Users
Roles
Permissions
Addresses

Products
ProductVariants
Categories
ProductImages
Ingredients

Batches
Inventory
InventoryTransactions

Carts
CartItems
Wishlists
WishlistItems

Orders
OrderItems

Payments
PaymentEvents

Shipments

Returns
Refunds

Reviews

Coupons
CouponUsage

Banners
BlogPosts
FAQs

SupportTickets

Notifications

AnalyticsEvents
Sessions

ErrorLogs
WebhookLogs
AuditLogs

Settings
```

---

# 37. Database Integrity

The database shall enforce:

- Foreign keys
- Unique constraints
- Indexes
- Referential integrity
- Transactions
- Appropriate soft deletion
- Unique SKU constraints
- Unique invoice identifiers where applicable
- Unique payment/webhook event IDs where required

---

# 38. Critical Transaction Rules

The following operations must be transactional wherever applicable:

### Order creation

```text
Validate cart
→ Validate price
→ Validate inventory
→ Reserve inventory
→ Create order
→ Create payment relationship
```

### Payment success

```text
Verify payment
→ Validate event
→ Check idempotency
→ Update payment
→ Confirm order
→ Finalize inventory
```

### Cancellation

```text
Validate order state
→ Cancel order
→ Release inventory
→ Initiate refund if applicable
```

### Refund

```text
Validate refund eligibility
→ Request provider refund
→ Record refund
→ Update state only after valid provider result
```

---

# 39. Failure Recovery

The system shall gracefully handle:

- Payment provider outage
- Shipping provider outage
- Email failure
- Webhook delay
- Duplicate webhook
- Database failure
- Network failure
- Browser closure during payment
- Payment success with delayed callback
- Checkout retry
- Inventory race conditions
- Refund failure

The system must avoid inconsistent business states.

---

# 40. Environment Requirements

Minimum environments:

```text
Development
Testing/Staging
Production
```

Environment-specific configuration shall be used.

Sensitive configuration must be supplied through environment variables/secrets.

---

# 41. Configuration

Configurable items should include:

- Store information
- Currency
- Tax
- Shipping
- COD
- Payment gateway
- Notification providers
- Analytics
- SEO
- Consent
- Error retention
- Analytics retention

---

# 42. External Integrations

The system should expose provider abstraction layers for:

### Payment

```text
createPayment()
verifyPayment()
refundPayment()
verifyWebhook()
```

### Shipping

```text
checkServiceability()
getRate()
createShipment()
cancelShipment()
trackShipment()
```

### Notifications

```text
sendEmail()
sendSMS()
sendWhatsApp()
```

### Storage

```text
upload()
delete()
getUrl()
```

This allows provider replacement without changing business logic.

---

# 43. SEO Technical Requirements

Implement:

- SEO-friendly slugs
- Metadata
- Canonical URLs
- Sitemap
- Robots.txt
- Breadcrumbs
- Structured data
- Open Graph
- Redirect handling

Deleted/archived products should be handled without creating broken navigation or unintended duplicate pages.

---

# 44. Testing Requirements

## Functional Tests

Test:

- Registration
- Login
- Password reset
- Search
- Product listing
- Product variants
- Cart
- Wishlist
- Checkout
- Coupons
- Payment
- COD
- Orders
- Cancellation
- Returns
- Refunds
- Reviews
- Admin
- CMS
- Support

---

## Payment Tests

Explicitly test:

- Successful payment
- Failed payment
- Pending payment
- Cancelled payment
- Duplicate callback
- Delayed webhook
- Failed webhook
- Refund
- Partial refund
- Payment success after browser closure

---

## Inventory Tests

Test:

- Last-item purchase
- Concurrent purchase
- Out-of-stock
- Payment failure
- Cancellation
- Reservation timeout
- Batch allocation
- Expired batch

---

## Security Tests

Test:

- Unauthorized API access
- Role escalation
- Invalid tokens
- Input manipulation
- Coupon manipulation
- Price manipulation
- Inventory manipulation
- Payment status manipulation
- Sensitive data exposure

---

# 45. Edge Cases

The system must handle:

1. Double-click Buy Now.
2. Browser refresh during payment.
3. Browser closure during payment.
4. Duplicate payment webhook.
5. Delayed webhook.
6. Product becoming unavailable during checkout.
7. Price changing during checkout.
8. Coupon expiring during checkout.
9. Last-stock concurrency.
10. Shipping provider failure.
11. Refund failure.
12. Payment provider outage.
13. Network interruption.
14. Database interruption.

---

# 46. Logging & Observability

Every major request should have a correlation/request ID.

This allows tracing:

```text
Customer action
      ↓
API request
      ↓
Database operation
      ↓
Payment/Shipping provider
      ↓
Webhook
      ↓
Order state
```

Logs should be structured and searchable.

Sensitive values must be redacted.

---

# 47. Deployment Requirements

Production deployment must include:

- Environment configuration
- Database migrations
- Secure secrets
- HTTPS
- Production payment configuration
- Production storage
- Monitoring
- Error logging
- Backup strategy
- Rollback strategy
- Health checks

Demo credentials must not remain active in production.

---

# 48. Demo/Seed Data

Development environment should include realistic fictional data:

- 15–20 products
- 6–8 categories
- Product variants
- Demo reviews
- Demo customers
- Demo orders
- Demo coupons
- Demo blog posts
- Demo banners
- Demo analytics events
- Demo error logs

All demo data must be clearly distinguishable from real business data.

---

# 49. Non-Functional Acceptance Criteria

The system shall not be considered production-ready if:

- Critical payment bugs remain.
- Orders can be duplicated.
- Inventory can be oversold.
- Unauthorized admins can access restricted functions.
- Sensitive secrets are exposed.
- Payment status can be manipulated from frontend.
- Refund state can be falsely marked successful.
- Critical errors are silently lost.
- Major customer journeys fail on mobile.
- Database consistency is compromised.

---

# 50. Definition of Done

The system is complete when:

### Customer

- Storefront works.
- Search works.
- Product pages work.
- Cart works.
- Wishlist works.
- Guest checkout works.
- Authentication works.
- Payment works in test environment.
- COD works where enabled.
- Orders work.
- Tracking architecture works.
- Cancellation works.
- Returns work.
- Refunds work.
- Reviews work.

### Admin

- Dashboard works.
- Product management works.
- Inventory works.
- Orders work.
- Returns/refunds work.
- Coupons work.
- CMS works.
- Support works.
- RBAC works.
- Audit logs work.

### Analytics

- Event tracking works.
- Behaviour dashboard works.
- Funnel works.
- Product analytics works.
- Search analytics works.
- Optimization insights work.

### System

- Error logs work.
- Webhook logs work.
- Payment health works.
- API health works.
- Security controls work.
- Environment configuration works.

### Quality

- Critical test cases pass.
- Responsive testing passes.
- No major console errors remain.
- No sensitive secrets are exposed.
- Database migrations are reproducible.
- Production deployment documentation exists.