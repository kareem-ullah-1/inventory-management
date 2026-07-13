import Supplier from "../models/Supplier.js";

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create supplier",
      error: error.message,
    });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    } else {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Supplier.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
      error: error.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch supplier",
      error: error.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
      error: error.message,
    });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
};

export {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};