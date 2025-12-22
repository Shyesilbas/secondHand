# SecondHand - Second-Hand Marketplace Platform

A comprehensive full-stack marketplace platform for buying and selling second-hand items, built with Spring Boot and React.

## Project Overview

SecondHand is a modern, feature-rich marketplace platform that connects buyers and sellers of second-hand items. The platform supports multiple categories including vehicles, electronics, real estate, clothing, books, and sports equipment. It provides a complete e-commerce solution with advanced features such as real-time chat, offer negotiation, payment processing, campaign management, and comprehensive user management.

## Architecture

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.5.4
- **Java Version**: 17
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT authentication
- **API Documentation**: Swagger/OpenAPI 3
- **Authentication**: JWT tokens with refresh mechanism + OAuth2 (Google)
- **Real-time Communication**: WebSocket with STOMP protocol
- **Image Management**: Cloudinary integration
- **Mapping**: MapStruct for DTO mapping
- **Build Tool**: Maven

### Frontend (React)

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Custom Hooks + TanStack Query
- **HTTP Client**: Axios with interceptors for token refresh
- **Routing**: React Router DOM v7
- **Real-time**: STOMP.js for WebSocket communication
- **UI Components**: Custom component library with Lucide React icons
- **Charts**: Chart.js with react-chartjs-2

## Core Features

### Authentication & Security

The platform implements a comprehensive authentication and security system:

- **JWT Authentication**: Access tokens with long expiration (29900000ms) and refresh tokens (604800000ms)
- **OAuth2 Integration**: Google OAuth2 login support for seamless authentication
- **Token Management**: Automatic token refresh mechanism with secure cookie storage
- **Password Security**: Secure password hashing with Spring Security BCrypt
- **Rate Limiting**: Configurable rate limiting per endpoint type (auth: 3 req/s, payment: 3 req/s, general: 10 req/s)
- **Cookie Security**: Encrypted cookie management with configurable domain, secure flag, and same-site policies
- **Verification System**: Email and phone number verification (mock implementation)
- **Audit Logging**: Comprehensive security event tracking for user actions
- **Session Management**: User session tracking and management
- **Input Validation**: Server-side validation using Jakarta Validation
- **SQL Injection Prevention**: Parameterized queries via JPA/Hibernate
- **XSS Protection**: Content sanitization and secure headers
- **CSRF Protection**: Spring Security CSRF protection

### User Management

Complete user profile and account management:

- **User Profiles**: Detailed user information including name, email, phone, profile picture
- **Address Management**: Multiple shipping and billing addresses per user
- **Profile Customization**: Users can update their profile information, preferences, and settings
- **Account Verification**: Email and phone verification workflow
- **Password Management**: Change password functionality with security requirements
- **Forgot Password**: Password reset flow via email
- **User Dashboard**: Personalized dashboard with quick access to key features
- **User Statistics**: View user activity, listing counts, review statistics
- **Security Settings**: Manage security preferences and view audit logs

### Listing Management

Advanced listing creation and management system:

- **Multi-Category Support**: 
  - Vehicles (with brand, model, year, fuel type, mileage, color specifications)
  - Electronics (with brand, model, condition specifications)
  - Real Estate (with property type, square meters, room count, building age)
  - Clothing (with brand, size, color, condition)
  - Books (with ISBN, author, publisher, condition)
  - Sports Equipment (with brand, sport type, condition)

- **Listing Creation**: Step-by-step listing creation with category-specific fields
- **Image Management**: Multiple image uploads via Cloudinary (max 10MB per file)
- **Listing Status**: Active, Sold, Deactivated status management
- **Price Management**: Set and update listing prices with price history tracking
- **Advanced Search**: 
  - Filter by category, listing type, price range, location
  - Search by keywords in title and description
  - Filter by condition, brand, and other category-specific attributes
  - Sort by price, date, relevance

- **Listing Details**: Comprehensive listing detail pages with all specifications
- **My Listings**: Users can view, edit, and manage their own listings
- **Listing Fees**: Automated listing creation fee collection (50.00 TRY + 18% tax)
- **Listing Deactivation**: Users can deactivate their listings
- **Listing Analytics**: View listing views, favorites count, and engagement metrics

### Offers System

Negotiation and offer management system:

