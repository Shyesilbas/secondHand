# 🛒 SecondHand - Second-Hand Marketplace Platform

A comprehensive full-stack marketplace platform for buying and selling second-hand items, built with Spring Boot and React.

## 🚀 **Project Overview**

SecondHand is a modern, feature-rich marketplace platform that connects buyers and sellers of second-hand items. The platform supports multiple categories including vehicles, electronics, real estate, clothing, books, and sports equipment.

## 🏗️ **Architecture**

### **Backend (Spring Boot)**
- **Framework**: Spring Boot 3.5.4
- **Java Version**: 17
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT
- **API Documentation**: Swagger/OpenAPI 3
- **Authentication**: JWT + OAuth2 (Google)

### **Frontend (React)**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom component library

## 📋 **Core Features**

### **🔐 Authentication & Security**
- JWT-based authentication with refresh tokens
- OAuth2 Google integration
- Rate limiting for API endpoints
- Secure cookie management with encryption
- Phone number verification (mock)
- Email verification system (mock)

### **📦 Listing Management**
- **Multi-category Support**: Vehicles, Electronics, Real Estate, Clothing, Books, Sports
- **Advanced Search**: Filter by category, price, location, condition
- **Image Upload**: Cloudinary integration for image management
- **Listing Status**: Active, Sold, Deactivated
- **Price History**: Track price changes over time

### **💳 Payment System**
- **Multiple Payment Methods**: Credit Card, Bank Transfer, E-Wallet
- **Secure Processing**: Verification codes for transactions
- **Listing Fees**: Automated fee collection
- **Payment History**: Complete transaction tracking
- **Statistics**: Payment analytics and reporting

### **🛒 Shopping & Orders**
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Address selection, payment processing
- **Order Management**: Track order status, shipping updates
- **Order History**: Complete purchase history

### **💬 Communication**
- **Real-time Chat**: WebSocket-based messaging
- **Room Management**: Direct messages and listing-based rooms
- **Message History**: Persistent chat storage
- **Unread Notifications**: Real-time message counters

### **⭐ Reviews & Ratings**
- **User Reviews**: Rate and review other users
- **Review Statistics**: Average ratings and review counts
- **Review Management**: Edit, delete reviews
- **Review Analytics**: Detailed review insights

### **📧 Notification System**
- **Email Notifications**: Transaction confirmations, updates
- **In-app Notifications**: Real-time system notifications
- **Verification Codes**: SMS/Email verification
- **Customizable Settings**: User preference management

### **🏠 User Management**
- **User Profiles**: Detailed user information
- **Address Management**: Multiple shipping/billing addresses
- **Security Settings**: Password change, session management
- **Audit Logs**: Security event tracking

### **📊 Analytics & Reporting**
- **Payment Statistics**: Revenue and transaction analytics
- **User Analytics**: Registration and activity metrics
- **Listing Analytics**: Popular categories and trends




## 🔒 **Security Features**

### **Authentication**
- JWT-based authentication
- Refresh token mechanism
- OAuth2 Google integration
- Secure password hashing

### **Authorization**
- Role-based access control
- Method-level security
- Resource-based permissions

### **Data Protection**
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting


### **Planned Features**
- Advanced analytics dashboard
- AI-powered recommendations
- Multi-language support

