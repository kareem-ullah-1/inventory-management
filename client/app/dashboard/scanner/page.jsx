"use client";

import { useEffect, useRef, useState } from "react";
import { useProducts, useUpdateProduct } from "../../../src/hooks/useProducts";
import { useCreateSale } from "../../../src/hooks/useSales";
import { Camera, Scan, AlertCircle, ShoppingBag, Plus, Sparkles, RefreshCw } from "lucide-react";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import { toast } from "../../../src/components/layout/Toast";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";

export default function ScannerPage() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scanQty, setScanQty] = useState(1);
  const [loadingCamera, setLoadingCamera] = useState(false);

  const { data, isLoading } = useProducts();
  const updateProductMutation = useUpdateProduct();
  const sellMutation = useCreateSale();

  const products = data?.products || [];

  // Start Browser Camera stream
  const startCamera = async () => {
    setLoadingCamera(true);
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setCameraError("Camera capture interface not supported by this browser.");
      }
    } catch (err) {
      setCameraError("Camera access denied or device is not available. Using simulated scan mode.");
    } finally {
      setLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Handle Mock Barcode Scanning
  const handleSimulateScan = (productId) => {
    const prod = products.find((p) => p._id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setScanQty(1);
      toast.success(`Successfully decoded barcode: ${prod.sku}`);
    }
  };

  const handleQuickRestock = () => {
    if (!selectedProduct) return;
    const newQty = selectedProduct.quantity + parseInt(scanQty);

    updateProductMutation.mutate(
      {
        id: selectedProduct._id,
        data: { quantity: newQty },
      },
      {
        onSuccess: (res) => {
          toast.success(`Restocked ${scanQty} units of ${selectedProduct.name}`);
          setSelectedProduct(res.product);
        },
        onError: () => {
          toast.error("Failed to restock product");
        },
      }
    );
  };

  const handleQuickSell = () => {
    if (!selectedProduct) return;
    if (selectedProduct.quantity < scanQty) {
      toast.error("Insufficient stock to process this quick sale");
      return;
    }

    const payload = {
      items: [
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          quantity: parseInt(scanQty),
          price: selectedProduct.price,
        },
      ],
      paymentMethod: "Cash",
    };

    sellMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`Successfully sold ${scanQty} units of ${selectedProduct.name}`);
        // Deduct quantity locally to show update
        setSelectedProduct((prev) => ({
          ...prev,
          quantity: prev.quantity - parseInt(scanQty),
        }));
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to process sale");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Barcode Scanning terminal</h1>
        <p className="text-sm text-slate-500">Scan product packaging labels to rapidly sell or restock items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Camera Viewport (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg relative flex flex-col items-center justify-center min-h-[350px]">
          {stream ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto object-cover max-h-[350px]"
              />
              {/* Scan Overlay Laser Line */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] animate-bounce top-1/2" />
              <div className="absolute inset-4 border-2 border-emerald-500/20 pointer-events-none rounded-lg" />
              <div className="absolute top-3 left-3 bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Scan className="w-3 h-3 animate-pulse" />
                Live Viewport Active
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-450 space-y-4">
              <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Camera Viewport Offline</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {cameraError || "Loading camera stream, please allow permissions."}
                </p>
              </div>
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-1 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Camera Connection
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Simulation & Resolved Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulation controller */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Simulated Barcode Scan
            </h3>
            <p className="text-xs text-slate-500">
              Pick a product below to trigger a simulated scan decode. This acts as if a physical laser gun read the product's barcode label.
            </p>
            {isLoading ? (
              <SkeletonLoader variant="list" rows={2} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSimulateScan(p._id)}
                    className="text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 p-2.5 rounded-lg transition"
                  >
                    <p className="font-bold text-slate-850 truncate">{p.name}</p>
                    <code className="text-[10px] text-slate-450 mt-0.5 block">{p.sku}</code>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resolved product info */}
          {selectedProduct ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scan Match Found</span>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">{selectedProduct.name}</h3>
                  <code className="text-xs font-semibold text-slate-500">{selectedProduct.sku}</code>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedProduct.price)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                    selectedProduct.quantity <= selectedProduct.minStock
                      ? "bg-amber-50 text-amber-750 border border-amber-100"
                      : "bg-emerald-50 text-emerald-750 border border-emerald-100"
                  }`}>
                    {selectedProduct.quantity} units in stock
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 bg-slate-50 p-3 rounded-lg">
                <p>Category: <span className="text-slate-850">{selectedProduct.category}</span></p>
                <p>Supplier: <span className="text-slate-850">{selectedProduct.supplier}</span></p>
              </div>

              {/* Action register */}
              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800">Quick Actions</h4>
                
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={scanQty}
                      onChange={(e) => setScanQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2 pt-4">
                    <button
                      onClick={handleQuickSell}
                      className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Quick Sell
                    </button>
                    <button
                      onClick={handleQuickRestock}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Quick Restock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              <Scan className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">No Product Scanned</p>
              <p className="text-[10px] text-slate-550 mt-0.5">
                Use the mock simulation selector or align a barcode label in front of the active camera.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
