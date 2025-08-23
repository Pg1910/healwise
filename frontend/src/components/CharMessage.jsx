import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Heart } from "lucide-react";

export default function ChatMessage({ role, message, steps = [], resources = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} my-2`}
    >
      <Card
        className={`max-w-lg p-3 rounded-2xl shadow-md ${
          role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <CardContent className="space-y-2">
          {/* Main supportive message */}
          <p className="text-base leading-relaxed">{message}</p>

          {/* Suggested next steps */}
          {steps.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 font-medium text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Suggested Steps
              </div>
              <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
                {steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Helpful resources */}
          {resources.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 font-medium text-sm text-gray-600">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Helpful Resources
              </div>
              <ul className="mt-1 space-y-1 text-sm">
                {resources.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {r}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
