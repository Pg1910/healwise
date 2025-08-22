import RiskBadge from "./RiskBadge";
import EmotionBar from "./EmotionBar";

export default function AnalysisCard({ analysis }) {
  if (!analysis) return null;
  const { probs = {}, risk, supportive_message, suggested_next_steps = [], helpful_resources = [] } = analysis;

  const emotions = Object.entries(probs); // [["sadness",0.73],...]

  return (
    <div className="mt-3 bg-white rounded-2xl shadow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Screening Summary</h3>
        <RiskBadge risk={risk} />
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <p className="text-indigo-900 leading-snug">{supportive_message}</p>
      </div>

      {emotions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top emotions</h4>
          {emotions.map(([label, val]) => (
            <EmotionBar key={label} label={label} value={val} />
          ))}
        </div>
      )}

      {suggested_next_steps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggested next steps</h4>
          <ul className="list-disc ml-5 space-y-1">
            {suggested_next_steps.map((a, i) => (
              <li key={i} className="text-sm text-gray-800">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {helpful_resources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Helpful resources</h4>
          <div className="space-y-2">
            {helpful_resources.map((doc, i) => (
              <details key={i} className="bg-gray-50 rounded-xl p-3">
                <summary className="cursor-pointer text-sm font-medium">Resource {i + 1}</summary>
                <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{doc}</div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
