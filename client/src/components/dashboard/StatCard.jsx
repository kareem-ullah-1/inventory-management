export default function StatCard({ label, value, icon: Icon, accent = "slate" }) {
  const accentMap = {
    slate: "bg-slate-100 text-slate-900",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
      {Icon && (
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            accentMap[accent] || accentMap.slate
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
