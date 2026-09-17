# ISP Billing Management System (Bangladesh)

A complete, production-ready ISP Billing and Subscriber Management System built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**, styled with **Tailwind CSS**.

Designed specifically for Internet Service Providers (ISPs) in Bangladesh, featuring manual **bKash** payment workflows, robust monthly invoice generation, role-based authorization, and tamper-proof financial verification.

---

## 🌟 Key Features

### 🔐 Authentication & Role Isolation
- **Role-Based Access Control (RBAC)**: Distinct access levels for `ADMIN` and `CUSTOMER`.
- **Session Security**: HTTP-only, signed JWT session cookies with secure hashing via `bcryptjs`.
- **IDOR & Data Isolation**: Customer records, bills, and payment history are strictly queried server-side using the verified session `customerId`. Customers can never view another customer's data.
- **Flexible Login**: Subscribers can sign in using their **Customer ID** (e.g. `CUST-0001`), **Phone Number** (`017XXXXXXXX`), or **Email**.

### 🛠️ Admin Management Portal (`/admin/*`)
- **Executive Dashboard**: Real-time KPI cards (Total Customers, Active Subscribers, Monthly Collections in ৳, Pending Payments, Overdue Invoices).
- **Customer Management**:
  - Add new customers with automated credentials provisioning.
  - Edit subscriber plans, installation addresses, and monthly bill rates.
  - Suspend, activate, or deactivate accounts.
  - One-click customer password reset.
  - Search by Customer ID, Name, or Phone with status filtering.
- **Monthly Billing Automation**:
  - Batch **"Generate Monthly Bills"** for all active subscribers for any month/year.
  - Safe duplicate prevention (`customerId + billingMonth + billingYear` unique constraint).
  - Create individual customized bills.
  - Automated overdue status detection for bills unpaid past their due date.
- **bKash Payment Verification**:
  - Review customer-submitted bKash Transaction IDs, sender phones, and amounts.
  - **Verify Payment**: Atomically sets payment to `VERIFIED` and bill to `PAID` with exact timestamps in a PostgreSQL transaction.
  - **Reject Payment**: Atomically sets payment to `REJECTED`, saves mandatory rejection reason, and reverts bill to `UNPAID` / `OVERDUE`.
- **Reports & Analytics**: Filterable monthly collections, billed vs. collected vs. outstanding amounts, and collection percentage.
- **ISP Settings**: Configurable ISP brand name, support hotline, bKash receiving number, QR code, and customer payment instructions with live preview.
- **Audit Logs**: Immutable audit trail of admin actions (customer creation, bill generation, verification, password resets).

### 📱 Mobile-Friendly Customer Portal (`/portal/*`)
- **Subscriber Dashboard**: Current invoice banner with amount, due date, status badge, and prominent **"PAY BILL"** button.
- **Pay Bill Flow**:
  1. Customer views exact bill amount in ৳.
  2. One-click **"Copy bKash Number"** and bKash QR code display.
  3. Clear step-by-step Send Money instructions in English & Bengali context.
  4. Customer submits 10-character **bKash Transaction ID (TrxID)** and sender phone number.
  5. Invoice immediately transitions to `PAYMENT_SUBMITTED` and payment to `PENDING`.
- **My Bills**: Complete historical ledger of all invoices with status tags (`PAID`, `UNPAID`, `PAYMENT_SUBMITTED`, `OVERDUE`).
- **Payment History**: Full log of submitted transactions, verification dates, and rejection explanations if any.
- **Profile & Security**: Subscriber details overview and self-service password update.

---

## 🏗️ Architecture & Future-Ready Design

The application incorporates a decoupled `PaymentService` interface:

```typescript
export interface IPaymentService {
  submitPayment(customerId: string, dto: SubmitPaymentDTO): Promise<...>;
  verifyPayment(adminUserId: string, paymentId: string): Promise<...>;
  rejectPayment(adminUserId: string, paymentId: string, reason: string): Promise<...>;
}
```

This ensures that future integrations—such as **official bKash Merchant API**, **Nagad / Rocket gateways**, **SMS notification gateways**, **MikroTik RouterOS API**, or **OLT automation**—can be plugged in without refactoring core billing logic.

---

## 💻 Prerequisites

- **Node.js**: v18.18.0 or newer (tested on Node.js v24+)
- **npm**: v9+ (or pnpm / yarn)
- **PostgreSQL**: v14, 15, 16, 17, or 18 running locally or on a remote server.
- **Operating System**: Works natively on Windows, macOS, and Linux **without Docker**.

---

## 🚀 Quick Setup & Installation

