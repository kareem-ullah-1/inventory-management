"use client";

export const showToast = (message, type = "info") => {
  if (typeof window === "undefined") return;

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none";
    document.body.appendChild(container);
  }

  const toastNode = document.createElement("div");
  // Set styling classes
  const baseClasses = "p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center justify-between gap-4";
  let themeClasses = "";
  
  if (type === "success") {
    themeClasses = "bg-emerald-50 border-emerald-200 text-emerald-800";
  } else if (type === "error") {
    themeClasses = "bg-red-50 border-red-200 text-red-800";
  } else if (type === "warning") {
    themeClasses = "bg-amber-50 border-amber-200 text-amber-800";
  } else {
    themeClasses = "bg-slate-800 border-slate-700 text-white";
  }

  toastNode.className = `${baseClasses} ${themeClasses}`;
  toastNode.innerHTML = `
    <div class="flex-1">${message}</div>
    <button class="text-current opacity-60 hover:opacity-100 font-bold shrink-0 ml-1">&times;</button>
  `;

  container.appendChild(toastNode);

  // Trigger reflow for slide-in animation
  toastNode.offsetHeight;
  toastNode.classList.remove("translate-y-2", "opacity-0");

  const closeToast = () => {
    toastNode.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => {
      if (toastNode.parentNode) {
        container.removeChild(toastNode);
      }
    }, 300);
  };

  toastNode.querySelector("button").onclick = closeToast;
  setTimeout(closeToast, 4000);
};

export const toast = {
  success: (msg) => showToast(msg, "success"),
  error: (msg) => showToast(msg, "error"),
  warning: (msg) => showToast(msg, "warning"),
  info: (msg) => showToast(msg, "info"),
};
