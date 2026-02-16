"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BucketScoreCardProps {
  label: string;
  score: number;
  category: string;
  rationale: string;
  isSelected: boolean;
  onCategoryClick: (category: string) => void;
}

export function BucketScoreCard({
  label,
  score,
  category,
  rationale,
  isSelected,
  onCategoryClick
}: BucketScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" };
    if (score >= 60) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" };
    return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50" };
  };

  const colors = getScoreColor(score);

  return (
    <Card
      className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected
          ? "border-purple-400 bg-purple-50 shadow-lg ring-4 ring-purple-200"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
      }`}
      onClick={() => onCategoryClick(category)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-2">{label}</h3>

            {/* Score Bar */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bg} transition-all duration-500 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Score Badge */}
          <div className="ml-4 flex flex-col items-end">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {score}
              <span className="text-base">%</span>
            </div>
            <Badge className={`text-xs mt-1 ${colors.light} ${colors.text} border-transparent`}>
              {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs work"}
            </Badge>
          </div>
        </div>

        {/* Sparkline visualization */}
        <div className="flex items-center gap-1 h-8">
          {Array.from({ length: 10 }).map((_, i) => {
            const barHeight = score >= (i + 1) * 10 ? ((i + 1) * 10) / 100 : 0;
            return (
              <div
                key={`sparkline-${category}-${i}`}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  score >= (i + 1) * 10 ? colors.bg : "bg-gray-200"
                }`}
                style={{
                  height: `${20 + barHeight * 80}%`,
                  opacity: score >= (i + 1) * 10 ? 1 : 0.3
                }}
              />
            );
          })}
        </div>

        {/* View Rationale Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="group-hover:underline">{isExpanded ? "Hide" : "View"} rationale</span>
        </button>

        {/* Expandable Rationale */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className={`p-4 ${colors.light} rounded-xl border border-gray-200 mt-2`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Manager's audit rationale</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{rationale}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
