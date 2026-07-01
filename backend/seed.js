import dotenv from "dotenv";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Supplier from "./models/Supplier.js";
import Product from "./models/Product.js";
import StockLog from "./models/StockLog.js";
import Notification from "./models/Notification.js";
import Customer from "./models/Customer.js";
import Sale from "./models/Sale.js";
import Purchase from "./models/Purchase.js";

dotenv.config();

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (daysBack = 7) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
};

const futureDate = (daysAhead = 14) => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return d;
};

async function seed() {
  const uri = process.env.MONGODB;
  if (!uri) {
    throw new Error("MONGODB is not set in backend/.env");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
    StockLog.deleteMany({}),
    Notification.deleteMany({}),
    Customer.deleteMany({}),
    Sale.deleteMany({}),
    Purchase.deleteMany({}),
  ]);
  console.log("   Done\n");

  // ── Users ──────────────────────────────────────────────────────
  console.log("Seeding users...");
  const salt = await bcrypt.genSalt(10);

  const users = await User.insertMany([
    {
      name: "Admin User",
      email: "admin@stockflow.com",
      password: await bcrypt.hash("admin123", salt),
      role: "admin",
      phone: "+92 300 1234567",
      avatar: "",
      isActive: true,
      lastLogin: new Date(),
      createdAt: randomDate(180),
      updatedAt: new Date(),
    },
    {
      name: "Staff User",
      email: "staff@stockflow.com",
      password: await bcrypt.hash("staff123", salt),
      role: "staff",
      phone: "+92 301 9876543",
      avatar: "",
      isActive: true,
      lastLogin: new Date(),
      createdAt: randomDate(180),
      updatedAt: new Date(),
    },
    ...Array.from({ length: 3 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: bcrypt.hashSync("password123", salt),
      role: "staff",
      phone: faker.phone.number(),
      avatar: "",
      isActive: true,
      lastLogin: randomDate(30),
      createdAt: randomDate(120),
      updatedAt: new Date(),
    })),
  ]);

  const admin = users[0];
  const staff = users[1];
  console.log(`   ${users.length} users seeded`);

  // ── Categories ─────────────────────────────────────────────────
  console.log("Seeding categories...");
  const categoryNames = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Office Supplies",
    "Furniture",
    "Tools & Hardware",
    "Health & Beauty",
    "Sports & Outdoors",
  ];

  const categories = await Category.insertMany(
    categoryNames.map((name) => ({
      name,
      description: faker.lorem.sentence(),
      isActive: true,
      createdBy: admin._id,
      createdAt: randomDate(180),
      updatedAt: new Date(),
    }))
  );
  console.log(`   ${categories.length} categories seeded`);

  // ── Suppliers ──────────────────────────────────────────────────
  console.log("Seeding suppliers...");
  const suppliers = await Supplier.insertMany(
    Array.from({ length: 8 }, () => ({
      name: faker.company.name(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      contactPerson: faker.person.fullName(),
      isActive: true,
      createdBy: admin._id,
      createdAt: randomDate(180),
      updatedAt: new Date(),
    }))
  );
  console.log(`   ${suppliers.length} suppliers seeded`);

  // ── Products ───────────────────────────────────────────────────
  console.log("Seeding products...");

  const productData = [
    ["Laptop Pro 15", "Electronics"],
    ["Wireless Mouse", "Electronics"],
    ["USB-C Hub", "Electronics"],
    ["Mechanical Keyboard", "Electronics"],
    ["4K Monitor", "Electronics"],
    ["Noise Cancelling Headphones", "Electronics"],
    ["Webcam HD 1080p", "Electronics"],
    ["Bluetooth Speaker", "Electronics"],
    ["Men's Casual T-Shirt", "Clothing"],
    ["Women's Running Shoes", "Clothing"],
    ["Denim Jacket", "Clothing"],
    ["Sports Hoodie", "Clothing"],
    ["Mineral Water 1L", "Food & Beverages"],
    ["Organic Green Tea", "Food & Beverages"],
    ["Protein Bar Pack", "Food & Beverages"],
    ["Instant Coffee 200g", "Food & Beverages"],
    ["A4 Paper Ream", "Office Supplies"],
    ["Ballpoint Pen Set", "Office Supplies"],
    ["Stapler Heavy Duty", "Office Supplies"],
    ["Whiteboard Markers", "Office Supplies"],
    ["Ergonomic Office Chair", "Furniture"],
    ["Standing Desk", "Furniture"],
    ["3-Drawer Filing Cabinet", "Furniture"],
    ["Bookshelf 5-Tier", "Furniture"],
    ["Power Drill Set", "Tools & Hardware"],
    ["Screwdriver Kit", "Tools & Hardware"],
    ["Measuring Tape 5m", "Tools & Hardware"],
    ["Safety Gloves", "Tools & Hardware"],
    ["Face Moisturizer SPF50", "Health & Beauty"],
    ["Vitamin C Supplements", "Health & Beauty"],
    ["Yoga Mat Premium", "Sports & Outdoors"],
    ["Resistance Bands Set", "Sports & Outdoors"],
    ["Water Bottle 750ml", "Sports & Outdoors"],
    ["Running Armband", "Sports & Outdoors"],
    ["Smart Watch", "Electronics"],
    ["Phone Stand Adjustable", "Electronics"],
    ["Laptop Bag 15inch", "Clothing"],
    ["Cotton Socks 5-Pack", "Clothing"],
    ["Energy Drink 250ml", "Food & Beverages"],
    ["Notebook A5", "Office Supplies"],
    ["Desk Lamp LED", "Furniture"],
    ["Paint Brush Set", "Tools & Hardware"],
    ["Hand Sanitizer 500ml", "Health & Beauty"],
    ["Dumbbells 5kg Pair", "Sports & Outdoors"],
    ["Cable Organizer", "Office Supplies"],
    ["Ethernet Cable 10m", "Electronics"],
    ["Wireless Charger", "Electronics"],
    ["Skipping Rope", "Sports & Outdoors"],
    ["Lip Balm Set", "Health & Beauty"],
    ["Coffee Mug 350ml", "Food & Beverages"],
  ];

  const units = ["pcs", "box", "pack", "kg"];

  const products = await Product.insertMany(
    productData.map(([name, category], i) => {
      const price = parseFloat(faker.commerce.price({ min: 5, max: 500 }));
      const cost = parseFloat((price * faker.number.float({ min: 0.4, max: 0.7 })).toFixed(2));
      const isLowStock = i < 6;
      const quantity = isLowStock
        ? faker.number.int({ min: 0, max: 8 })
        : faker.number.int({ min: 20, max: 150 });
      const threshold = faker.number.int({ min: 10, max: 20 });

      return {
        name,
        sku: `SKU-${String(i + 1).padStart(4, "0")}`,
        barcode: `BC${String(i + 1).padStart(6, "0")}`,
        description: faker.commerce.productDescription(),
        category,
        brand: faker.company.name(),
        price,
        costPrice: cost,
        quantity,
        unit: pick(units),
        lowStockThreshold: threshold,
        supplier: pick(suppliers)._id,
        image: "",
        isActive: true,
        createdBy: pick([admin._id, staff._id]),
        createdAt: randomDate(150),
        updatedAt: new Date(),
      };
    })
  );
  console.log(`   ${products.length} products seeded`);

  // ── Customers ──────────────────────────────────────────────────
  console.log("Seeding customers...");
  const fixedCustomers = [
    {
      name: "Ahmed Khan",
      email: "ahmed.khan@email.com",
      phone: "+92 321 5550101",
      type: "individual",
      address: {
        street: "12 Mall Road",
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
        postalCode: "54000",
      },
      creditLimit: 50000,
      outstandingBalance: 0,
      totalPurchases: 0,
      totalSpent: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "Sara Malik",
      email: "sara.malik@email.com",
      phone: "+92 333 5550202",
      type: "individual",
      address: {
        street: "45 Clifton Block 5",
        city: "Karachi",
        state: "Sindh",
        country: "Pakistan",
        postalCode: "75600",
      },
      creditLimit: 25000,
      outstandingBalance: 3500,
      totalPurchases: 0,
      totalSpent: 0,
      isActive: true,
      createdBy: staff._id,
    },
    {
      name: "TechZone Retail",
      email: "orders@techzone.pk",
      phone: "+92 42 35789012",
      type: "business",
      companyName: "TechZone Retail Pvt Ltd",
      taxNumber: "NTN-1234567-8",
      address: {
        street: "Plot 88 Industrial Area",
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
        postalCode: "54770",
      },
      creditLimit: 200000,
      outstandingBalance: 12500,
      totalPurchases: 0,
      totalSpent: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "GreenMart Superstore",
      email: "procurement@greenmart.pk",
      phone: "+92 51 2345678",
      type: "business",
      companyName: "GreenMart Superstore",
      taxNumber: "NTN-9876543-2",
      address: {
        street: "Blue Area Sector F-6",
        city: "Islamabad",
        state: "ICT",
        country: "Pakistan",
        postalCode: "44000",
      },
      creditLimit: 150000,
      outstandingBalance: 0,
      totalPurchases: 0,
      totalSpent: 0,
      isActive: true,
      createdBy: admin._id,
    },
  ];

  const generatedCustomers = Array.from({ length: 16 }, () => {
    const isBusiness = Math.random() > 0.65;
    return {
      name: isBusiness ? faker.company.name() : faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      type: isBusiness ? "business" : "individual",
      companyName: isBusiness ? faker.company.name() : undefined,
      taxNumber: isBusiness ? `NTN-${faker.string.numeric(7)}-${faker.string.numeric(1)}` : undefined,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: "Pakistan",
        postalCode: faker.location.zipCode(),
      },
      creditLimit: faker.number.int({ min: 10000, max: 100000 }),
      outstandingBalance: faker.helpers.maybe(() => faker.number.int({ min: 1000, max: 15000 }), {
        probability: 0.3,
      }) || 0,
      totalPurchases: 0,
      totalSpent: 0,
      note: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
      isActive: true,
      createdBy: pick([admin._id, staff._id]),
      createdAt: randomDate(120),
      updatedAt: new Date(),
    };
  });

  const customers = await Customer.insertMany([...fixedCustomers, ...generatedCustomers]);
  console.log(`   ${customers.length} customers seeded`);

  // ── Sales ──────────────────────────────────────────────────────
  console.log("Seeding sales...");
  const paymentMethods = ["cash", "card", "bank_transfer", "cheque", "other"];
  const saleStatuses = ["completed", "completed", "completed", "completed", "pending", "cancelled"];
  const sales = [];

  for (let i = 0; i < 45; i++) {
    const customer = pick(customers);
    const saleProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 4 }));
    const items = saleProducts.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const discount = Math.random() > 0.8 ? faker.number.int({ min: 5, max: 15 }) : 0;
      const unitPrice = product.price;
      const total = parseFloat((unitPrice * quantity * (1 - discount / 100)).toFixed(2));

      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        discount,
        costPrice: product.costPrice || unitPrice * 0.6,
        total,
      };
    });

    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const taxRate = Math.random() > 0.7 ? 17 : 0;
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));
    const status = pick(saleStatuses);
    const paymentStatus =
      status === "cancelled" ? "cancelled" : status === "pending" ? "pending" : "paid";
    const amountPaid = paymentStatus === "paid" ? total : paymentStatus === "pending" ? 0 : total * 0.5;
    const saleDate = randomDate(60);

    sales.push({
      invoiceNumber: `INV-${String(i + 1).padStart(4, "0")}`,
      customer: customer._id,
      customerName: customer.name,
      items,
      subtotal,
      discountAmount: 0,
      taxRate,
      taxAmount,
      total,
      paymentMethod: pick(paymentMethods),
      paymentStatus,
      amountPaid,
      amountDue: Math.max(0, total - amountPaid),
      status,
      note: Math.random() > 0.75 ? faker.lorem.sentence() : undefined,
      soldBy: pick([admin._id, staff._id]),
      createdAt: saleDate,
      updatedAt: saleDate,
    });
  }

  const insertedSales = await Sale.insertMany(sales);

  const customerStats = {};
  for (const sale of insertedSales) {
    if (sale.status !== "completed") continue;
    const id = sale.customer.toString();
    if (!customerStats[id]) {
      customerStats[id] = { totalPurchases: 0, totalSpent: 0, lastPurchaseDate: sale.createdAt };
    }
    customerStats[id].totalPurchases += 1;
    customerStats[id].totalSpent += sale.total;
    if (sale.createdAt > customerStats[id].lastPurchaseDate) {
      customerStats[id].lastPurchaseDate = sale.createdAt;
    }
  }

  await Promise.all(
    Object.entries(customerStats).map(([customerId, stats]) =>
      Customer.findByIdAndUpdate(customerId, {
        totalPurchases: stats.totalPurchases,
        totalSpent: parseFloat(stats.totalSpent.toFixed(2)),
        lastPurchaseDate: stats.lastPurchaseDate,
      })
    )
  );
  console.log(`   ${insertedSales.length} sales seeded`);

  // ── Purchase Orders ────────────────────────────────────────────
  console.log("Seeding purchase orders...");
  const purchaseStatuses = ["pending", "ordered", "partial", "received", "received", "cancelled"];
  const paymentStatuses = ["unpaid", "partial", "paid"];
  const purchases = [];

  for (let i = 0; i < 18; i++) {
    const supplier = pick(suppliers);
    const poProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 5 }));
    const status = pick(purchaseStatuses);

    const items = poProducts.map((product) => {
      const quantity = faker.number.int({ min: 5, max: 40 });
      const unitCost = product.costPrice || product.price * 0.6;
      const receivedQuantity =
        status === "received"
          ? quantity
          : status === "partial"
            ? faker.number.int({ min: 1, max: quantity - 1 })
            : 0;

      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitCost,
        total: parseFloat((unitCost * quantity).toFixed(2)),
        receivedQuantity,
      };
    });

    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const taxRate = Math.random() > 0.6 ? 17 : 0;
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const shippingCost = faker.number.int({ min: 0, max: 500 });
    const total = parseFloat((subtotal + taxAmount + shippingCost).toFixed(2));
    const paymentStatus = pick(paymentStatuses);
    const amountPaid =
      paymentStatus === "paid" ? total : paymentStatus === "partial" ? total * 0.5 : 0;
    const poDate = randomDate(90);

    purchases.push({
      purchaseNumber: `PO-${String(i + 1).padStart(4, "0")}`,
      supplier: supplier._id,
      items,
      subtotal,
      taxRate,
      taxAmount,
      shippingCost,
      total,
      status,
      paymentStatus,
      paymentMethod: pick(["cash", "card", "bank_transfer", "cheque"]),
      amountPaid,
      amountDue: Math.max(0, total - amountPaid),
      expectedDeliveryDate: status === "received" ? undefined : futureDate(21),
      receivedAt: status === "received" ? poDate : undefined,
      note: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
      createdBy: pick([admin._id, staff._id]),
      createdAt: poDate,
      updatedAt: poDate,
    });
  }

  const insertedPurchases = await Purchase.insertMany(purchases);
  console.log(`   ${insertedPurchases.length} purchase orders seeded`);

  // ── Stock Logs ─────────────────────────────────────────────────
  console.log("Seeding stock logs...");
  const types = ["in", "out", "adjustment"];
  const reasonsIn = ["purchase", "return"];
  const reasonsOut = ["sale", "damaged", "lost"];

  const stockLogs = [];
  for (const product of products) {
    const count = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < count; i++) {
      const type = pick(types);
      const qty = faker.number.int({ min: 1, max: 30 });
      const prevQty = faker.number.int({ min: 0, max: 100 });
      let newQty;
      let reason;

      if (type === "in") {
        newQty = prevQty + qty;
        reason = pick(reasonsIn);
      } else if (type === "out") {
        newQty = Math.max(0, prevQty - qty);
        reason = pick(reasonsOut);
      } else {
        newQty = faker.number.int({ min: 0, max: 100 });
        reason = "correction";
      }

      stockLogs.push({
        product: product._id,
        type,
        quantity: qty,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason,
        note: Math.random() > 0.5 ? faker.lorem.sentence() : "",
        reference: Math.random() > 0.6 ? `REF-${faker.string.alphanumeric(6).toUpperCase()}` : "",
        createdBy: pick([admin._id, staff._id]),
        createdAt: randomDate(90),
      });
    }
  }

  await StockLog.insertMany(stockLogs);
  console.log(`   ${stockLogs.length} stock logs seeded`);

  // ── Notifications ──────────────────────────────────────────────
  console.log("Seeding notifications...");
  const notifications = [];

  const lowStockProducts = products.filter((p) => p.quantity <= p.lowStockThreshold);
  for (const product of lowStockProducts) {
    for (const user of [admin, staff]) {
      notifications.push({
        type: product.quantity === 0 ? "out_of_stock" : "low_stock",
        title: product.quantity === 0 ? "Out of Stock Alert" : "Low Stock Alert",
        message: `${product.name} is running low (${product.quantity} units left).`,
        product: product._id,
        user: user._id,
        isRead: Math.random() > 0.5,
        createdAt: randomDate(30),
      });
    }
  }

  for (const user of [admin, staff]) {
    notifications.push({
      type: "system",
      title: "Welcome to StockFlow",
      message: "Your inventory management system is ready to use.",
      product: null,
      user: user._id,
      isRead: false,
      createdAt: randomDate(30),
    });
  }

  await Notification.insertMany(notifications);
  console.log(`   ${notifications.length} notifications seeded`);

  console.log("\nDatabase seeded successfully!");
  console.log(`   Users            : ${users.length}`);
  console.log(`   Categories       : ${categories.length}`);
  console.log(`   Suppliers        : ${suppliers.length}`);
  console.log(`   Products         : ${products.length}`);
  console.log(`   Customers        : ${customers.length}`);
  console.log(`   Sales            : ${insertedSales.length}`);
  console.log(`   Purchase Orders  : ${insertedPurchases.length}`);
  console.log(`   Stock Logs       : ${stockLogs.length}`);
  console.log(`   Notifications    : ${notifications.length}`);
  console.log("\nLogin credentials:");
  console.log("   Admin  ->  admin@stockflow.com  /  admin123");
  console.log("   Staff  ->  staff@stockflow.com  /  staff123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