### 1. Clone or Open Project
```powershell
cd c:\Users\NIPUN ROY\Desktop\ISP-BILLING
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Database Creation (PostgreSQL)
Ensure your PostgreSQL service is running. Create a database named `isp_billing`:
```sql
CREATE DATABASE isp_billing;
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure your `DATABASE_URL` matches your local PostgreSQL credentials. Example:
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/isp_billing?schema=public"
AUTH_SECRET="your-32-character-random-secret-key"
NODE_ENV="development"
```

### 5. Generate Prisma Client & Sync Schema
```powershell
npx prisma generate
npx prisma db push
```

### 6. Seed Sample Data
Populate the database with initial Admin credentials, sample subscribers, invoices, and ISP settings:
```powershell
npm run prisma:seed
```

### 7. Start Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

### Administrator
- **Email**: `admin@example.com`
- **Password**: `Admin123!`
> ⚠️ **IMPORTANT**: In production environments, change this default password immediately.

### Sample Customer Accounts
| Customer ID | Name | Login Identifier | Password | Monthly Plan | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CUST-0001` | Rahim Ahmed | `01711111111` or `CUST-0001` | `Customer123!` | ৳800.00 | Active (Pending Sep payment) |
| `CUST-0002` | Karim Hasan | `01822222222` or `CUST-0002` | `Customer123!` | ৳1,000.00 | Active (Unpaid Sep bill) |
| `CUST-0003` | Fatema Begum | `01933333333` or `CUST-0003` | `Customer123!` | ৳1,200.00 | Active (Overdue Sep bill) |
| `CUST-0004` | Tanvir Alam | `01644444444` or `CUST-0004` | `Customer123!` | ৳800.00 | Suspended |

---

## 🔄 bKash Manual Payment Lifecycle

```
[CUSTOMER]
  1. Logs in at /login with Phone or Customer ID.
  2. Views unpaid bill on Dashboard and clicks "PAY BILL NOW".
  3. Copies ISP bKash Number or scans bKash QR code.
  4. Opens bKash app on mobile and sends exact amount via "Send Money".
  5. Enters Transaction ID (e.g., BL98K4J2M1) and Sender Mobile Number in portal form.
  6. Submits form -> Payment becomes PENDING, Bill becomes PAYMENT_SUBMITTED.

[ADMIN]
  1. Logs in and navigates to /admin/payments.
  2. Locates pending transaction with customer name, phone, and Trx ID.
  3. Checks bKash Merchant statement externally.
  4. If Valid:
     - Clicks "Verify" -> Atomic DB transaction marks Payment VERIFIED and Bill PAID with timestamp.
  5. If Invalid:
     - Clicks "Reject" -> Enters reason -> Payment marked REJECTED, Bill reverts to UNPAID / OVERDUE.
```

---

## 📂 Project Structure

```
ISP-BILLING/
├── app/
│   ├── (auth)/
│   │   └── login/             # Unified Admin & Customer Login
│   ├── actions/               # Server Actions (Auth, Customers, Bills, Payments, Settings)
│   ├── admin/
│   │   ├── dashboard/         # KPI Cards, Recent Transactions, Quick Actions
│   │   ├── customers/         # Subscriber list, filters, add modal, [id] detail view
│   │   ├── bills/             # Invoice management & batch monthly generation
│   │   ├── payments/          # Transaction verification & rejection modals
│   │   ├── reports/           # Financial breakdown and collection rates
│   │   └── settings/          # ISP branding, bKash number & QR configuration
│   ├── portal/
│   │   ├── dashboard/         # Customer current bill hero card & highlights
│   │   ├── bills/             # Customer invoice ledger
│   │   ├── pay-bill/          # Copy bKash number, QR code & Trx submission
│   │   ├── payments/          # Customer submission history & status
│   │   └── profile/           # Profile details & password update
│   ├── globals.css            # Tailwind directives and custom scrollbars
│   └── layout.tsx             # Root HTML layout
├── components/
│   ├── admin/                 # Admin responsive sidebar & header
│   ├── customer/              # Customer mobile-first sidebar & header
│   ├── shared/                # Alerts, badges, icons
│   └── ui/                    # Button, Card, Input, Textarea, Select, Modal, Badge
├── lib/
│   ├── auth/                  # JWT session cookie encryption & RBAC guards
│   ├── db/                    # Prisma client singleton
│   ├── services/              # Domain services (PaymentService, BillService, AuditService)
│   ├── validations/           # Zod input schemas
│   └── utils.ts               # Currency (৳), Dhaka date formatting & Tailwind helpers
├── prisma/
│   ├── schema.prisma          # PostgreSQL models (User, Customer, Bill, Payment, Settings, AuditLog)
│   └── seed.ts                # Database seeder with sample demo accounts
├── middleware.ts              # Edge-compatible RBAC route protection
├── package.json
└── tsconfig.json
```

---

## 🛡️ Production Build & Deployment

To verify and run a production build:
```powershell
npm run build
npm run start
```
The application will launch on [http://localhost:3000](http://localhost:3000).

