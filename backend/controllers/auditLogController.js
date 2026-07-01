import AuditLog from "../models/AuditLog.js";
// Helper to create audit log entries — call this from other controllers
export const createAuditLog = async ({ action, details, userId, req, resource, resourceId, status = "success" }) => {
  try {
    await AuditLog.create({
      action,
      details,
      user: userId,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "unknown",
      userAgent: req?.headers?.["user-agent"] || "unknown",
      resource: resource || "system",
      resourceId: resourceId?.toString(),
      status,
    });
  } catch (err) {
    console.log("Failed to create audit log:", err);
  }
};

// GET /api/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const {
      search,
      action,
      userId,
      resource,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    if (action) query.action = { $regex: action, $options: "i" };
    if (userId) query.user = userId;
    if (resource) query.resource = resource;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [auditLogs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      auditLogs,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// DELETE /api/audit-logs (admin only — clear old logs)
const clearAuditLogs = async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(olderThanDays));

    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} audit log entries older than ${olderThanDays} days`,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to clear audit logs",
      error: error.message,
    });
  }
};

export { getAuditLogs, clearAuditLogs };