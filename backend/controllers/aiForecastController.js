import {
  forecastProductDemand,
  forecastLowStockProducts,
  analyzeInventoryHealth,
  forecastSalesTrend,
} from "../services/aiForecastService.js";

// Forecast a single product
export const getProductForecast = async (req, res) => {
  try {
    const { productId } = req.params;

    const forecast = await forecastProductDemand(productId);

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Product Forecast Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forecast all low stock products
export const getLowStockForecast = async (req, res) => {
  try {
    const forecasts = await forecastLowStockProducts();

    res.status(200).json({
      success: true,
      count: forecasts.length,
      data: forecasts,
    });
  } catch (error) {
    console.error("Low Stock Forecast Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Inventory health analysis
export const getInventoryHealth = async (req, res) => {
  try {
    const analysis = await analyzeInventoryHealth();

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Inventory Health Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sales trend forecast
export const getSalesForecast = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const forecast = await forecastSalesTrend(Number(days));

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Sales Forecast Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};