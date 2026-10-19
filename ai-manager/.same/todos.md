# AI Manager - Functional Evaluation Engine

## Current Task: Progressive Disclosure for Categorized Buckets

- [x] **Layout Sequence Implementation**
  - [x] Top: Verdict & Summary Metrics
  - [x] Middle: Interactive Radar Chart + Bucket Sub-scores
  - [x] Bottom: Audit notes feed (filterable)

- [x] **Click to Filter Functionality**
  - [x] Make radar chart vertices clickable
  - [x] Make bucket labels clickable
  - [x] Filter audit notes by selected category
  - [x] Visual feedback for selected category

- [x] **View Rationale Toggle**
  - [x] Hide long-form AI manager text by default
  - [x] Add "View rationale" link for each bucket
  - [x] Expandable detailed managerial critique

- [x] **Score Visualization**
  - [x] Display 0-100% scores for each bucket:
    - [x] Strategic reasoning
    - [x] Real world standards
    - [x] Delta from the template
    - [x] AI-nativity
    - [x] Presentation
  - [x] Show as horizontal sparkline or percentage next to label

## Implementation Notes

- Created RadarChart component with clickable vertices
- Created BucketScoreCard component with expandable rationale sections
- Added bucket scores to all scenario configurations
- Implemented filtering logic for audit notes based on selected bucket category
- Added visual feedback (purple highlight) for selected categories
- Integrated bucket categories into feedback points for accurate filtering

## Completed Features

### AI Manager Persona Refactor ✅
- [x] **Replaced all "Coach/Reviewer" references with "Manager"**
  - Header: "AI-powered review" → "AI managerial audit"
  - Avatar label: "Maya Chen - AI Strategy Coach" → "Maya Chen - AI Manager"
  - Section header: "AI Coach Review" → "Manager's audit"
  - Feedback feed: "Feedback Stream" → "Audit notes"
- [x] **Applied sentence case throughout entire UI**
  - Page title: "Project Feedback" → "Project feedback"
  - All scenario names in sentence case
  - All verdict labels in sentence case ("Not yet hireable", "Strong yes", "Yes")
  - All feedback card titles in sentence case
  - All UI labels and badges in sentence case
- [x] **Removed filler words for high-stakes tone**
  - Verdicts: More concise and direct
  - Feedback descriptions: Streamlined and factual
  - Subtitles: Removed conversational elements
- [x] **Updated metric labels**
  - "Gaps" → "Critical gaps"
  - "Suggestions" → "Nitpicks"
  - "Optimizations" → "Nitpicks" (in nitpick mode)
- [x] **Updated action buttons**
  - "View Action Plan" → "View fix"
  - "Generate Action Plan" → "Generate fix-list"
- [x] **Professional managerial tone established**
  - All narrative content streamlined
  - High-stakes performance review feel
  - No classroom feedback session language

### Loading States & Skeleton Screens ✅
- [x] **Shimmer animation skeleton loaders**
  - Modern gradient shimmer effect (light gray gradient moving left to right)
  - CSS keyframe animations for smooth 1.5s infinite loop
  - Responsive to different content types
- [x] **Skeleton components created:**
  - `FeedbackCardSkeleton`: Card layout with icon, title, and description placeholders
  - `DocumentPreviewSkeleton`: PDF preview with 3 section placeholders
  - `VerdictSkeleton`: Large verdict display with icon and text placeholders
  - `LoadingOverlay`: Full overlay with spinner and message
- [x] **Loading states integrated:**
  - Scenario switching: 800ms delay with skeleton screens
  - Verdict display: Shows skeleton during transition
  - Feedback cards: 3 skeleton cards appear when loading
  - Document preview: Full skeleton structure while loading
  - Generate Action Plan button: Spinner + "Generating..." text
- [x] **XP Sparkle Icons**
  - Replaced all star icons with golden diamond/sparkle icons
  - Header XP counter with gradient sparkle
  - Gamification footer XP earned icon
  - Floating XP badge decoration
  - Consistent amber/yellow/orange gradient branding
- [x] **Smooth transitions**
  - Disabled states for buttons during loading
  - 2-second simulated generation time for action plan
  - Prevents multiple simultaneous operations

