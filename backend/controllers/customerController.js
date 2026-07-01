import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      type,
      companyName,
      taxNumber,
      creditLimit,
      note,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (email) {
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A customer with this email already exists",
        });
      }
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      type,
      companyName,
      taxNumber,
      creditLimit,
      note,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const {
      search,
      type,
      isActive,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { email:       { $regex: search, $options: "i" } },
        { phone:       { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      customers,
    });
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const history = await Sale.find({ customer: req.params.id })
      .populate("soldBy", "name")
      .sort({ createdAt: -1 })
      .select("invoiceNumber total totalAmount status paymentStatus createdAt items");

    res.status(200).json({
      success: true,
      customer,
      history,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      type,
      companyName,
      taxNumber,
      creditLimit,
      note,
      isActive,
    } = req.body;

    if (email) {
      const existing = await Customer.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A customer with this email already exists",
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        address,
        type,
        companyName,
        taxNumber,
        creditLimit,
        note,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const hasSales = await Sale.exists({ customer: req.params.id });
    if (hasSales) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete customer with existing sales records. Deactivate instead.",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

const getCustomerPurchaseHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sales, total] = await Promise.all([
      Sale.find({ customer: req.params.id })
        .populate("soldBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("invoiceNumber total status paymentStatus createdAt items"),
      Sale.countDocuments({ customer: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        totalPurchases: customer.totalPurchases,
        totalSpent: customer.totalSpent,
        outstandingBalance: customer.outstandingBalance,
        lastPurchaseDate: customer.lastPurchaseDate,
      },
      count: sales.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      sales,
    });
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer purchase history",
      error: error.message,
    });
  }
};

const getCustomerStats = async (req, res) => {
  try {
    const [stats, topCustomers] = await Promise.all([
      Customer.aggregate([
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: ["$isActive", 1, 0] },
            },
            totalOutstanding: { $sum: "$outstandingBalance" },
            totalRevenue: { $sum: "$totalSpent" },
          },
        },
      ]),

      Customer.find({ isActive: true })
        .sort({ totalSpent: -1 })
        .limit(5)
        .select("name email totalSpent totalPurchases lastPurchaseDate"),
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalCustomers: 0,
        activeCustomers: 0,
        totalOutstanding: 0,
        totalRevenue: 0,
      },
      topCustomers,
    });
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer stats",
      error: error.message,
    });
  }
};

export {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory,
  getCustomerStats,
};