# 🚜 TRACTO - Agricultural Equipment & Tractor Rental Platform

**TRACTO** is a full-stack web application designed to empower farmers and agricultural equipment owners by facilitating seamless equipment rentals. The platform connects farmers needing machinery (tractors, tillers, harvesters, implements) with local equipment owners, offering transparent booking, pricing, payment management, and administrative oversight.

---

## ✨ Key Features

### 🤖 Smart AI Machinery Matcher & Dynamic Pricing Engine
- **AI Crop & Land Compatibility Matcher:** Recommends optimal tractor horsepower, attached implements, estimated operation time (hours), estimated fuel consumption (Liters), and estimated cost based on crop type (Cotton, Wheat, Sugarcane, Paddy, Groundnut), land size (acres), soil condition, and task purpose.
- **AI Price Advisor for Owners:** Dynamic rental rate suggestions for owners based on machinery HP, model year, and market demand index.

### 👨‍🌾 For Farmers / Renters

- **Explore Equipment:** Browse and search tractors and agricultural implements with detailed specifications, location filters, and ratings.
- **Flexible Booking:** Book tractors by hour or day, select required implements, choose delivery options, and calculate estimated costs.
- **Booking Management:** Track active, pending, completed, or cancelled bookings with live status updates.
- **Reviews & Ratings:** Leave feedback and ratings for owners and machinery.
- **Invoices & Notifications:** Download/view itemized invoices and receive automated in-app notifications.

### 🚜 For Equipment Owners
- **List Machinery:** Easily add, update, or remove tractors and attached implements.
- **Booking Approval Workflow:** Accept or reject rental requests from farmers.
- **Earnings & Payouts Dashboard:** Track total revenue, completed bookings, and payout status in real-time.

### 🛡️ For Administrators
- **Comprehensive Admin Portal:** Manage users (customers, owners, admins), block/unblock accounts.
- **Platform Oversight:** Monitor all platform bookings, equipment listings, payments, payouts, and reviews.
- **Analytics & Reports:** Visual insights into platform usage, revenue generation, and active equipment statistics.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios (with custom interps & JWT management)
- **Styling & UI:** Modern Vanilla CSS + Bootstrap 5 + React Icons
- **Architecture:** Component-driven design, custom hooks, responsive mobile-first layouts

### **Backend**
- **Framework:** Django 6 + Django REST Framework (DRF)
- **Database:** SQLite (Development) / PostgreSQL compatible
- **Authentication:** Custom User Model with Role-Based Access Control (RBAC) & Token/Session Auth
- **Architecture:** Modular Django App architecture (`accounts`, `rental`, `bookings`, `payments`, `reviews`, `notifications`)

---

## 📁 Repository Structure

```text
Tracto/
├── backend/
│   ├── accounts/         # User authentication, roles, profiles & admin views
│   ├── rental/           # Tractor & Implement catalog management
│   ├── bookings/         # Booking lifecycle and reservation engine
│   ├── payments/         # Payment processing and payout records
│   ├── reviews/          # Ratings & review system
│   ├── notifications/    # In-app notifications service
│   ├── config/           # Django project settings & URL routing
│   └── manage.py
└── frontend/
    ├── public/           # Static assets and media
    └── src/
        ├── api/          # Axios setup & API client configuration
        ├── components/   # Reusable UI components (Navbar, Sidebar, Modals, Cards)
        ├── pages/        # Main application views (Dashboards, List, Booking, Admin)
        ├── routes/       # Protected & Public routing definitions
        └── main.jsx
```

---

## 🚀 Getting Started & Local Setup

For comprehensive step-by-step instructions, environment setup, and demo login credentials, refer to **[SETUP.md](SETUP.md)**.

### Quick Start

1. **Backend (Django):**
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate | On macOS/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python seed_demo_accounts.py  # Seeds demo farmers, owners, admins & tractors
   python manage.py runserver
   ```

2. **Frontend (React + Vite):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Demo Accounts:**
   - **Farmer:** `customer@tracto.com` / `customer123`
   - **Owner:** `owner@tracto.com` / `owner123`
   - **Admin:** `admin@tracto.com` / `admin123`

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