### Animated Talking Avatar ✅
- [x] **Dynamic talking animations** when video is playing
  - Head bobbing animation (subtle up/down movement every 0.6s)
  - Breathing scale effect (1.5% scale pulse over 1.2s)
  - Mouth area subtle movement animation
  - Brightness increase when speaking for liveliness
- [x] **Enhanced visual feedback**
  - Pulsing emerald glow around avatar border
  - Multiple concentric ring animations (3 layers with staggered timing)
  - 9 audio visualization bars with glow effects
  - Smooth brightness transitions
- [x] **Custom CSS keyframe animations**
  - `talk-bob`: Vertical movement with varied heights
  - `talk-scale`: Subtle breathing scale effect
  - `glow-pulse`: Animated box-shadow with emerald glow
  - `mouth-move`: Clip-path animation for mouth area
- [x] **State-based styling**
  - Idle state: Static avatar with subtle border
  - Talking state: Full animation suite activated
  - Smooth transitions between states
- [x] **Video enhancement**
  - Emerald ring around video frame when playing
  - Subtle gradient overlay during playback
  - Brightness boost for lively appearance

### Prominent Verdict Display - Top Visual Hierarchy ✅
- [x] **Verdict Section** - Highest visual prominence in AI Coach Review
  - Positioned above Overall Score for maximum impact
  - Large typography (3xl-4xl) with Instrument Serif font
  - Icon + text layout with contextual descriptions
  - Three distinct states:
    - **Strong Yes** (emerald green gradient, checkmark icon)
      - Description: "Exceptional work. Ready for top-tier opportunities."
      - Triggered at score > 90%
    - **Yes** (blue gradient, checkmark icon)
      - Description: "Solid performance. Ready for hiring consideration."
      - Triggered at score 80-90%
    - **Not Yet Hireable** (red gradient, warning icon)
      - Description: "Critical improvements needed before job market readiness."
      - Triggered at score < 80%
  - Gradient backgrounds with subtle dot patterns
  - Decorative glow effects for depth
  - Border colors matching verdict type
  - "VERDICT" badge label at top
  - Removed redundant verdict badge from score overview for cleaner hierarchy

### Advanced Scenarios: Forensic & Interrogation ✅
- [x] **State 4: Logic Audit** (The Forensic Layer - 85% score)
  - Purple theme with "Verified Authentic" verdict
  - Work Log / Logic Pedigree panel showing connection lines
  - Cross-references PDF content with research notes and work journal
  - Verification badges for authentic thinking vs. template copying
  - 4 forensic check points including pricing, market research, competitor analysis
  - Visual connection from work log timestamps to final document sections

- [x] **State 5: The Interrogation** (Defensibility Test - 78% score)
  - Orange theme with "Pending Defense" verdict
  - Interactive interrogation cards replace standard feedback
  - Maya asks challenging questions about assumptions (e.g., "Why 10% market capture?")
  - Blocking mechanism: "Hireable" status locked until responses provided
  - Text input fields with word count tracking (minimum 10 words)
  - Submit defense button with validation
  - Success confirmation after submission
  - 4 interrogation points: Market Capture, Unit Economics, GTM Strategy, Timing Rationale
  - Each includes "What Maya Needs to See" evidence checklist

- [x] **State 6: Insufficient Depth** (Try Harder - 0% score)
  - Full-screen dark overlay replaces entire UI
  - Gray theme with "Not Graded" verdict
  - Coach Carter-style harsh but motivational tone
  - Educational copy: "This isn't a submission; it's a draft of a draft"
  - Specific requirement failures listed (word count, research hours, citations, models)
  - Triggered by low-effort submissions (< 200 words or < 30 sec video)
  - Grayscale Maya avatar for serious conversation mode
  - Minimum requirements checklist with X marks
  - "I Understand. I'll Do Better." CTA button

- [x] **Six Total Scenarios** covering full evaluation spectrum:
  1. Critical Gaps (failing - needs intervention)
  2. Nitpick Mode (excelling - needs polish)
  3. Access Denied (friction - permission errors)
  4. Logic Audit (forensic - verify authenticity)
  5. The Interrogation (defensibility - prove assumptions)
  6. Insufficient Depth (rejection - effort threshold)

