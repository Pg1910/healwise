const COLORS = {
  NONE: "bg-gray-200 text-gray-800",
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRISIS: "bg-red-100 text-red-800",
};

export default function RiskBadge({ risk = "NONE" }) {
  const cls = COLORS[risk] || COLORS.NONE;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>
      {risk}
    </span>
  );
}
