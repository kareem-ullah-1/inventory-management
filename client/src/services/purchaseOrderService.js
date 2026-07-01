import axiosInstance from "../lib/axios";

const normalizePurchaseOrder = (purchase) => {
  if (!purchase) return null;
  return {
    ...purchase,
    _id: purchase._id || purchase.id,
    orderNumber: purchase.orderNumber || purchase.purchaseNumber || purchase.order_number,
    totalAmount: purchase.totalAmount || purchase.total || purchase.total_amount,
    status: purchase.status || purchase.orderStatus || "pending",
    supplier: purchase.supplier || null,
    items: purchase.items || [],
    createdAt: purchase.createdAt || purchase.created_at,
    receivedAt: purchase.receivedAt || purchase.received_at,
  };
};

export const purchaseOrderService = {
  getPurchaseOrders: async (params = {}) => {
    const res = await axiosInstance.get("/purchases", { params });
    const data = res.data;
    if (data.purchaseOrders) return data;
    return {
      purchaseOrders: (data.purchases || []).map(normalizePurchaseOrder),
      count: data.count,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  },

  getPurchaseOrderById: async (id) => {
    const res = await axiosInstance.get(`/purchases/${id}`);
    const data = res.data;
    if (data.purchaseOrder) return data;
    return { purchaseOrder: normalizePurchaseOrder(data.purchase) };
  },

  createPurchaseOrder: async (data) => {
    const payload = {
      supplier: data.supplierId || data.supplier,
      items: (data.items || []).map((item) => ({
        product: item.productId || item.product,
        quantity: item.quantity,
        unitCost: item.cost,
      })),
    };

    const res = await axiosInstance.post("/purchases", payload);
    const response = res.data;
    if (response.purchaseOrder) return response;
    return { purchaseOrder: normalizePurchaseOrder(response.purchase) };
  },

  updatePurchaseOrderStatus: async (id, status) => {
    const res = await axiosInstance.put(`/purchases/${id}`, { status });
    const data = res.data;
    if (data.purchaseOrder) return data;
    return { purchaseOrder: normalizePurchaseOrder(data.purchase) };
  },

updateStatus: async (id, status) => {
  // Build receivedItems from all items at full quantity
  const detailRes = await axiosInstance.get(`/purchases/${id}`);
  const purchase = detailRes.data.purchase;

  const receivedItems = purchase.items.map((item) => ({
    productId: item.product._id || item.product,
    quantity: item.quantity - (item.receivedQuantity || 0),
  }));

  const res = await axiosInstance.put(`/purchases/${id}/receive`, {
    receivedItems,
  });
  const data = res.data;
  if (data.purchase) return data;
  return { purchaseOrder: normalizePurchaseOrder(data.purchase) };
},
};