### Scenario Switcher - Dynamic State Testing ✅
- [x] Floating scenario switcher menu (bottom-right, purple theme)
- [x] Three complete scenario states with distinct data:
  - **State 1: Critical Gaps** (Baseline)
    - Score: 62% (red theme)
    - Verdict: "Not Yet Hireable"
    - Maya's tone: Direct, serious, market rejection focused
    - 5 critical gap feedback points with action plans
    - Labels: "Gaps" instead of "Optimizations"
  - **State 2: Nitpick Mode** (High-Bar)
    - Score: 91% (blue theme)
    - Verdict: "Hireable"
    - Maya's tone: Encouraging but pedantic
    - 5 optimization feedback points (good-to-great refinements)
    - Labels: "Optimizations" instead of "Gaps"
  - **State 3: Access Denied** (Friction State)
    - Replaces entire UI with high-friction modal
    - Educational copy about permission errors
    - Stat: "30% of junior applications ghosted due to access control"
    - Step-by-step fix instructions
- [x] Dynamic UI updates:
  - Score color changes (red < 80%, blue >= 80%)
  - Verdict badge styling
  - Feedback stream content
  - Subtitle text and tone
  - Section highlighting colors
  - Progress bar markers
- [x] Instant state switching with playback reset
- [x] Expandable switcher panel with scenario descriptions
- [x] Current scenario indicator (checkmark)

### Dev Mode Annotation Layer ✅
- [x] Toggle switch fixed in bottom-right corner labeled "Dev Mode"
- [x] Translucent blue info icons (ⓘ) appear when Dev Mode is ON
- [x] Info icons placed next to:
  - Overall Score (78%) - Shows hireability logic
  - Maya Video Player - Shows sync requirements
  - Action Plan Button - Shows visibility constraints
- [x] Side drawer implementation with:
  - Business Logic section with code formatting
  - Technical Constraints list with numbered items
  - Implementation notes
  - Close button and backdrop
- [x] Three requirement modules defined:
  - Overall Score/Verdict: Hireability logic (< 80% = Not Hireable, >= 80% = Hireable + Nitpick Mode)
  - Maya Video Player: Max 120s, timestamp sync via Sync-Agent, 0.1s precision
  - Action Plan Button: Visible only if no dead-end critiques confirmed by Intermediate Checker
- [x] Interactive clicking to open drawer with specific requirement details
- [x] State management for active requirement and dev mode toggle

### Core Engine
- [x] JSON data structure with timestamps, categories, and target sections
- [x] Real-time playback timer with 0.1s precision
- [x] Timestamp-based sync between video, feedback cards, and PDF sections
- [x] State management with React hooks (useState, useEffect, useCallback)

### Talking Head AI Manager
- [x] Animated avatar with speaking indicators (audio bars)
- [x] Real-time subtitle overlay that updates per feedback point
- [x] Glow/pulse effects when speaking
- [x] LIVE badge with pulsing animation
- [x] AI Coach badge

### Highlight Sync System
- [x] Feedback cards glow with colored ring when active
- [x] PDF sections highlight with red/green overlays
- [x] Automatic scroll-into-view for active elements
- [x] Completed feedback points fade to 60% opacity

### Feedback Categories
- [x] Hireability (emerald green)
- [x] Technical (blue)
- [x] Communication (violet)
- [x] Strategy (amber)

### Critical Gap Protection
- [x] Expandable action plans for warning-type feedback
- [x] Numbered step-by-step recommendations
- [x] Visual warning indicators (red badges, icons)

### Video Controls
- [x] Play/Pause button
- [x] Clickable progress bar with seek
- [x] Color-coded timestamp markers
- [x] Time display (current / total)
- [x] 1x speed badge
- [x] CC (closed captions) badge

### Ethereal Solarpunk Aesthetic (Maintained)
- [x] Cream paper texture (#FAFAF9)
- [x] Watercolor cloud backgrounds
- [x] Glassmorphism cards with frosted blur
- [x] Instrument Serif for headlines
- [x] DM Sans for body text
- [x] Emerald green hireability accents
- [x] Subtle grain texture overlay

## Data Structure

```typescript
interface FeedbackPoint {
  id: string;
  timestamp: number;
  endTimestamp: number;
  category: "hireability" | "technical" | "communication" | "strategy";
  type: "success" | "warning" | "info";
  title: string;
  subtitle: string; // AI speaking text
  description: string;
  targetSectionId: string;
  actionPlan?: string[]; // For critical gaps
}
```