- **Make Offers**: Buyers can make offers on listings (except VEHICLE and REAL_ESTATE categories)
- **Offer Details**: Quantity selection and total price specification
- **Offer Expiration**: Offers expire after 24 hours
- **Counter Offers**: Sellers can counter-offer with new price and quantity
- **Offer Chain**: Parent-child relationship tracking for offer negotiation history
- **Offer Status**: PENDING, ACCEPTED, REJECTED, EXPIRED, COMPLETED statuses
- **Offer Management**: 
  - View offers made by buyer
  - View offers received by seller
  - Accept, reject, or counter offers
  - Track offer history and chain

- **Checkout Integration**: Accepted offers seamlessly integrate into checkout process
- **Offer Pricing**: Offers use total price (not unit price) and bypass campaign discounts
- **Coupon Support**: Coupons can be applied to orders containing accepted offers
- **Email Notifications**: Automatic email notifications for offer actions

### Shopping Cart & Orders

Complete shopping cart and order management:

- **Shopping Cart**: 
  - Add items to cart with quantity selection
  - Update quantities
  - Remove items
  - View cart total and item count

- **Checkout Process**:
  - Address selection (shipping and billing)
  - Payment method selection
  - Coupon code application
  - Order review and confirmation
  - Integration with accepted offers

- **Order Management**:
  - Order creation after successful payment
  - Order status tracking (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  - Order history view
  - Order details with itemized breakdown

- **Order Items**: Detailed order item information with pricing, quantity, and totals
- **Shipping**: Shipping address management and tracking
- **Order Analytics**: View order statistics and purchase history

### Payment System

Comprehensive payment processing system:

- **Payment Methods**:
  - Credit Card (with card number, expiry, CVV, cardholder name)
  - Bank Transfer (with bank account details)
  - E-Wallet (with wallet balance management)

- **Payment Verification**:
  - Email-based verification code system
  - Verification code required for payment processing
  - Secure payment verification workflow

- **Payment Processing**:
  - Payment initiation with verification
  - Payment confirmation and completion
  - Payment failure handling
  - Refund processing

- **Payment History**: Complete transaction history with filters and search
- **Payment Statistics**: 
  - Revenue analytics
  - Transaction counts
  - Payment method distribution
  - Time-based payment reports

- **Listing Fee Payment**: Automated listing creation fee collection
- **Showcase Fee Payment**: Payment for featured listing showcase
- **Payment Security**: Encrypted payment data storage and secure processing

### Campaigns & Coupons

Advanced discount and promotion system:

- **Campaigns**:
  - Seller-created campaigns for their listings
  - Campaign types: PERCENT or FIXED discount
  - Campaign scope: All listings, specific listing types, or specific listings
  - Start and end date management
  - Active/inactive status
  - Automatic application to eligible listings
  - Campaigns do not apply to VEHICLE and REAL_ESTATE categories

- **Coupons**:
  - System-wide coupon codes
  - Multiple discount types:
    - ORDER_PERCENT: Percentage discount on entire order
    - ORDER_FIXED: Fixed amount discount on entire order
    - TYPE_PERCENT: Percentage discount on specific listing types
    - TYPE_FIXED: Fixed amount discount on specific listing types
    - THRESHOLD_PERCENT: Percentage discount if subtotal meets threshold
    - THRESHOLD_FIXED: Fixed amount discount if subtotal meets threshold

  - Coupon features:
    - Minimum subtotal requirements
    - Maximum discount limits
    - Eligible listing type restrictions
    - Global usage limits
    - Per-user usage limits
    - Start and end date management
    - Active/inactive status

- **Coupon Preview**: Preview coupon discount before checkout
- **Coupon Application**: Apply coupons during checkout process
- **Coupon Validation**: Server-side validation of coupon eligibility and limits

### Chat System

Real-time communication between users:

- **WebSocket Communication**: STOMP protocol over WebSocket for real-time messaging
- **Chat Rooms**: 
  - Direct message rooms between two users
  - Listing-based chat rooms for discussing specific listings
  - Room creation and management

- **Messaging**:
  - Real-time message sending and receiving
  - Message history persistence
  - Unread message tracking
  - Message timestamps

- **Chat Features**:
  - View all chat rooms
  - Unread message counts
  - Message notifications
  - Chat room search and filtering

- **Message Management**: View message history, mark as read, delete messages

### Reviews & Ratings

User review and rating system:

- **User Reviews**: Users can rate and review other users after transactions
- **Review Creation**: Create reviews with rating (1-5 stars) and text comment
- **Review Management**: Edit and delete own reviews
- **Review Statistics**: 
  - Average rating calculation
  - Total review count
  - Rating distribution

- **Review Display**: View reviews on user profiles
- **Review Analytics**: Detailed review insights and statistics
- **Review Validation**: Prevent duplicate reviews and ensure transaction-based reviews

### Favorites

Wishlist and favorite listings management:

- **Add to Favorites**: Users can favorite listings for later
- **Favorite List**: View all favorited listings
- **Remove Favorites**: Remove listings from favorites
- **Favorite Count**: Display favorite count on listings
- **Favorite Notifications**: Notifications for price changes on favorited listings

### Showcase

Featured listing promotion system:

- **Showcase Creation**: Sellers can promote listings to showcase section
- **Showcase Pricing**: Daily cost-based pricing (10.00 TRY per day + 18% tax)
- **Showcase Duration**: Select number of days for showcase
- **Showcase Payment**: Payment required for showcase activation
- **Showcase Extension**: Extend showcase duration with additional payment
- **Showcase Cancellation**: Cancel showcase before expiration
- **Active Showcases**: Display active showcases on homepage
- **Showcase Management**: View and manage own showcases
- **Showcase Status**: ACTIVE, EXPIRED, CANCELLED statuses
- **Showcase Scheduler**: Automatic expiration handling via scheduled tasks

### Complaints

User complaint and dispute management:

- **Complaint Submission**: Users can submit complaints about other users or listings
- **Complaint Types**: Various complaint categories
- **Complaint Status**: Track complaint status (PENDING, REVIEWING, RESOLVED, REJECTED)
- **My Complaints**: View complaints submitted by user
- **Complaints About Me**: View complaints received about user
- **Complaint Details**: View complaint information and status updates

### Agreements

Legal agreement and consent management:

- **Agreement Types**:
  - Terms of Service
  - Privacy Policy
  - KVKK (Turkish Personal Data Protection Law) Notice
  - Distance Selling Agreement
  - Payment Terms

- **Agreement Versioning**: Track agreement versions and updates
- **User Agreements**: Record user acceptance of agreements
- **Agreement Groups**: REGISTER and ONLINE_PAYMENT agreement groups
- **Required Agreements**: Determine required agreements for specific actions
- **Agreement History**: View user acceptance history for agreements
- **Agreement Acceptance**: Accept agreements during registration and payment
- **Last Version Check**: Verify if user accepted latest agreement version

### Email Notifications

Comprehensive email notification system:

- **Email Service**: Email sending infrastructure
- **Notification Types**:
  - Transaction confirmations
  - Payment notifications
  - Offer notifications
  - Order updates
  - Verification codes
  - System notifications

- **Email Management**: View sent emails and email history
- **Email Templates**: Template-based email generation
- **Email Preferences**: User-configurable email notification preferences

### Exchange Rates

Currency conversion functionality:

- **Exchange Rate API**: Integration with ExchangeRate-API for live rates
- **Supported Currencies**: USD, EUR, TRY
- **Rate Fetching**: Get exchange rates between supported currencies
- **Rate Caching**: Client-side caching of exchange rates
- **Price Conversion**: Convert listing prices to different currencies
- **Exchange Rate Display**: Show converted prices on listing detail pages

### Analytics & Reporting

Comprehensive analytics and reporting:

- **Payment Statistics**: 
  - Revenue analytics
  - Transaction counts and trends
  - Payment method distribution
  - Time-based reports

- **User Analytics**:
  - Registration metrics
  - User activity tracking
  - User engagement statistics

- **Listing Analytics**:
  - Popular categories
  - Listing trends
  - View and engagement metrics

- **Review Analytics**: Review statistics and insights
- **Dashboard**: Comprehensive admin and user dashboards with key metrics

## Technical Details

### Backend Architecture

- **Layered Architecture**: Controller, Service, Repository, Entity layers
- **DTO Pattern**: Data Transfer Objects for API communication
- **Mapper Pattern**: MapStruct for entity-DTO mapping
- **Exception Handling**: Global exception handling with custom exceptions
- **Validation**: Jakarta Bean Validation for input validation
- **Transaction Management**: Declarative transaction management with @Transactional
- **Scheduled Tasks**: Spring @Scheduled for background jobs (token cleanup, showcase expiration)
- **Aspect-Oriented Programming**: Audit logging via Spring AOP

### Frontend Architecture

- **Component-Based**: Modular React components
- **Custom Hooks**: Reusable hooks for data fetching and state management
- **Service Layer**: API service abstraction layer
- **Context API**: Global state management for auth and notifications
- **Route Protection**: Protected routes with authentication checks
- **Error Handling**: Centralized error handling and notification system
- **Form Validation**: Client-side form validation
- **Optimistic Updates**: TanStack Query for optimistic UI updates

### Database Schema

- **PostgreSQL**: Relational database with foreign key constraints
- **JPA Entities**: Entity relationships and lazy loading
- **UUID Primary Keys**: UUID-based primary keys for entities
- **Audit Fields**: Created and updated timestamps
- **Soft Deletes**: Logical deletion support where applicable

### API Design

- **RESTful APIs**: RESTful API design principles
- **Versioning**: API versioning (/api/v1/)
- **OpenAPI Documentation**: Swagger UI for API documentation
- **Error Responses**: Standardized error response format
- **Pagination**: Pagination support for list endpoints
- **Filtering**: Query parameter-based filtering

### Security Implementation

- **JWT Tokens**: Stateless authentication with JWT
- **Refresh Tokens**: Long-lived refresh tokens for token renewal
- **Cookie Security**: HttpOnly, Secure, SameSite cookie attributes
- **Password Encryption**: BCrypt password hashing
- **Rate Limiting**: Token bucket algorithm for rate limiting
- **CORS Configuration**: Cross-origin resource sharing configuration
- **Security Headers**: Security headers for XSS and CSRF protection

## Configuration

### Environment Variables

Required environment variables for backend:

- `DB_URL`: PostgreSQL database URL
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `jwt_secretKey`: JWT secret key for token signing
- `COOKIE_DOMAIN`: Cookie domain (default: localhost)
- `COOKIE_SECURE`: Cookie secure flag (default: false)
- `COOKIE_SAME_SITE`: Cookie SameSite attribute (default: Lax)
- `COOKIE_ENCRYPTION_KEY`: Cookie encryption key
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `GOOGLE_SCOPE`: Google OAuth2 scopes
- `REDIRECT_URI`: OAuth2 redirect URI
- `ISSUER_URI`: OAuth2 issuer URI
- `exchangeApiKey`: ExchangeRate-API key
- `cloudinaryCloudName`: Cloudinary cloud name
- `cloudinaryApiKey`: Cloudinary API key
- `cloudinarySecretKey`: Cloudinary API secret

### Application Properties

Key configuration properties:

- **Server**: Port 8080
- **JWT Expiration**: Access token 29900000ms, Refresh token 604800000ms
- **Rate Limiting**: Configurable per endpoint type
- **File Upload**: Max 10MB per file
- **Listing Fee**: 50.00 TRY + 18% tax
- **Showcase Fee**: 10.00 TRY per day + 18% tax
- **Date Format**: dd/MM/yyyy HH:mm (GMT+3, Turkish locale)

## Development

### Backend Setup

1. Install Java 17 and Maven
2. Set up PostgreSQL database
3. Configure environment variables
4. Run `mvn clean install`
5. Start application with `mvn spring-boot:run`
6. Access Swagger UI at `http://localhost:8080/swagger-ui.html`

### Frontend Setup

1. Install Node.js and npm
2. Navigate to `secondhand-frontend` directory
3. Run `npm install`
4. Configure API base URL in environment
5. Run `npm run dev` for development
6. Run `npm run build` for production build

## API Documentation

API documentation is available via Swagger UI when the backend is running:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Project Structure

```
secondHand/
├── src/main/java/com/serhat/secondhand/
│   ├── agreements/          # Agreement management
│   ├── auth/                # Authentication and authorization
│   ├── campaign/            # Campaign management
│   ├── cart/                # Shopping cart
│   ├── chat/                # Real-time chat
│   ├── cloudinary/          # Image upload service
│   ├── complaint/           # Complaint system
│   ├── core/                # Core utilities and configs
│   ├── coupon/              # Coupon management
│   ├── email/               # Email service
│   ├── ewallet/             # E-wallet management
│   ├── exchange/             # Exchange rate service
│   ├── favorite/            # Favorites system
│   ├── listing/             # Listing management
│   ├── offer/               # Offers system
│   ├── order/                # Order management
│   ├── payment/              # Payment processing
│   ├── pricing/              # Pricing calculations
│   ├── review/               # Reviews and ratings
│   ├── showcase/             # Showcase feature
│   ├── shipping/             # Shipping management
│   └── user/                 # User management
├── secondhand-frontend/
│   └── src/
│       ├── agreements/       # Agreement components
│       ├── auth/             # Authentication pages
│       ├── cart/             # Shopping cart
│       ├── chat/             # Chat interface
│       ├── complaint/        # Complaint components
│       ├── listing/          # Listing pages
│       ├── offer/            # Offer components
│       ├── payments/         # Payment pages
│       ├── review/           # Review components
│       ├── showcase/         # Showcase components
│       └── user/             # User pages
└── README.md
```