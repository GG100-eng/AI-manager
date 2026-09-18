# AI Manager

An interactive prototype for reviewing product work and turning feedback into specific next steps.

[Try the demo](https://ai-manager-delta.vercel.app/)

The prototype explores how an AI reviewer should present its assessment: the overall result, the reasoning behind it, the relevant part of the submission, and what the user can do next.

**Current stage:** a frontend prototype with predefined scenarios, scores and feedback. It does not run live document analysis or model inference.

## The product question

Feedback is useful when someone can understand it, challenge it and use it to improve their work. A score alone does not give them that.

AI Manager makes the review experience tangible before connecting an evaluation engine. The demo uses a sample Product Strategy submission and lets you inspect how the interface changes across different outcomes.

## Walk through the demo

1. Start with the verdict and category scores.
2. Open a category's rationale to inspect the reasoning.
3. Select a category to filter the audit notes.
4. Open a suggested fix for a specific gap.
5. Use **Scenarios** to switch between critical gaps, nitpick mode, access denied, logic audit, interrogation and insufficient depth.

The playback sequence also links feedback to sections of the sample document. The talking-head footage, captions and review timeline are demonstration assets and scripted interactions.

## Product choices in the prototype

| Choice | What it gives the user |
| --- | --- |
| Summary before detail | An overview of the assessment before opening individual critiques |
| Expandable rationales | A way to inspect the reasoning without putting every explanation on screen at once |
| Categories that filter notes | A focused view of the area the user wants to improve |
| Fixes attached to critiques | A concrete next step for individual gaps |
| Multiple outcome states | A way to inspect feedback for strong, weak, inaccessible and incomplete submissions |
| Questions about assumptions | An interaction for asking the user to explain the reasoning behind their work |

## Current scope

Scores, verdicts, rationales and fixes come from scenario data in the frontend. Category filtering, rationale expansion, scenario switching and timeline interactions run in the browser.

The **Generate fix-list** control currently demonstrates a loading state. Document access checks, AI-generated reviews, score calibration and backend modules mentioned in the developer overlay are not implemented in this repository.

## What needs validation

The next product work is to test whether the feedback helps someone produce a better revision.

- **Grounding:** tie each critique to the relevant passage and distinguish missing evidence from a model assumption.
- **Consistency:** check whether qualified reviewers agree on the rubric and whether repeated model runs apply it consistently.
- **Uncertainty:** let the system withhold a judgment when it lacks enough evidence.
- **User control:** let someone challenge a critique, add context and see what changed in the review.
- **Usefulness:** compare the revised work against the original using the same rubric.

The percentages and hireability verdicts in the demo are illustrative. They have not been validated as measures of job readiness. There are no published model-evaluation or user-study results yet.

## Implementation

Next.js, React, TypeScript, Tailwind CSS and shadcn/ui. The application lives in [`ai-manager/`](ai-manager/).

- [Scenario data and main experience](ai-manager/src/app/page.tsx)
- [Category scores and expandable rationales](ai-manager/src/components/BucketScoreCard.tsx)
- [Interactive category chart](ai-manager/src/components/RadarChart.tsx)
- [Local setup](ai-manager/README.md)
