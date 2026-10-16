# AI Manager

An interactive prototype for reviewing product work and turning feedback into specific next steps.

[Try the demo](https://ai-manager-delta.vercel.app/)

The prototype explores how an AI reviewer should present its assessment: the overall result, the reasoning behind it, the relevant part of the submission, and what the user can do next.

Built by [Gagan Gehani](https://github.com/GG100-eng). The interactive frontend uses predefined scenarios to explore the review rubric, feedback hierarchy and revision workflow.

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

## How the demo works

Scores, verdicts, rationales and fixes come from scenario data in the frontend. Category filtering, rationale expansion, scenario switching and timeline interactions run in the browser.

The **Generate fix-list** control demonstrates a loading state. Live document analysis, model inference and score calibration are future integration work.

## Evaluation direction

The next product work is to test whether the feedback helps someone produce a better revision.

- **Grounding:** tie each critique to the relevant passage and distinguish missing evidence from a model assumption.
- **Consistency:** check whether qualified reviewers agree on the rubric and whether repeated model runs apply it consistently.
- **Uncertainty:** let the system withhold a judgment when it lacks enough evidence.
- **User control:** let someone challenge a critique, add context and see what changed in the review.
- **Usefulness:** compare the revised work against the original using the same rubric.

The percentages and hireability verdicts are illustrative scenario data. The evaluation above is the proposed next step.

## Implementation

Next.js, React, TypeScript, Tailwind CSS and shadcn/ui. The application lives in [`ai-manager/`](ai-manager/).

- [Scenario data and main experience](ai-manager/src/app/page.tsx)
- [Category scores and expandable rationales](ai-manager/src/components/BucketScoreCard.tsx)
- [Interactive category chart](ai-manager/src/components/RadarChart.tsx)
- [Local setup](ai-manager/README.md)
