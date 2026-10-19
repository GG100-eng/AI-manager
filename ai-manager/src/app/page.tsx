"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadarChart } from "@/components/RadarChart";
import { BucketScoreCard } from "@/components/BucketScoreCard";

// ============================================
// SCENARIO STATES - Dynamic State Management
// ============================================
type ScenarioState = "critical-gaps" | "nitpick-mode" | "access-denied" | "logic-audit" | "interrogation" | "insufficient-depth";

type VerdictType = "strong-yes" | "yes" | "not-yet-hireable";

interface BucketScore {
  label: string;
  score: number;
  category: string;
  rationale: string;
}

interface ScenarioConfig {
  id: ScenarioState;
  name: string;
  score: number;
  verdict: string;
  verdictType: VerdictType;
  verdictColor: string;
  verdictBg: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  mayaTone: string;
  feedbackData: FeedbackPoint[];
  bucketScores: BucketScore[];
}

// ============================================
// DEV MODE - Technical Requirements
// ============================================
interface DevRequirement {
  id: string;
  component: string;
  requirement: string;
  logic?: string;
  constraints?: string[];
}

const DEV_REQUIREMENTS: DevRequirement[] = [
  {
    id: "overall-score",
    component: "Overall Score/Verdict",
    requirement: "Score Calculation & Hireability Logic",
    logic: "If Score < 80%, show 'Not Yet Hireable' (Red). If >= 80%, show 'Hireable' (Green) and trigger 'Nitpick Mode'.",
    constraints: [
      "Score calculated from weighted average of all feedback points",
      "Success points: +15 points each",
      "Warning points: -20 points each",
      "Info points: +5 points each",
      "Base score starts at 60%"
    ]
  },
  {
    id: "maya-video",
    component: "Maya Video Player",
    requirement: "Video Sync Requirements",
    logic: "Max 120s. Must sync with Feedback Stream timestamps via [Sync-Agent].",
    constraints: [
      "Video duration must not exceed 120 seconds",
      "Timestamp precision: 0.1 seconds",
      "Sync-Agent polls currentTime every 100ms",
      "Subtitle updates trigger on timestamp match",
      "Auto-pause at end of duration"
    ]
  },
  {
    id: "action-plan",
    component: "Action plan button",
    requirement: "Visibility logic",
    logic: "Visible only if Intermediate Checker confirms no 'Dead-end' critiques.",
    constraints: [
      "Intermediate Checker scans all warning-type feedback",
      "Dead-end critique: Any warning without actionPlan array",
      "Button disabled if < 2 actionable items exist",
      "Must have at least 1 success point to show"
    ]
  }
];

