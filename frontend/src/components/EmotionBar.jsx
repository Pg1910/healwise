export default function EmotionBar({ label, value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize">{label.replace("_", " ")}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
