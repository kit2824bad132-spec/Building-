# SARAVANAN BUILDERS — Full-Stack Residential Construction Web Platform

> A production-grade web application for **Saravanan Builders**, specializing in individual residential house construction, bespoke luxury villas, and contemporary duplex residences. Features real project showcases, an interactive construction cost estimator, authenticated client project progress tracking with site photos, and an operations management admin console.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Lucide Icons, Axios, Vanilla CSS Luxury Design System (`#FFFFFF`, `#C8A24D` Gold, `#17243A` Navy, `#F8F8F6`).
- **Backend:** Node.js, Express.js REST API, JWT Authentication, bcryptjs password encryption, Multer image processing.
- **Database:** Neon PostgreSQL with full relational constraints, foreign keys, parameterized queries, and fallback local database engine.
- **Media Storage:** Cloudinary SDK stream upload with local uploads fallback.

---

## 📁 Repository Structure

```
SARAVANAN BUILDERS/
├── backend/
│   ├── src/
│   │   ├── config/          # Neon DB Pool and Cloudinary configuration
│   │   ├── middleware/      # JWT auth, role validation, centralized error handling
│   │   ├── routes/          # Auth, Projects, Enquiries, Estimator, Customer, Admin
│   │   ├── scripts/         # seed.js, create-admin.js
│   │   ├── app.js           # Express app, CORS, rate limiting
│   │   └── server.js        # Server entrypoint
│   ├── schema.sql           # Complete PostgreSQL DDL schema
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProjectCard, FloatingWhatsApp
│   │   ├── context/         # AuthContext (JWT session state & role guard)
│   │   ├── pages/           # Home, ProjectGallery, ProjectDetails, CostEstimator, Contact
│   │   │   ├── admin/       # Admin Dashboard, Projects, Add/Edit Project, Enquiries, etc.
│   │   │   └── Customer...  # Client Login, Register, My Project Tracker
│   │   ├── services/        # Axios API client with bearer token interceptor
│   │   ├── App.jsx          # Protected route declarations
│   │   ├── main.jsx
│   │   └── index.css        # Luxury residential design system tokens
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **Neon Account** (optional for remote PostgreSQL; local fallback active by default): [https://neon.tech](https://neon.tech)
- **Cloudinary Account** (optional for remote image storage; local disk uploads active by default): [https://cloudinary.com](https://cloudinary.com)

---

### 2. Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Neon PostgreSQL Connection URL
   DATABASE_URL=postgres://username:password@ep-sample-123456.us-east-2.aws.neon.tech/saravanan_db?sslmode=require

   # Cloudinary Media Storage (Optional, disk uploads used if omitted)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Company WhatsApp & Contact
   COMPANY_PHONE=+91 98400 12345
   COMPANY_WHATSAPP=919840012345
   COMPANY_EMAIL=contact@saravananbuilders.com
   ```

3. Initialize and Seed the Database:
   ```bash
   npm run seed
   ```
   *This initializes the pricing tiers, sample residential projects with authentic photography, default construction milestones, a demo customer account, and admin credentials.*

4. Create/Update Administrator Credentials:
   ```bash
   npm run create-admin
   # Or with custom credentials:
   node src/scripts/create-admin.js admin@saravananbuilders.com MySecurePassword123 "Er. Saravanan B.E."
   ```

5. Start the Backend API Server:
   ```bash
   npm run dev
   ```
   *API will be running at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

---

### 3. Frontend Setup

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite Frontend Development Server:
   ```bash
   npm run dev
   ```
   *Website will be running at `http://localhost:5173`.*

---

## 🔑 Default Seeded Demo Accounts

### Administrator Portal
- **URL:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email:** `admin@saravananbuilders.com`
- **Password:** `Saravanan@2026`
- **Capabilities:**
  - View live project & lead metrics.
  - Create and edit projects with real image uploads.
  - Filter and update enquiry statuses (New, Contacted, Converted, etc.) and direct WhatsApp follow-up.
  - Assign residential projects to customer accounts.
  - Advance construction stages and publish progress photographs.
  - Adjust base cost estimator prices per square foot.

### Client Progress Portal
- **URL:** [http://localhost:5173/customer/login](http://localhost:5173/customer/login)
- **Email:** `karthik@example.com`
- **Password:** `Customer123!`
- **Capabilities:**
  - View assigned house construction ("Emerald Heights Signature Residence").
  - Real-time progress bar (e.g. 45% completed).
  - 8-stage interactive visual timeline.
  - Inspected site progress photographs with engineer remarks.
  - Personal enquiry history.

---

## 🌐 Public Website Features

1. **Homepage:**
   - Hero banner with headline *"Building Your Dream Home with Trust and Quality."*
   - About Saravanan Builders, founder background, and company credentials.
   - Core services (Individual Villa Construction, Duplexes, Architectural 3D Plans, Structural Engineering).
   - Dynamic featured projects loaded from live database.
   - 4-step structured construction process.
   - Client homeowner testimonials.
2. **Project Gallery:**
   - Real project cards showing built-up area in sq.ft., construction cost, and rate per sq.ft.
   - Multi-parameter filtering by Location, House Type, Budget range, and Status (Completed/Ongoing).
   - Only published projects appear publicly.
3. **Project Details:**
   - Image gallery carousel/thumbnails.
   - Full architectural and structural specifications.
   - Official WhatsApp enquiry button pre-filled with the selected project details.
4. **Construction Cost Estimator:**
   - Built-up area slider & presets (600 to 6000 sq.ft.).
   - Quality tiers: **Basic** (₹1,850/sq.ft), **Standard** (₹2,200/sq.ft), **Premium** (₹2,750/sq.ft).
   - Floor multipliers & optional upgrades (Modular Kitchen, False Ceiling, Solar Rooftop, Landscaping).
   - Real-time cost breakdown.
   - Official WhatsApp quotation request link with itemized breakdown.
5. **Contact Us:**
   - Validated enquiry submission with PostgreSQL storage.
   - Direct pre-filled WhatsApp consultation link.
   - Floating WhatsApp button across all pages.

---

## 🔒 Security Best Practices

- Passwords hashed with `bcryptjs` (salt rounds: 10).
- Session authorization via signed JSON Web Tokens (`jsonwebtoken`).
- Protected backend middleware enforcing strict `admin` role and customer ownership verification.
- CORS restricted to allowed domains.
- Request rate limiting applied to authentication and public enquiry endpoints.
- Parameterized SQL queries preventing SQL injection attacks.
- Sensitive environment secrets kept out of version control via `.gitignore`.