// ============================================
// DEV MODE COMPONENTS
// ============================================
function DevInfoIcon({ requirementId, onClick }: { requirementId: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-400/30 hover:bg-blue-400/50 border border-blue-400/60 backdrop-blur-sm transition-all hover:scale-110 group"
      title="View Technical Requirement"
    >
      <svg className="w-3 h-3 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

function DevDrawer({
  isOpen,
  onClose,
  requirement
}: {
  isOpen: boolean;
  onClose: () => void;
  requirement: DevRequirement | null;
}) {
  if (!isOpen || !requirement) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Dev Mode</Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{requirement.component}</h3>
                <p className="text-sm text-gray-600 mt-1">{requirement.requirement}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Logic Section */}
              {requirement.logic && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Business logic</h4>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <code className="text-sm text-gray-800 leading-relaxed block font-mono">
                      {requirement.logic}
                    </code>
                  </div>
                </div>
              )}

              {/* Constraints Section */}
              {requirement.constraints && requirement.constraints.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Technical constraints</h4>
                  </div>
                  <ul className="space-y-2">
                    {requirement.constraints.map((constraint, i) => (
                      <li key={`constraint-${i}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Implementation Note */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-1">Implementation note</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      These requirements are enforced by the backend evaluation engine. Any changes require coordination with the Sync-Agent and Intermediate Checker modules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: Feb 14, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DevModeToggle({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 glass-card rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">Dev Mode</span>
        <button
          type="button"
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ============================================
// SCENARIO SWITCHER COMPONENT
// ============================================
function ScenarioSwitcher({
  currentScenario,
  onScenarioChange
}: {
  currentScenario: ScenarioState;
  onScenarioChange: (scenario: ScenarioState) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {isExpanded ? (
        <div className="glass-card rounded-2xl p-4 shadow-2xl w-72 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="font-semibold text-gray-800 text-sm">Scenario Switcher</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {Object.values(SCENARIOS).map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => {
                  onScenarioChange(scenario.id);
                  setIsExpanded(false);
                }}
                className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                  currentScenario === scenario.id
                    ? `border-${scenario.theme.primary}-400 ${scenario.verdictBg} shadow-md`
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">{scenario.name}</span>
                  {currentScenario === scenario.id && (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] px-2 py-0.5 ${scenario.verdictBg} ${scenario.verdictColor} border-transparent`}>
                    {scenario.verdict}
                  </Badge>
                  {scenario.id !== "access-denied" && (
                    <span className="text-xs font-bold text-gray-600">{scenario.score}%</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">{scenario.mayaTone}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-purple-700 leading-relaxed">
                <strong>Design review mode:</strong> Test how the UI adapts to different learner outcomes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="glass-card rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105"
        >
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Scenarios</span>
        </button>
      )}
    </div>
  );
}

// ============================================
// LOGIC AUDIT - WORK LOG PANEL
// ============================================
function WorkLogPanel() {
  return (
    <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h4 className="font-semibold text-purple-900 text-sm">Logic pedigree: connected sources</h4>
      </div>

      <div className="space-y-3">
        {/* Connection 1 */}
        <div className="relative">
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-purple-300" />
          <div className="bg-white p-3 rounded-lg border border-purple-200 relative">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Work Log: Nov 12, 2025 - 2:34 PM</p>
                <p className="text-xs text-gray-600 mt-1 italic">Pricing model brainstorm: Starter $49/mo, Pro $149/mo, Enterprise custom. Based on competitor analysis...</p>
              </div>
            </div>
          </div>
          <div className="ml-12 mt-2 p-2 bg-purple-100 rounded-lg border-l-4 border-purple-500">
            <p className="text-xs text-purple-800">
              <span className="font-semibold">✓ Verified Match:</span> Section 4.2 pricing tiers match your original thinking
            </p>
          </div>
        </div>

        {/* Connection 2 */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Research Notes: Gartner Report 2025</p>
              <p className="text-xs text-gray-600 mt-1">"SaaS market TAM: $12.4B (cited on page 47)"</p>
            </div>
          </div>
          <div className="ml-10 mt-2 p-2 bg-emerald-100 rounded-lg border-l-4 border-emerald-500">
            <p className="text-xs text-emerald-800">
              <span className="font-semibold">✓ Citation Valid:</span> Properly attributed source with page reference
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERROGATION CARD
// ============================================
function InterrogationCard({
  point,
  onRespond
}: {
  point: FeedbackPoint;
  onRespond: () => void;
}) {
  const [response, setResponse] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (response.trim().length > 0) {
      setIsSubmitted(true);
      onRespond();
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-300 shadow-lg animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm">{point.title}</h4>
            <Badge className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 border-red-300 animate-pulse">
              Response Required
            </Badge>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{point.description}</p>

          {!isSubmitted ? (
            <div className="space-y-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your defense here... (Minimum 50 words with supporting evidence)"
                className="w-full p-3 border-2 border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {response.trim().split(/\s+/).filter(w => w.length > 0).length} words
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={response.trim().split(/\s+/).filter(w => w.length > 0).length < 10}
                  className="btn-gradient text-white font-semibold rounded-full px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Defense
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-100 rounded-xl border-2 border-emerald-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-emerald-800">
                  Defense submitted. Maya will review and update hireability status.
                </p>
              </div>
            </div>
          )}

          {point.actionPlan && !isSubmitted && (
            <div className="mt-3 p-3 bg-orange-100 rounded-xl border border-orange-200">
              <h5 className="text-xs font-semibold text-orange-800 mb-2">What Maya needs to see:</h5>
              <ul className="space-y-1">
                {point.actionPlan.map((item, i) => (
                  <li key={`interro-plan-${i}`} className="flex items-start gap-2 text-xs text-orange-700">
                    <span className="flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// INSUFFICIENT DEPTH OVERLAY
// ============================================
function InsufficientDepthOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="max-w-2xl w-full">
        {/* Harsh Warning */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Submission rejected
          </h2>
          <p className="text-xl text-gray-300 mb-2">Effort threshold not met</p>
          <div className="inline-block px-4 py-2 bg-gray-800 rounded-full">
            <p className="text-sm font-mono text-gray-400">NO GRADE ISSUED</p>
          </div>
        </div>

        {/* Coach Carter Message */}
        <div className="glass-card bg-gray-900/80 border-2 border-red-500 rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-red-500 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face"
                alt="Maya Chen"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-2">Maya Chen - AI Manager</p>
              <p className="text-red-400 text-sm font-semibold">SERIOUS CONVERSATION MODE</p>
            </div>
          </div>

          <div className="space-y-4 text-white leading-relaxed">
            <p className="text-lg font-semibold">
              This isn't a submission. It's a <span className="text-red-400">draft of a draft</span>.
            </p>
            <p>
              Document is <span className="font-bold text-red-400">147 words</span>. Professional strategy documents are <span className="font-bold">1,500-3,000 words</span> minimum.
            </p>
            <p>
              Come back when you've <span className="text-red-400 font-semibold">done the work</span>. We don't grade laziness.
            </p>
            <div className="p-4 bg-red-950 rounded-xl border-2 border-red-500 mt-6">
              <p className="text-sm font-bold text-red-300 mb-3">Minimum requirements:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>8-10 pages of analysis (you submitted 1 page)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>3+ hours of research (evidence: none)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Cited sources (none provided)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Financial models (not found)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="text-center">
          <Button
            onClick={onDismiss}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg px-12 py-6 rounded-full shadow-2xl"
          >
            I understand. I'll do better.
          </Button>
          <p className="text-gray-400 text-sm mt-4">
            You're better than this. Prove it.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACCESS DENIED MODAL
// ============================================
function AccessDeniedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
          We can't see your work
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6 leading-relaxed">
          Your document permissions are preventing our AI from reviewing your submission. Change permissions to <span className="font-semibold text-gray-900">"Public"</span> or <span className="font-semibold text-gray-900">"Anyone with the link"</span> to receive your audit.
        </p>

        {/* Stat Callout */}
        <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-200 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-900 mb-1">Critical career impact</p>
              <p className="text-sm text-red-700 leading-relaxed">
                <span className="font-bold text-xl text-red-600">30%</span> of junior applications are ghosted purely due to access control errors. Don't let technical friction cost you opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm">How to fix this:</h3>
          <ol className="space-y-2">
            {[
              "Open your document in Figma, Google Docs, or Notion",
              "Click the 'Share' button in the top-right corner",
              "Change permissions to 'Anyone with the link' can view",
              "Re-submit your document link to AI Manager"
            ].map((step, i) => (
              <li key={`step-${i}`} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-full py-5 border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 btn-gradient text-white font-semibold rounded-full py-5"
          >
            I've Fixed Permissions
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DATA STRUCTURE - Evaluation Feedback Points
// ============================================
interface FeedbackPoint {
  id: string;
  timestamp: number; // seconds into the review
  endTimestamp: number;
  category: "hireability" | "technical" | "communication" | "strategy";
  type: "success" | "warning" | "info";
  title: string;
  subtitle: string; // What the AI says (subtitles)
  description: string;
  targetSectionId: string; // Which PDF section to highlight
  actionPlan?: string[]; // Only for critical gaps
  bucketCategory?: "strategic-reasoning" | "real-world-standards" | "delta-from-template" | "ai-nativity" | "presentation";
}

// ============================================
// SCENARIO DATA SETS
// ============================================

// State 1: Critical Gaps (Baseline - Score < 80%)
const CRITICAL_GAPS_DATA: FeedbackPoint[] = [
  {
    id: "cg-1",
    timestamp: 0,
    endTimestamp: 7,
    category: "hireability",
    type: "warning",
    title: "Weak value proposition",
    subtitle: "Executive summary lacks urgency. Fails to define unique value...",
    description: "Executive summary lacks urgency. Fails to define unique value.",
    targetSectionId: "section-executive-summary",
    bucketCategory: "strategic-reasoning",
    actionPlan: [
      "Lead with a compelling problem statement backed by market data",
      "Quantify the pain point (e.g., '$X billion wasted annually')",
      "State your unique insight that others have missed",
      "Show why NOW is the critical timing"
    ],
  },
  {
    id: "cg-2",
    timestamp: 7,
    endTimestamp: 16,
    category: "strategy",
    type: "warning",
    title: "No competitive differentiation",
    subtitle: "Listed competitors but haven't shown why you'll win...",
    description: "Lacks clear differentiation. Signals insufficient market research.",
    targetSectionId: "section-competitive",
    bucketCategory: "delta-from-template",
    actionPlan: [
      "Create a feature comparison matrix (you vs. top 3 competitors)",
      "Identify your unfair advantage or proprietary insight",
      "Show evidence of competitor weaknesses you can exploit",
      "Demonstrate deep understanding of why alternatives fail"
    ],
  },
  {
    id: "cg-3",
    timestamp: 16,
    endTimestamp: 24,
    category: "technical",
    type: "warning",
    title: "Unsupported market sizing",
    subtitle: "TAM/SAM/SOM numbers lack justification...",
    description: "Market sizing lacks bottom-up validation. Data is unverified.",
    targetSectionId: "section-market-analysis",
    bucketCategory: "real-world-standards",
    actionPlan: [
      "Cite specific industry reports (Gartner, McKinsey, etc.)",
      "Show bottom-up calculation: unit economics × addressable customers",
      "Include both top-down and bottom-up approaches",
      "Acknowledge assumptions and potential error margins"
    ],
  },
  {
    id: "cg-4",
    timestamp: 24,
    endTimestamp: 32,
    category: "communication",
    type: "info",
    title: "Dense wall of text",
    subtitle: "Losing the reader with dense paragraphs...",
    description: "Lacks visual breaks. Key insights will be missed.",
    targetSectionId: "section-metrics",
    bucketCategory: "presentation",
  },
  {
    id: "cg-5",
    timestamp: 32,
    endTimestamp: 45,
    category: "hireability",
    type: "warning",
    title: "Missing business model",
    subtitle: "Can't find a clear path to profitability...",
    description: "Business model is missing unit economics. Market rejection risk: High.",
    targetSectionId: "section-competitive",
    bucketCategory: "ai-nativity",
    actionPlan: [
      "Define clear revenue streams and pricing tiers",
      "Show unit economics: CAC, LTV, payback period",
      "Map out 3-year revenue and margin projections",
      "Identify key assumptions and sensitivity analysis"
    ],
  },
];

// State 2: Nitpick Mode (High-Bar - Score > 85%)
const NITPICK_MODE_DATA: FeedbackPoint[] = [
  {
    id: "nm-1",
    timestamp: 0,
    endTimestamp: 8,
    category: "hireability",
    type: "success",
    title: "Compelling executive summary",
    subtitle: "Opening establishes credibility and urgency...",
    description: "Hits all the right notes: clear problem, unique insight, market timing.",
    targetSectionId: "section-executive-summary",
    bucketCategory: "strategic-reasoning",
  },
  {
    id: "nm-2",
    timestamp: 8,
    endTimestamp: 16,
    category: "communication",
    type: "info",
    title: "Optimization: executive presence",
    subtitle: "Language is strong but can be elevated...",
    description: "Refine executive presence. Use more concise, confident language.",
    targetSectionId: "section-executive-summary",
    bucketCategory: "ai-nativity",
    actionPlan: [
      "Replace passive voice with active constructions",
      "Cut unnecessary qualifiers ('very', 'really', 'quite')",
      "Lead sentences with strong action verbs",
      "Reduce word count by 15% without losing meaning"
    ],
  },
  {
    id: "nm-3",
    timestamp: 16,
    endTimestamp: 24,
    category: "strategy",
    type: "success",
    title: "Strong competitive analysis",
    subtitle: "Competitive differentiation is clear and well-researched...",
    description: "Demonstrates deep market understanding. Feature matrix and positioning are solid.",
    targetSectionId: "section-competitive",
    bucketCategory: "delta-from-template",
  },
  {
    id: "nm-4",
    timestamp: 24,
    endTimestamp: 34,
    category: "technical",
    type: "info",
    title: "Optimization: data visualization",
    subtitle: "Data is solid but presentation could be more impactful...",
    description: "Transform tables into visual charts. Executives process visuals faster.",
    targetSectionId: "section-market-analysis",
    bucketCategory: "presentation",
    actionPlan: [
      "Convert TAM/SAM/SOM into a funnel visualization",
      "Use line charts for growth projections",
      "Add a competitive positioning matrix (2x2 grid)",
      "Include an infographic for your business model canvas"
    ],
  },
  {
    id: "nm-5",
    timestamp: 34,
    endTimestamp: 45,
    category: "communication",
    type: "info",
    title: "Optimization: conciseness",
    subtitle: "At 12 pages. Top performers condense to 8-10...",
    description: "Brevity signals confidence. Cut without losing strategic value.",
    targetSectionId: "section-metrics",
    bucketCategory: "real-world-standards",
    actionPlan: [
      "Audit each section: is this 'need to know' or 'nice to know'?",
      "Move supporting data to appendix",
      "Use bullet points instead of paragraphs where possible",
      "Aim for 1 key insight per page"
    ],
  },
];

// State 4: Logic Audit (Forensic Layer - Score 85%)
const LOGIC_AUDIT_DATA: FeedbackPoint[] = [
  {
    id: "la-1",
    timestamp: 0,
    endTimestamp: 10,
    category: "technical",
    type: "success",
    title: "Logic verification: pricing model",
    subtitle: "Verified B2B pricing model against scratchpad notes. Original thinking...",
    description: "Cross-referenced pricing tiers with work log from Nov 12. Math checks out. Reasoning is authentic.",
    targetSectionId: "section-competitive",
  },
  {
    id: "la-2",
    timestamp: 10,
    endTimestamp: 20,
    category: "hireability",
    type: "success",
    title: "Pedigree check: market research",
    subtitle: "TAM calculation traces back to three credible sources...",
    description: "Verified citation chain: Gartner Report → calculations → final TAM of $12B. Methodical research.",
    targetSectionId: "section-market-analysis",
  },
  {
    id: "la-3",
    timestamp: 20,
    endTimestamp: 30,
    category: "strategy",
    type: "info",
    title: "Logic gap: competitor analysis",
    subtitle: "Can't verify competitor weakness claims. No evidence in work log...",
    description: "Competitive weakness claims need supporting evidence. Link to research notes or customer reviews.",
    targetSectionId: "section-competitive",
    actionPlan: [
      "Export screenshots from G2/Capterra reviews mentioning support issues",
      "Link to your research notes documenting competitor pain points",
      "Add timestamps showing when you discovered this insight",
      "Include competitor response time data if available"
    ],
  },
  {
    id: "la-4",
    timestamp: 30,
    endTimestamp: 45,
    category: "communication",
    type: "success",
    title: "Thinking process validated",
    subtitle: "Executive summary mirrors initial brainstorm. Genuinely your strategic thinking...",
    description: "Final narrative evolved authentically from early drafts. No template copying or AI generation.",
    targetSectionId: "section-executive-summary",
  },
];

// State 5: The Interrogation (Defensibility Test - Score 78%)
const INTERROGATION_DATA: FeedbackPoint[] = [
  {
    id: "int-1",
    timestamp: 0,
    endTimestamp: 12,
    category: "strategy",
    type: "warning",
    title: "⚠️ INTERROGATION: Market Capture Assumption",
    subtitle: "Stop. Your competitive analysis assumes a 10% market capture. Based on your research logs, why did you pick that number?...",
    description: "This is a defensibility test. I need you to justify this assumption with data before I can issue a 'Hireable' verdict. No hand-waving allowed.",
    targetSectionId: "section-competitive",
    actionPlan: [
      "Show calculation: Total addressable customers × realistic conversion rate",
      "Cite comparable case studies (e.g., 'Company Y achieved 8% in 24 months')",
      "Document your conservative vs. aggressive scenario models",
      "Explain why 10% is achievable given your go-to-market strategy"
    ],
  },
  {
    id: "int-2",
    timestamp: 12,
    endTimestamp: 24,
    category: "technical",
    type: "warning",
    title: "⚠️ INTERROGATION: unit economics",
    subtitle: "LTV:CAC ratio is 3:1. Defend this. What assumptions about retention and acquisition costs?...",
    description: "Show your thinking: churn rate assumptions, avg deal size, sales cycle length, CAC breakdown.",
    targetSectionId: "section-market-analysis",
    actionPlan: [
      "Break down CAC: Marketing spend + Sales salary + Tools ÷ New customers",
      "Show LTV calc: Avg revenue per user × Gross margin × Avg customer lifespan",
      "Document churn assumptions (e.g., '5% monthly churn based on industry benchmarks')",
      "Link to research supporting your retention estimates"
    ],
  },
  {
    id: "int-3",
    timestamp: 24,
    endTimestamp: 36,
    category: "hireability",
    type: "success",
    title: "Well-defended: go-to-market strategy",
    subtitle: "Backed up channel strategy with real examples and cost estimates...",
    description: "GTM approach supported by competitor case studies and realistic budget allocations.",
    targetSectionId: "section-executive-summary",
  },
  {
    id: "int-4",
    timestamp: 36,
    endTimestamp: 45,
    category: "strategy",
    type: "warning",
    title: "⚠️ INTERROGATION: timing rationale",
    subtitle: "Claim 'now is the perfect time.' Prove it. What's changed in the last 12 months?...",
    description: "Need specific catalysts: regulation changes, technology shifts, competitor exits, pain point escalations.",
    targetSectionId: "section-market-analysis",
    actionPlan: [
      "Identify 2-3 specific market events in the past year (e.g., 'New GDPR enforcement')",
      "Show Google Trends data for relevant search terms",
      "Document competitor missteps or market gaps that opened recently",
      "Explain why THIS quarter/year vs. next year"
    ],
  },
];

// State 6: Insufficient Depth (Try Harder - Score 0%)
const INSUFFICIENT_DEPTH_DATA: FeedbackPoint[] = [
  {
    id: "id-1",
    timestamp: 0,
    endTimestamp: 15,
    category: "hireability",
    type: "warning",
    title: "REJECTED: submission too short",
    subtitle: "This isn't a submission. It's a draft of a draft...",
    description: "Document is 147 words. Professional strategy documents are 1,500-3,000 words minimum.",
    targetSectionId: "section-executive-summary",
  },
  {
    id: "id-2",
    timestamp: 15,
    endTimestamp: 30,
    category: "strategy",
    type: "warning",
    title: "No analysis = no feedback",
    subtitle: "Written bullet points, not strategic analysis...",
    description: "Strategy requires depth: market research, competitive analysis, financial modeling, risk assessment.",
    targetSectionId: "section-competitive",
  },
  {
    id: "id-3",
    timestamp: 30,
    endTimestamp: 45,
    category: "communication",
    type: "warning",
    title: "Insult to your potential",
    subtitle: "This submission is far below your standard...",
    description: "Minimum viable: 8-10 pages, 3+ hours research, cited sources, financial models, competitive analysis.",
    targetSectionId: "section-market-analysis",
  },
];

const TOTAL_DURATION = 45; // Total video duration in seconds

// ============================================
// SCENARIO CONFIGURATIONS
// ============================================
const SCENARIOS: Record<ScenarioState, ScenarioConfig> = {
  "critical-gaps": {
    id: "critical-gaps",
    name: "Critical gaps",
    score: 62,
    verdict: "Not yet hireable",
    verdictType: "not-yet-hireable",
    verdictColor: "text-red-600",
    verdictBg: "bg-red-50",
    theme: {
      primary: "red",
      secondary: "rose",
      accent: "orange"
    },
    mayaTone: "Direct, serious, focused on market rejection risks",
    feedbackData: CRITICAL_GAPS_DATA,
    bucketScores: [
      {
        label: "Strategic reasoning",
        score: 58,
        category: "strategic-reasoning",
        rationale: "Competitive analysis exists but lacks depth. The value proposition isn't differentiated enough from incumbents. Market sizing uses standard TAM/SAM/SOM without bottom-up validation or unique insights. Strategic choices feel template-driven rather than evidence-based."
      },
      {
        label: "Real world standards",
        score: 65,
        category: "real-world-standards",
        rationale: "The business model section mentions unit economics but doesn't show actual calculations. Missing critical metrics like CAC, LTV, and payback periods that real investors demand. No sensitivity analysis or acknowledgment of key assumptions that could derail the plan."
      },
      {
        label: "Delta from template",
        score: 52,
        category: "delta-from-template",
        rationale: "This reads like a filled-in template rather than original thinking. Generic sections (problem, solution, market size, competition) without unique insights or proprietary data. No evidence of deep research, unusual comparisons, or creative approaches that signal independent thought."
      },
      {
        label: "AI-nativity",
        score: 48,
        category: "ai-nativity",
        rationale: "Significant evidence of copy-paste from AI generation without editing. Phrases like 'leveraging synergies' and 'innovative solution' are telltale signs. The executive summary lacks the urgency and specificity that comes from genuine market understanding. This wasn't refined through critical thinking."
      },
      {
        label: "Presentation",
        score: 70,
        category: "presentation",
        rationale: "Document structure is logical and follows standard business plan format. However, walls of dense text make it hard to scan. Missing visual elements like comparison matrices, charts for market data, or callout boxes for key insights. The formatting is acceptable but not engaging."
      }
    ]
  },
  "nitpick-mode": {
    id: "nitpick-mode",
    name: "Nitpick mode",
    score: 91,
    verdict: "Strong yes",
    verdictType: "strong-yes",
    verdictColor: "text-blue-600",
    verdictBg: "bg-blue-50",
    theme: {
      primary: "blue",
      secondary: "indigo",
      accent: "cyan"
    },
    mayaTone: "Pedantic, focused on good-to-great refinements",
    feedbackData: NITPICK_MODE_DATA,
    bucketScores: [
      {
        label: "Strategic reasoning",
        score: 92,
        category: "strategic-reasoning",
        rationale: "Exceptional competitive analysis with proprietary market data and unique insights. The differentiation strategy is crystal clear and backed by evidence. Market sizing includes both top-down and bottom-up approaches with cited sources. Minor opportunity: could strengthen the 3-year strategic roadmap with more specific milestones."
      },
      {
        label: "Real world standards",
        score: 94,
        category: "real-world-standards",
        rationale: "Comprehensive financial modeling with detailed unit economics, CAC/LTV calculations, and sensitivity analysis. Revenue projections are conservative and well-justified. Assumptions are explicitly stated with ranges. Only nitpick: could add more detail on cash flow timing and working capital requirements."
      },
      {
        label: "Delta from template",
        score: 89,
        category: "delta-from-template",
        rationale: "Clear evidence of original research and creative thinking. Includes unusual competitor comparisons, proprietary survey data, and non-obvious market insights. The narrative goes beyond standard sections to tell a compelling story. Could be even stronger with more contrarian perspectives or surprising findings."
      },
      {
        label: "AI-nativity",
        score: 90,
        category: "ai-nativity",
        rationale: "This work demonstrates genuine understanding and human refinement. Language is specific and grounded in real examples rather than generic corporate speak. Clear evidence of multiple editing passes and critical thinking. The few AI-assisted sections have been thoroughly reviewed and customized to fit the narrative."
      },
      {
        label: "Presentation",
        score: 88,
        category: "presentation",
        rationale: "Professional formatting with excellent use of white space, visual elements, and callout boxes. Comparison matrices make competitive analysis easy to parse. Charts and graphs support key data points. Minor improvements: could use more consistent font hierarchy and add page numbers for easier reference."
      }
    ]
  },
  "access-denied": {
    id: "access-denied",
    name: "Access denied",
    score: 0,
    verdict: "Access required",
    verdictType: "not-yet-hireable",
    verdictColor: "text-amber-600",
    verdictBg: "bg-amber-50",
    theme: {
      primary: "amber",
      secondary: "orange",
      accent: "yellow"
    },
    mayaTone: "N/A - System cannot access document",
    feedbackData: [],
    bucketScores: []
  },
  "logic-audit": {
    id: "logic-audit",
    name: "Logic audit",
    score: 85,
    verdict: "Yes",
    verdictType: "yes",
    verdictColor: "text-purple-600",
    verdictBg: "bg-purple-50",
    theme: {
      primary: "purple",
      secondary: "violet",
      accent: "fuchsia"
    },
    mayaTone: "Forensic verification of thinking process, research pedigree",
    feedbackData: LOGIC_AUDIT_DATA,
    bucketScores: [
      {
        label: "Strategic reasoning",
        score: 87,
        category: "strategic-reasoning",
        rationale: "Verified authentic strategic thinking through work log cross-references. Pricing model matches Nov 12 brainstorm notes, showing genuine thought progression. Competitive positioning aligns with research journal entries. Only minor concern: some later refinements lack clear pedigree."
      },
      {
        label: "Real world standards",
        score: 84,
        category: "real-world-standards",
        rationale: "Citations properly attributed to Gartner Report 2025 with page numbers. Market data cross-checked against original sources. Financial assumptions traceable to spreadsheet models. Meets industry standards for research rigor and source verification."
      },
      {
        label: "Delta from template",
        score: 82,
        category: "delta-from-template",
        rationale: "Work log shows iterative thinking beyond template sections. Evidence of multiple drafts and refinement cycles. Some sections still follow standard format, but customization and original insights are clearly documented through the research trail."
      },
      {
        label: "AI-nativity",
        score: 88,
        category: "ai-nativity",
        rationale: "Forensic analysis confirms human-led research and thinking. AI may have assisted with initial drafts, but substantial editing and fact-checking is evident. No copy-paste artifacts found. Work journal shows critical engagement with AI outputs rather than blind acceptance."
      },
      {
        label: "Presentation",
        score: 84,
        category: "presentation",
        rationale: "Professional formatting with clear visual hierarchy. Document structure supports the narrative flow established in early outlines. Consistent styling throughout. Version control shows intentional design choices rather than default templates."
      }
    ]
  },
  "interrogation": {
    id: "interrogation",
    name: "The interrogation",
    score: 78,
    verdict: "Not yet hireable",
    verdictType: "not-yet-hireable",
    verdictColor: "text-orange-600",
    verdictBg: "bg-orange-50",
    theme: {
      primary: "orange",
      secondary: "amber",
      accent: "red"
    },
    mayaTone: "Defensibility test. Assumptions must be justified with evidence",
    feedbackData: INTERROGATION_DATA,
    bucketScores: [
      {
        label: "Strategic reasoning",
        score: 75,
        category: "strategic-reasoning",
        rationale: "Strategic choices are stated but critical assumptions lack supporting evidence. Why 10% market capture? What data justifies this? GTM strategy needs more detailed roadmap. The plan is directionally sound but defensibility is weak without deeper justification."
      },
      {
        label: "Real world standards",
        score: 72,
        category: "real-world-standards",
        rationale: "Financial projections present but assumptions require defense. Unit economics calculations are simplified without stress testing. Need evidence for customer acquisition costs and conversion rates. Must explain why these numbers are realistic vs. aspirational."
      },
      {
        label: "Delta from template",
        score: 78,
        category: "delta-from-template",
        rationale: "Shows some original thinking but key insights need deeper exploration. Template sections are customized but not enough to demonstrate unique strategic perspective. More contrarian or surprising findings would strengthen the narrative."
      },
      {
        label: "AI-nativity",
        score: 80,
        category: "ai-nativity",
        rationale: "Evidence of human refinement but some sections still read generically. Need to defend specific claims with concrete examples rather than high-level statements. The narrative would benefit from more specificity and personal insights."
      },
      {
        label: "Presentation",
        score: 85,
        category: "presentation",
        rationale: "Well-formatted document with good visual organization. Information is accessible and easy to navigate. Professional appearance supports credibility. This is one of the stronger aspects of the submission."
      }
    ]
  },
  "insufficient-depth": {
    id: "insufficient-depth",
    name: "Insufficient depth",
    score: 0,
    verdict: "Not yet hireable",
    verdictType: "not-yet-hireable",
    verdictColor: "text-gray-600",
    verdictBg: "bg-gray-50",
    theme: {
      primary: "gray",
      secondary: "slate",
      accent: "zinc"
    },
    mayaTone: "Harsh but motivational. Effort threshold not met",
    feedbackData: INSUFFICIENT_DEPTH_DATA,
    bucketScores: []
  }
};

// ============================================
// VERDICT COMPONENT - Highest Visual Hierarchy
// ============================================
function VerdictDisplay({ verdictType, verdictText }: { verdictType: VerdictType; verdictText: string }) {
  const verdictConfig = {
    "strong-yes": {
      icon: (
        <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50",
      borderColor: "border-emerald-300",
      textColor: "text-emerald-900",
      badgeBg: "bg-emerald-500",
      badgeText: "text-white",
      glowColor: "shadow-emerald-200/60",
      label: "Strong yes"
    },
    "yes": {
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-900",
      badgeBg: "bg-blue-500",
      badgeText: "text-white",
      glowColor: "shadow-blue-200/60",
      label: "Yes"
    },
    "not-yet-hireable": {
      icon: (
        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-red-50 via-rose-50 to-orange-50",
      borderColor: "border-red-300",
      textColor: "text-red-900",
      badgeBg: "bg-red-500",
      badgeText: "text-white",
      glowColor: "shadow-red-200/60",
      label: "Not yet hireable"
    }
  };

  const config = verdictConfig[verdictType];

  return (
    <div className={`relative p-6 rounded-3xl border-2 ${config.borderColor} ${config.bgGradient} shadow-xl ${config.glowColor} mb-4 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative">
        {/* Label */}
        <div className="flex items-center justify-center mb-3">
          <Badge className={`${config.badgeBg} ${config.badgeText} text-[10px] font-bold tracking-wider px-3 py-1 border-0`}>
            VERDICT
          </Badge>
        </div>

        {/* Main Verdict */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <h3 className={`text-3xl md:text-4xl font-bold ${config.textColor} tracking-tight`} style={{ fontFamily: "'Instrument Serif', serif" }}>
            {verdictText}
          </h3>
        </div>

        {/* Subtle description */}
        <p className="text-center text-sm text-gray-600 mt-2">
          {verdictType === "strong-yes" && "Exceptional work. Ready for market."}
          {verdictType === "yes" && "Ready for market."}
          {verdictType === "not-yet-hireable" && "Critical improvements required for market readiness."}
        </p>
      </div>

      {/* Decorative elements */}
      {verdictType === "strong-yes" && (
        <>
          <div className="absolute top-4 right-4 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-teal-400/10 rounded-full blur-xl" />
        </>
      )}
      {verdictType === "yes" && (
        <>
          <div className="absolute top-4 right-4 w-16 h-16 bg-blue-400/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-indigo-400/10 rounded-full blur-xl" />
        </>
      )}
      {verdictType === "not-yet-hireable" && (
        <>
          <div className="absolute top-4 right-4 w-16 h-16 bg-red-400/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-orange-400/10 rounded-full blur-xl" />
        </>
      )}
    </div>
  );
}

// ============================================
// LOADING SKELETON COMPONENTS
// ============================================
function FeedbackCardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 skeleton" />
            <div className="h-5 w-20 skeleton" />
          </div>
          <div className="h-3 w-full skeleton" />
          <div className="h-3 w-4/5 skeleton" />
        </div>
      </div>
    </div>
  );
}

function DocumentPreviewSkeleton() {
  return (
    <div className="paper rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded skeleton" />
        <div className="flex-1">
          <div className="h-4 w-40 skeleton mb-2" />
          <div className="h-3 w-32 skeleton" />
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={`doc-skeleton-${i}`} className="p-4 rounded-xl border border-gray-100">
            <div className="h-4 w-36 skeleton mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full skeleton" />
              <div className="h-3 w-11/12 skeleton" />
              <div className="h-3 w-4/5 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerdictSkeleton() {
  return (
    <div className="relative p-6 rounded-3xl border-2 border-gray-200 bg-gray-50 mb-4">
      <div className="flex items-center justify-center mb-3">
        <div className="h-6 w-16 skeleton" />
      </div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="h-10 w-48 skeleton" />
      </div>
      <div className="flex justify-center mt-2">
        <div className="h-4 w-64 skeleton" />
      </div>
    </div>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg className="animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">{message}</p>
        <p className="text-xs text-gray-500 mt-1">This will just take a moment...</p>
      </div>
    </div>
  );
}

// ============================================
// CATEGORY STYLING
// ============================================
const categoryStyles = {
  hireability: { label: "Hireability", color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50" },
  technical: { label: "Technical", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  communication: { label: "Communication", color: "bg-violet-500", textColor: "text-violet-700", bgLight: "bg-violet-50" },
  strategy: { label: "Strategy", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
};



function XPBadgeIcon({ className }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg flex items-center justify-center transform rotate-3 border border-yellow-300/50">
        {/* XP Sparkle Icon */}
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>
    </div>
  );
}

// ============================================
// TALKING HEAD VIDEO COMPONENT
// ============================================
function TalkingHead({
  isPlaying,
  currentSubtitle,
  onTogglePlay,
  videoRef
}: {
  isPlaying: boolean;
  currentSubtitle: string;
  onTogglePlay: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={`relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 shadow-deep cursor-pointer transition-all duration-300 ${isPlaying ? 'ring-2 ring-emerald-400/30' : ''}`} onClick={onTogglePlay}>
      {/* Looping Video of Talking Head - Using Mixkit free video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'} ${isPlaying ? 'brightness-105' : ''}`}
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => setVideoError(true)}
      >
        {/* Mixkit video - Woman speaking at conference */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-coffee-shop-702-large.mp4" type="video/mp4" />
        {/* Fallback */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-on-a-terrace-10442-large.mp4" type="video/mp4" />
      </video>

      {/* Subtle glow effect when video is playing */}
      {isPlaying && videoLoaded && !videoError && (
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Fallback animated avatar when video not loaded */}
      {(!videoLoaded || videoError) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative ${isPlaying ? 'animate-talking' : ''}`}>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/40 to-teal-400/40 blur-3xl transition-all duration-500 ${isPlaying ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
            <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${isPlaying ? 'border-emerald-400/60 animate-glow-pulse' : 'border-white/30'} shadow-2xl transition-all duration-300`}>
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face"
                alt="Maya Chen - AI Manager"
                className={`w-full h-full object-cover ${isPlaying ? 'brightness-105' : ''}`}
              />

              {/* Mouth movement overlay when talking */}
              {isPlaying && (
                <div className="absolute inset-0">
                  {/* Subtle brightness pulse on face area */}
                  <div className="absolute top-1/3 left-1/4 right-1/4 bottom-1/3 bg-white/5 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }} />

                  {/* Mouth area subtle animation */}
                  <div className="absolute bottom-1/3 left-1/3 right-1/3 h-1/6">
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-black/10 rounded-full animate-mouth" />
                  </div>
                </div>
              )}

              {/* Enhanced speaking indicator bars */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end justify-center pb-4">
                  <div className="flex items-end gap-1.5">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={`wave-${i}`}
                        className="w-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                        style={{
                          height: `${12 + Math.sin(i * 0.7) * 16}px`,
                          animation: 'pulse 0.5s ease-in-out infinite',
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Enhanced speaking ring animations */}
            {isPlaying && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-[-8px] rounded-full border-2 border-emerald-400/40 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-[-16px] rounded-full border border-emerald-400/20 animate-pulse" style={{ animationDuration: '2.5s' }} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Gradient overlay for better subtitle contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />

      {/* LIVE Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-10">
        <div className="relative">
          <div className="w-2 h-2 bg-white rounded-full" />
          {isPlaying && <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" />}
        </div>
        <span>LIVE</span>
      </div>

      {/* Professional Role Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-10">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>AI Manager</span>
      </div>

      {/* Speaking indicator when playing */}
      {isPlaying && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full z-10">
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
            <div className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '150ms' }} />
            <div className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '300ms' }} />
            <div className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '450ms' }} />
            <div className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '50%', animationDelay: '600ms' }} />
          </div>
          <span>Speaking...</span>
        </div>
      )}

      {/* Play/Pause Overlay - Only show when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-white/20 transition-all duration-300">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Subtitles Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
        <div className={`bg-black/80 backdrop-blur-lg rounded-2xl px-5 py-4 mx-auto max-w-xl transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-70'}`}>
          <p className="text-white text-sm md:text-base lg:text-lg text-center leading-relaxed font-medium">
            {currentSubtitle || "Click play to start the review..."}
          </p>
        </div>
      </div>

      {/* Pause hover indicator when playing */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 z-20">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-10 bg-white rounded-full" />
              <div className="w-2.5 h-10 bg-white rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// VIDEO CONTROLS
// ============================================
function VideoControls({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
  feedbackData
}: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  feedbackData: FeedbackPoint[];
}) {
  const progress = (currentTime / duration) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Progress bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          onSeek(percent * duration);
        }}
      >
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
        {/* Timestamp markers */}
        {feedbackData.map((point) => (
          <div
            key={point.id}
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${point.type === 'warning' ? 'bg-red-400' : point.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`}
            style={{ left: `${(point.timestamp / duration) * 100}%` }}
            title={point.title}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="text-sm text-gray-600 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-white/50 border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-100">
            1x
          </Badge>
          <Badge variant="outline" className="text-xs bg-white/50 border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-100">
            CC
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FEEDBACK CARD WITH EXPANDABLE ACTION PLAN
// ============================================
function FeedbackCard({
  point,
  isActive,
  isCompleted,
  onJumpTo,
}: {
  point: FeedbackPoint;
  isActive: boolean;
  isCompleted: boolean;
  onJumpTo: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const catStyle = categoryStyles[point.category];

  const typeStyles = {
    success: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: "Strength",
      glowColor: "shadow-emerald-200/50",
    },
    warning: {
      badge: "bg-red-50 text-red-600 border-red-200",
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: "Critical gap",
      glowColor: "shadow-red-200/50",
    },
    info: {
      badge: "bg-blue-50 text-blue-600 border-blue-200",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Nitpick",
      glowColor: "shadow-blue-200/50",
    },
  };

  const style = typeStyles[point.type];

  return (
    <Card
      className={`p-4 bg-white rounded-2xl border-0 transition-all duration-500 cursor-pointer
        ${isActive
          ? `ring-2 ring-offset-2 ${point.type === 'warning' ? 'ring-red-400' : point.type === 'success' ? 'ring-emerald-400' : 'ring-blue-400'} shadow-xl ${style.glowColor} scale-[1.02]`
          : isCompleted
            ? 'opacity-60 hover:opacity-80'
            : 'shadow-soft hover:shadow-deep'
        }`}
      onClick={onJumpTo}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''} ${catStyle.bgLight}`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{point.title}</h4>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${style.badge}`}>
              {style.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 font-medium ${catStyle.bgLight} ${catStyle.textColor} border-transparent`}>
              {catStyle.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>

          {/* Expandable Action Plan for Critical Gaps */}
          {point.actionPlan && point.type === 'warning' && (
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? 'Hide fix' : 'View fix'}
              </button>

              {isExpanded && (
                <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
                  <h5 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Recommended Actions
                  </h5>
                  <ul className="space-y-2">
                    {point.actionPlan.map((action, i) => (
                      <li key={`action-${point.id}-${i}`} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-[10px]">
                          {i + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active indicator line */}
      {isActive && (
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${point.type === 'warning' ? 'bg-red-400' : point.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
      )}
    </Card>
  );
}

// ============================================
// DOCUMENT PREVIEW WITH HIGHLIGHTING
// ============================================
function DocumentPreview({ activeSection, activeFeedback }: { activeSection: string | null; activeFeedback: FeedbackPoint | null }) {
  const getSectionStyle = (sectionId: string) => {
    if (activeSection === sectionId) {
      if (activeFeedback?.type === 'warning') {
        return 'ring-4 ring-red-400 bg-red-50/50 scale-[1.02] shadow-lg shadow-red-200/50';
      } else if (activeFeedback?.type === 'success') {
        return 'ring-4 ring-emerald-400 bg-emerald-50/50 scale-[1.02] shadow-lg shadow-emerald-200/50';
      }
      return 'ring-4 ring-blue-400 bg-blue-50/50 scale-[1.02] shadow-lg shadow-blue-200/50';
    }
    return '';
  };

  const getHighlightLabel = () => {
    if (!activeFeedback) return null;
    const colors = {
      success: { bg: 'bg-emerald-500', text: 'Strength' },
      warning: { bg: 'bg-red-500', text: 'Critical Gap' },
      info: { bg: 'bg-blue-500', text: 'Suggestion' },
    };
    return colors[activeFeedback.type];
  };

  return (
    <div className="paper rounded-lg p-6 max-w-md mx-auto">
      {/* Document header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Product Strategy.pdf</h3>
          <p className="text-xs text-gray-500">Version 2.4 - Final Draft</p>
        </div>
      </div>

      {/* Document content with highlightable sections */}
      <div className="space-y-4">
        {/* Executive Summary */}
        <div
          id="section-executive-summary"
          className={`relative p-4 rounded-xl transition-all duration-500 ${getSectionStyle('section-executive-summary')}`}
        >
          {/* Highlight indicator */}
          {activeSection === 'section-executive-summary' && activeFeedback && (
            <div className="absolute -top-3 -right-2 z-10 animate-bounce">
              <div className={`${getHighlightLabel()?.bg} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Reviewing
              </div>
            </div>
          )}
          <h4 className="text-base font-semibold text-gray-900 mb-2">Executive Summary</h4>
          <div className="space-y-2">
            <div className={`h-3 rounded w-full transition-colors duration-300 ${activeSection === 'section-executive-summary' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[95%] transition-colors duration-300 ${activeSection === 'section-executive-summary' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[88%] transition-colors duration-300 ${activeSection === 'section-executive-summary' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[70%] transition-colors duration-300 ${activeSection === 'section-executive-summary' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
          </div>
        </div>

        {/* Market Analysis */}
        <div
          id="section-market-analysis"
          className={`relative p-4 rounded-xl transition-all duration-500 ${getSectionStyle('section-market-analysis')}`}
        >
          {/* Highlight indicator */}
          {activeSection === 'section-market-analysis' && activeFeedback && (
            <div className="absolute -top-3 -right-2 z-10 animate-bounce">
              <div className={`${getHighlightLabel()?.bg} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Reviewing
              </div>
            </div>
          )}
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Market Analysis</h4>
          <div className="space-y-2">
            <div className={`h-3 rounded w-full transition-colors duration-300 ${activeSection === 'section-market-analysis' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[92%] transition-colors duration-300 ${activeSection === 'section-market-analysis' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[85%] transition-colors duration-300 ${activeSection === 'section-market-analysis' ? 'bg-emerald-300/60' : 'bg-gray-200/60'}`} />
          </div>
        </div>

        {/* Key Metrics */}
        <div
          id="section-metrics"
          className={`p-4 rounded-xl border transition-all duration-500 ${activeSection === 'section-metrics' ? 'border-blue-200 bg-blue-50/30' : 'border-emerald-100 bg-emerald-50/50'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium text-emerald-700">Key Metric Highlight</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-emerald-200/50 rounded w-[80%]" />
            <div className="h-2.5 bg-emerald-200/50 rounded w-[65%]" />
          </div>
        </div>

        {/* Competitive Landscape - Critical Gap Section */}
        <div
          id="section-competitive"
          className={`relative p-4 rounded-xl transition-all duration-500 ${getSectionStyle('section-competitive')}`}
        >
          {/* Warning highlight indicator */}
          {activeSection === 'section-competitive' && activeFeedback && (
            <div className="absolute -top-3 -right-2 z-10 animate-bounce">
              <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Critical gap
              </div>
            </div>
          )}
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Competitive Landscape</h4>
          <div className="space-y-2">
            <div className={`h-3 rounded w-[98%] transition-colors duration-300 ${activeSection === 'section-competitive' ? 'bg-red-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[90%] transition-colors duration-300 ${activeSection === 'section-competitive' ? 'bg-red-300/60' : 'bg-gray-200/60'}`} />
            <div className={`h-3 rounded w-[75%] transition-colors duration-300 ${activeSection === 'section-competitive' ? 'bg-red-300/60' : 'bg-gray-200/60'}`} />
          </div>

          {activeSection === 'section-competitive' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border-2 border-red-300 animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-semibold text-red-700">This section needs significant improvement</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<ScenarioState>("critical-gaps");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [devMode, setDevMode] = useState(false);
  const [activeDevRequirement, setActiveDevRequirement] = useState<DevRequirement | null>(null);
  const [interrogationResponses, setInterrogationResponses] = useState<Set<string>>(new Set());
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [selectedBucketCategory, setSelectedBucketCategory] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get current scenario config
  const scenario = SCENARIOS[currentScenario];
  const EVALUATION_DATA = scenario.feedbackData;

  // Handle scenario change - reset playback with loading state
  const handleScenarioChange = (newScenario: ScenarioState) => {
    setIsLoadingScenario(true);
    setIsPlaying(false);

    // Simulate loading delay for realistic transition
    setTimeout(() => {
      setCurrentScenario(newScenario);
      setCurrentTime(0);
      setActiveFeedbackId(null);
      setActiveSection(null);
      setCurrentSubtitle("");
      setSelectedBucketCategory("");
      setIsLoadingScenario(false);
    }, 800);
  };

  // Find current feedback point based on time
  const getCurrentFeedback = useCallback((time: number) => {
    return EVALUATION_DATA.find(point => time >= point.timestamp && time < point.endTimestamp);
  }, [EVALUATION_DATA]);

  // Sync video playback with isPlaying state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked, that's okay
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update active feedback and section based on current time
  useEffect(() => {
    const currentFeedback = getCurrentFeedback(currentTime);
    if (currentFeedback) {
      setActiveFeedbackId(currentFeedback.id);
      setActiveSection(currentFeedback.targetSectionId);
      setCurrentSubtitle(currentFeedback.subtitle);
    } else {
      setActiveFeedbackId(null);
      setActiveSection(null);
      setCurrentSubtitle("");
    }
  }, [currentTime, getCurrentFeedback]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleJumpToFeedback = (point: FeedbackPoint) => {
    setCurrentTime(point.timestamp);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Calculate completed feedback points
  const completedIds = EVALUATION_DATA
    .filter(p => currentTime >= p.endTimestamp)
    .map(p => p.id);

  return (
    <div className="min-h-screen bg-[#FAFAF9] clouds-bg grain overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-[#FAFAF9]/70">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button type="button" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI Manager
          </h1>

          <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
            {/* XP Sparkle Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#xpGradient)" />
              <defs>
                <linearGradient id="xpGradient" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFC107" />
                  <stop offset="100%" stopColor="#FF9800" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-gray-800">2,450</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-4 tracking-tight italic">
              Project feedback
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              AI managerial audit of your <span className="text-gray-700 font-medium">Product Strategy</span> submission
            </p>
          </div>

          {/* Content - Hidden when Access Denied or Insufficient Depth */}
          {scenario.id !== "access-denied" && scenario.id !== "insufficient-depth" && (
            <>
          {/* Split screen */}
          <div className="grid lg:grid-cols-2 gap-6 relative">
            {/* Floating icons removed - professional UI */}

            {/* Left Pane - Document */}
            <div className="glass-card rounded-3xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-white/50 border-gray-200 text-gray-600">
                    PDF
                  </Badge>
                  <span className="text-xs text-gray-500">12 pages</span>
                </div>
              </div>

              <ScrollArea className="h-[650px] pr-4">
                {isLoadingScenario ? (
                  <DocumentPreviewSkeleton />
                ) : (
                  <DocumentPreview activeSection={activeSection} activeFeedback={getCurrentFeedback(currentTime) || null} />
                )}
              </ScrollArea>
            </div>

            {/* Right Pane - AI Manager */}
            <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col">
              {/* Talking Head Video Player */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Manager's audit</h3>
                  {devMode && (
                    <DevInfoIcon
                      requirementId="maya-video"
                      onClick={() => setActiveDevRequirement(DEV_REQUIREMENTS.find(r => r.id === "maya-video") || null)}
                    />
                  )}
                </div>
                <TalkingHead
                  isPlaying={isPlaying}
                  currentSubtitle={currentSubtitle}
                  onTogglePlay={togglePlay}
                  videoRef={videoRef}
                />
                <VideoControls
                  currentTime={currentTime}
                  duration={TOTAL_DURATION}
                  isPlaying={isPlaying}
                  onSeek={handleSeek}
                  onTogglePlay={togglePlay}
                  feedbackData={EVALUATION_DATA}
                />
              </div>

              {/* Verdict - Highest Visual Hierarchy */}
              {isLoadingScenario ? (
                <VerdictSkeleton />
              ) : (
                EVALUATION_DATA.length > 0 && (
                  <VerdictDisplay
                    verdictType={scenario.verdictType}
                    verdictText={scenario.verdict}
                  />
                )
              )}

              {/* Score Overview */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/50 border border-white/50">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-1">
                    {EVALUATION_DATA.length === 0 ? (
                      <p className="text-2xl font-bold text-amber-600">—</p>
                    ) : (
                      <p className={`text-2xl font-bold ${scenario.score < 80 ? 'text-red-500' : 'text-blue-500'}`}>
                        {scenario.score}%
                      </p>
                    )}
                    {devMode && (
                      <DevInfoIcon
                        requirementId="overall-score"
                        onClick={() => setActiveDevRequirement(DEV_REQUIREMENTS.find(r => r.id === "overall-score") || null)}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Overall Score</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-emerald-500">
                    {EVALUATION_DATA.filter(p => p.type === 'success').length}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Strengths</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-red-400">
                    {EVALUATION_DATA.filter(p => p.type === 'warning').length}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {scenario.id === "nitpick-mode" ? "Nitpicks" : "Critical gaps"}
                  </p>
                </div>
              </div>

              {/* Progressive Disclosure - Bucket Scores */}
              {scenario.bucketScores && scenario.bucketScores.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-violet-50/30 border border-purple-100">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Performance breakdown</h4>
                    <p className="text-xs text-gray-600">Click on any category to filter audit notes below</p>
                  </div>

                  {/* Radar Chart */}
                  <div className="flex justify-center mb-6 bg-white rounded-xl p-4 border border-gray-100">
                    <RadarChart
                      buckets={scenario.bucketScores}
                      selectedCategory={selectedBucketCategory}
                      onCategoryClick={(category) => {
                        setSelectedBucketCategory(category === selectedBucketCategory ? "" : category);
                      }}
                    />
                  </div>

                  {/* Bucket Score Cards */}
                  <div className="space-y-3">
                    {scenario.bucketScores.map((bucket) => (
                      <BucketScoreCard
                        key={bucket.category}
                        label={bucket.label}
                        score={bucket.score}
                        category={bucket.category}
                        rationale={bucket.rationale}
                        isSelected={selectedBucketCategory === bucket.category}
                        onCategoryClick={(category) => {
                          setSelectedBucketCategory(category === selectedBucketCategory ? "" : category);
                        }}
                      />
                    ))}
                  </div>

                  {selectedBucketCategory && (
                    <div className="mt-4 p-3 bg-purple-100 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-purple-800">
                          Filtering audit notes by: <span className="font-bold">{scenario.bucketScores.find(b => b.category === selectedBucketCategory)?.label}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedBucketCategory("")}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                        >
                          Clear filter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Cards */}
              <div className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Audit notes</h4>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                    {selectedBucketCategory
                      ? `${EVALUATION_DATA.filter(p => p.bucketCategory === selectedBucketCategory).length} filtered`
                      : `${EVALUATION_DATA.length} insights`
                    }
                  </Badge>
                </div>

                <ScrollArea className="h-[200px] pr-2">
                  <div className="space-y-2">
                    {isLoadingScenario ? (
                      // Show skeleton loaders when switching scenarios
                      <>
                        {[...Array(3)].map((_, i) => (
                          <FeedbackCardSkeleton key={`skeleton-${i}`} />
                        ))}
                      </>
                    ) : (
                      EVALUATION_DATA
                        .filter((point) => !selectedBucketCategory || point.bucketCategory === selectedBucketCategory)
                        .map((point) => {
                        // Show InterrogationCard for interrogation scenario warnings
                        if (scenario.id === "interrogation" && point.type === "warning") {
                          return (
                            <InterrogationCard
                              key={point.id}
                              point={point}
                              onRespond={() => {
                                setInterrogationResponses(prev => new Set(prev).add(point.id));
                              }}
                            />
                          );
                        }

                        // Normal feedback card
                        return (
                          <FeedbackCard
                            key={point.id}
                            point={point}
                            isActive={activeFeedbackId === point.id}
                            isCompleted={completedIds.includes(point.id)}
                            onJumpTo={() => handleJumpToFeedback(point)}
                          />
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Logic Audit Work Log */}
                {scenario.id === "logic-audit" && <WorkLogPanel />}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-100/50">
                <div className="relative">
                  <Button
                    onClick={() => {
                      setIsGeneratingPlan(true);
                      setTimeout(() => setIsGeneratingPlan(false), 2000);
                    }}
                    disabled={isGeneratingPlan || isLoadingScenario}
                    className="w-full btn-gradient text-white font-semibold py-5 rounded-full text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate fix-list
                      </>
                    )}
                  </Button>
                  {devMode && !isGeneratingPlan && (
                    <div className="absolute -top-2 -right-2">
                      <DevInfoIcon
                        requirementId="action-plan"
                        onClick={() => setActiveDevRequirement(DEV_REQUIREMENTS.find(r => r.id === "action-plan") || null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


            </>
          )}

          {/* XP Footer */}
          {scenario.id !== "access-denied" && scenario.id !== "insufficient-depth" && (
            <div className="mt-8 flex justify-center">
              <div className="glass-card rounded-2xl px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    {/* XP Sparkle Icon */}
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">XP Earned</p>
                    <p className="font-bold text-gray-900">+150</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Scenario Switcher */}
      <ScenarioSwitcher
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
      />

      {/* Dev Mode Toggle */}
      <DevModeToggle isEnabled={devMode} onToggle={() => setDevMode(!devMode)} />

      {/* Dev Drawer */}
      <DevDrawer
        isOpen={activeDevRequirement !== null}
        onClose={() => setActiveDevRequirement(null)}
        requirement={activeDevRequirement}
      />

      {/* Access Denied Modal */}
      {scenario.id === "access-denied" && (
        <AccessDeniedModal onClose={() => handleScenarioChange("critical-gaps")} />
      )}

      {/* Insufficient Depth Overlay */}
      {scenario.id === "insufficient-depth" && (
        <InsufficientDepthOverlay onDismiss={() => handleScenarioChange("critical-gaps")} />
      )}
    </div>
  );
}
