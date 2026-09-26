# 🚜 TRACTO - Local Setup & Running Guide

This guide walks you through setting up and running both the Django backend and the redesigned React frontend locally.

---

## 📋 System Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **Git**
- **npm** (bundled with Node.js) and `pip` (bundled with Python)

---

## ⚙️ 1. Backend Setup (Django 6 + DRF)

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Create and activate a Python virtual environment
**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, or use Command Prompt: `venv\Scripts\activate.bat`)*

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run database migrations
```bash
python manage.py migrate
```

### Step 5: (Optional but Recommended) Seed Demo Data
Populate the database with demo tractors, implements, bookings, payments, and accounts:
```bash
python seed_demo_accounts.py
```

### Step 6: Start the Django development server
```bash
python manage.py runserver
```
The Django REST API will be accessible at: **`http://localhost:8000/api/`**
The Django Admin panel is at: **`http://localhost:8000/admin/`**

---

## 🔑 Demo Login Credentials

After running `seed_demo_accounts.py`, you can test each user flow using the following accounts:

| Role | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer (Renter)** | `customer@tracto.com` | `customer123` | Browse catalog, AI crop matcher, 4-step booking wizard, reviews, invoices |
| **Equipment Owner** | `owner@tracto.com` | `owner123` | Fleet management, add/edit tractors, approve/reject bookings, earnings & payouts |
| **Platform Admin** | `admin@tracto.com` | `admin123` | User moderation, tractor approval, booking logs, payment logs, analytics reports |

---

## 💻 2. Frontend Setup (React 19 + Vite)

### Step 1: Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Verify the API Base URL (Optional)
The frontend communicates with `http://localhost:8000/api/` by default configured in [src/api/axios.js](file:///c:/Users/ARJUN/OneDrive/Desktop/Tracto/frontend/src/api/axios.js). If your backend runs on a different port or host, create or edit `.env` in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/
```

### Step 4: Start the Vite development server
```bash
npm run dev
```
The React frontend application will launch at: **`http://localhost:5173/`**

### Step 5: Production Build Verification
To verify the production build bundle:
```bash
npm run build
```

---

## 🎨 Design System & Architecture Overview

The TRACTO UI has been redesigned from the ground up with a custom, mobile-first design system:

### 1. Design Tokens ([frontend/src/index.css](file:///c:/Users/ARJUN/OneDrive/Desktop/Tracto/frontend/src/index.css))
- **Color Palette**:
  - `Emerald Primary` (`#059669` / `#047857`): Represents agricultural vitality and fresh crops.
  - `Harvest Accent` (`#f59e0b` / `#d97706`): Warm sunlight and ripening wheat tones.
  - `Slate Neutrals` (`#0f172a` to `#f8fafc`): Crisp typography and soft surface contrast.
- **Typography**: Google Fonts [`Outfit`](https://fonts.google.com/specimen/Outfit) for high-impact headings and [`Plus Jakarta Sans`](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for readable UI body text.
- **Elevation System**: Multi-layered box shadows (`--shadow-xs` through `--shadow-xl`) and glassmorphic blur effects (`--bg-glass`).

### 2. Reusable UI Components ([frontend/src/components/ui/](file:///c:/Users/ARJUN/OneDrive/Desktop/Tracto/frontend/src/components/ui/))
- **`Button`**: Supports primary, secondary, outline, ghost, accent, and danger variants with loading spinner states and mobile tap targets (>= 42px).
- **`Card`**: Compound card with Header, Body, and Footer subcomponents, glass styling, and hover elevation.
- **`Badge`**: Semantic status tags (`success`, `warning`, `danger`, `info`, `neutral`).
- **`Input`**: Standardized form inputs with embedded icons, helper text, and validation error messages.
- **`Modal`**: Accessible dialogs with backdrop blur, keyboard ESC dismissal, and mobile responsiveness.
- **`EmptyState`**: Clean empty states with custom icons, descriptive text, and action buttons.
- **`StatCard`**: Dashboard metric tiles displaying values, trend percentages, and thematic icons.

### 3. Key Redesigned Workflows
- **Equipment Catalog (`/tractors`)**: Responsive search bar, collapsible mobile filter drawer, specs badges, and favorite toggles.
- **Booking Flow (`/book/:id`)**: Intuitive 4-step wizard (`[1. Work & Land] -> [2. Dates & Duration] -> [3. Implements] -> [4. Review & Confirm]`) with live cost calculation.
- **Farmer Dashboard (`/customer/dashboard`)**: Primary metrics, active booking cards, OTP delivery verification, and direct owner WhatsApp/Call actions.
- **Owner Portal (`/owner/dashboard`, `/owner/tractors`)**: Fleet utilization metrics, listing availability toggles, image gallery managers, and payout logs.
- **Admin Suite (`/admin/dashboard`, `/admin/tractors`, `/admin/users`)**: Searchable moderation tables, approval/revocation buttons, and SVG analytics charts.
