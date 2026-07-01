import Invoice from "../models/Invoice";
import Sale from "../models/Sales";

 const createInvoice = async (req, res) => {
  try {
    const { saleId, dueDate } = req.body;

    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      sale: sale._id,
      customer: sale.customer,
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount,
      discountAmount: sale.discountAmount,
      total: sale.total,
      paymentStatus: sale.paymentStatus,
      dueDate,
      generatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 const getInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate("customer", "name")
    .populate("generatedBy", "name")
    .sort("-createdAt");

  res.json({
    success: true,
    invoices,
  });
};

 const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("sale")
    .populate("customer");

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({
    success: true,
    invoice,
  });
};

 const updatePaymentStatus = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  invoice.paymentStatus = req.body.paymentStatus;

  await invoice.save();

  res.json({
    success: true,
    invoice,
  });
};

 const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  await invoice.deleteOne();

  res.json({
    success: true,
    message: "Invoice deleted",
  });
};

export { createInvoice, getInvoices, getInvoiceById, updatePaymentStatus, deleteInvoice };