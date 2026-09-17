import { PrismaClient, Role, CustomerStatus, BillStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ISP Billing database...");

  // 1. Clear existing test data
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.iSPSettings.deleteMany();

  // 2. Default ISP Settings
  const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#ffffff"/>
    <rect x="20" y="20" width="50" height="50" fill="#e2136e"/>
    <rect x="30" y="30" width="30" height="30" fill="#ffffff"/>
    <rect x="37" y="37" width="16" height="16" fill="#e2136e"/>
    <rect x="130" y="20" width="50" height="50" fill="#e2136e"/>
    <rect x="140" y="30" width="30" height="30" fill="#ffffff"/>
    <rect x="147" y="37" width="16" height="16" fill="#e2136e"/>
    <rect x="20" y="130" width="50" height="50" fill="#e2136e"/>
    <rect x="30" y="140" width="30" height="30" fill="#ffffff"/>
    <rect x="37" y="147" width="16" height="16" fill="#e2136e"/>
    <rect x="85" y="25" width="25" height="15" fill="#e2136e"/>
    <rect x="85" y="55" width="25" height="25" fill="#e2136e"/>
    <rect x="25" y="85" width="45" height="20" fill="#e2136e"/>
    <rect x="85" y="90" width="30" height="30" fill="#e2136e"/>
    <rect x="125" y="85" width="20" height="40" fill="#e2136e"/>
    <rect x="155" y="95" width="25" height="15" fill="#e2136e"/>
    <rect x="90" y="135" width="20" height="45" fill="#e2136e"/>
    <rect x="125" y="140" width="45" height="20" fill="#e2136e"/>
    <rect x="145" y="170" width="25" height="15" fill="#e2136e"/>
    <circle cx="100" cy="100" r="14" fill="#ffffff"/>
    <text x="100" y="105" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#e2136e" text-anchor="middle">bKash</text>
  </svg>`;

  await prisma.iSPSettings.create({
    data: {
      ispName: "BengalNet Broadband & Fiber",
      supportPhone: "+880 9612-000111",
      bkashNumber: "01799887766",
      bkashQrCode: `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`,
      paymentInstructions:
        "1. Open your bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number: 01799887766\n4. Enter the exact monthly bill amount\n5. In the reference field, write your Customer ID (e.g. CUST-0001)\n6. Enter your bKash PIN to confirm transaction\n7. Copy the 10-character Transaction ID (e.g. BL98K4J2M1)\n8. Return to this portal and submit the Transaction ID",
    },
  });

  // 3. Admin Account (IMPORTANT: change password in production)
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Admin account created: admin@example.com / Admin123!");

  // 4. Sample Customers
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);

  const sampleCustomersData = [
    {
      code: "CUST-0001",
      name: "Rahim Ahmed",
      phone: "01711111111",
      email: "rahim@example.com",
      address: "House 14, Road 5, Sector 11, Uttara, Dhaka",
      monthlyBill: 800,
      status: CustomerStatus.ACTIVE,
      connectionDate: new Date("2025-01-10"),
    },
    {
      code: "CUST-0002",
      name: "Karim Hasan",
      phone: "01822222222",
      email: "karim@example.com",
      address: "Flat 4B, Green Heritage, Green Road, Dhanmondi, Dhaka",
      monthlyBill: 1000,
      status: CustomerStatus.ACTIVE,
      connectionDate: new Date("2025-03-15"),
    },
    {
      code: "CUST-0003",
      name: "Fatema Begum",
      phone: "01933333333",
      email: "fatema@example.com",
      address: "House 72, Block C, Section 10, Mirpur, Dhaka",
      monthlyBill: 1200,
      status: CustomerStatus.ACTIVE,
      connectionDate: new Date("2025-06-01"),
    },
    {
      code: "CUST-0004",
      name: "Tanvir Alam",
      phone: "01644444444",
      email: "tanvir@example.com",
      address: "Road 11, Block E, Banani, Dhaka",
      monthlyBill: 800,
      status: CustomerStatus.SUSPENDED,
      connectionDate: new Date("2025-08-20"),
    },
  ];

  const createdCustomers: any[] = [];

  for (const cData of sampleCustomersData) {
    const user = await prisma.user.create({
      data: {
        email: cData.email,
        passwordHash: customerPasswordHash,
        role: Role.CUSTOMER,
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        customerCode: cData.code,
        name: cData.name,
        phone: cData.phone,
        email: cData.email,
        address: cData.address,
        monthlyBill: cData.monthlyBill,
        status: cData.status,
        connectionDate: cData.connectionDate,
      },
    });

    createdCustomers.push(customer);
  }

  const [c1, c2, c3, c4] = createdCustomers;

  // 5. Seed Bills & Payments across multiple months
  // July 2026 - PAID bills for c1, c2, c3
  for (const c of [c1, c2, c3]) {
    const bill = await prisma.bill.create({
      data: {
        customerId: c.id,
        billingMonth: 7,
        billingYear: 2026,
        amount: c.monthlyBill,
        dueDate: new Date("2026-07-10T18:00:00Z"),
        status: BillStatus.PAID,
        paidAt: new Date("2026-07-08T14:30:00Z"),
      },
    });

    await prisma.payment.create({
      data: {
        billId: bill.id,
        customerId: c.id,
        amount: c.monthlyBill,
        method: PaymentMethod.BKASH,
        transactionId: `TRXJUL7${c.customerCode.replace("-", "")}`,
        senderPhone: c.phone,
        status: PaymentStatus.VERIFIED,
        submittedAt: new Date("2026-07-08T14:00:00Z"),
        verifiedAt: new Date("2026-07-08T14:30:00Z"),
        verifiedBy: adminUser.id,
        notes: "Verified against bKash merchant statement",
      },
    });
  }

  // August 2026 - PAID bills for c1, c2
  for (const c of [c1, c2]) {
    const bill = await prisma.bill.create({
      data: {
        customerId: c.id,
        billingMonth: 8,
        billingYear: 2026,
        amount: c.monthlyBill,
        dueDate: new Date("2026-08-10T18:00:00Z"),
        status: BillStatus.PAID,
        paidAt: new Date("2026-08-09T10:15:00Z"),
      },
    });

    await prisma.payment.create({
      data: {
        billId: bill.id,
        customerId: c.id,
        amount: c.monthlyBill,
        method: PaymentMethod.BKASH,
        transactionId: `TRXAUG8${c.customerCode.replace("-", "")}`,
        senderPhone: c.phone,
        status: PaymentStatus.VERIFIED,
        submittedAt: new Date("2026-08-09T09:45:00Z"),
        verifiedAt: new Date("2026-08-09T10:15:00Z"),
        verifiedBy: adminUser.id,
      },
    });
  }

  // September 2026:
  // CUST-0001 has PAYMENT_SUBMITTED (waiting for admin verification!)
  const c1SepBill = await prisma.bill.create({
    data: {
      customerId: c1.id,
      billingMonth: 9,
      billingYear: 2026,
      amount: c1.monthlyBill,
      dueDate: new Date("2026-09-10T18:00:00Z"),
      status: BillStatus.PAYMENT_SUBMITTED,
    },
  });

  await prisma.payment.create({
    data: {
      billId: c1SepBill.id,
      customerId: c1.id,
      amount: c1.monthlyBill,
      method: PaymentMethod.BKASH,
      transactionId: "BK9902X8Q4",
      senderPhone: c1.phone,
      status: PaymentStatus.PENDING,
      submittedAt: new Date("2026-09-12T11:20:00Z"),
      notes: "Sent from personal bKash account",
    },
  });

  // CUST-0002 has UNPAID bill (ready for user to test payment submission!)
  await prisma.bill.create({
    data: {
      customerId: c2.id,
      billingMonth: 9,
      billingYear: 2026,
      amount: c2.monthlyBill,
      dueDate: new Date("2026-09-25T18:00:00Z"),
      status: BillStatus.UNPAID,
    },
  });

  // CUST-0003 has OVERDUE bill (dueDate was Sep 10, 2026)
  await prisma.bill.create({
    data: {
      customerId: c3.id,
      billingMonth: 9,
      billingYear: 2026,
      amount: c3.monthlyBill,
      dueDate: new Date("2026-09-10T18:00:00Z"),
      status: BillStatus.OVERDUE,
    },
  });

  // Create initial audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "SYSTEM_INITIALIZED",
      entityType: "System",
      metadata: {
        timestamp: new Date().toISOString(),
        customersCount: sampleCustomersData.length,
      },
    },
  });

  console.log("Database seeded successfully with sample data!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

