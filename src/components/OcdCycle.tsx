import { useState, useCallback } from "react";
import { Brain, Zap, RefreshCw, Sparkles, Leaf } from "lucide-react";

type StageType = "obsession" | "anxiety" | "compulsion" | "relief" | "mantra";

interface Stage {
  type: StageType;
  label: string;
  text: string;
  button: string;
}

const STAGES: Stage[] = [
  {
    type: "obsession",
    label: "obsession",
    text: "A sudden intrusive thought appears.\n\"What if I lose control?\"\nIt feels urgent and important.",
    button: "Yes… that happens.",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "Your body reacts.\nTension rises.\nYour mind says, \"Fix this now.\"",
    button: "I feel that.",
  },
  {
    type: "compulsion",
    label: "compulsion",
    text: "You start checking.\nReplaying.\nAnalyzing the thought to feel safe.",
    button: "That's exactly what I do.",
  },
  {
    type: "relief",
    label: "relief",
    text: "Anxiety drops a little.\nYou feel temporary safety.",
    button: "Okay… that helps.",
  },
  {
    type: "obsession",
    label: "obsession",
    text: "Your brain learns:\n\"Thought + Checking = Relief.\"\nSo it sends the thought again.",
    button: "Wait… really?",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "The thought feels stronger now.\nMore convincing.",
    button: "That explains a lot.",
  },
  {
    type: "compulsion",
    label: "compulsion",
    text: "Checking becomes automatic.\nA habit.",
    button: "I didn't notice that.",
  },
  {
    type: "relief",
    label: "relief",
    text: "Relief comes again —\nbut fades faster.\nThe loop tightens.",
    button: "Oh…",
  },
  {
    type: "obsession",
    label: "obsession",
    text: "The real fuel isn't the thought.\nIt's how important it feels.",
    button: "So what now?",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "Anxiety is uncomfortable —\nbut not dangerous.\nWhat if you didn't solve the thought?",
    button: "But how?",
  },
  {
    type: "mantra",
    label: "OCD Mantra",
    text: "The way out isn't more checking.\nIt's allowing the thought without solving it.\n\nOver time, your brain learns it's not a threat.\n\nThis is what OCD Mantra helps you practice.",
    button: "I'm ready to practice differently.",
  },
];

const STAGE_COLORS: Record<StageType, string> = {
  obsession: "hsl(var(--stage-obsession))",
  anxiety: "hsl(var(--stage-anxiety))",
  compulsion: "hsl(var(--stage-compulsion))",
  relief: "hsl(var(--stage-relief))",
  mantra: "hsl(var(--stage-mantra))",
};

const STAGE_ICON_MAP: Record<StageType, React.ReactNode> = {
  obsession: <Brain size={15} />,
  anxiety: <Zap size={15} />,
  compulsion: <RefreshCw size={15} />,
  relief: <Sparkles size={15} />,
  mantra: <Leaf size={15} />,
};

const TOTAL = STAGES.length;
const CIRCLE_RADIUS = 138;
const SVG_SIZE = 320;
const CENTER = SVG_SIZE / 2;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

// The 4 cycle positions around the circle (top, right, bottom, left)
const CYCLE_LABELS: { type: StageType; angle: number }[] = [
  { type: "obsession", angle: 0 },
  { type: "anxiety", angle: 90 },
  { type: "compulsion", angle: 180 },
  { type: "relief", angle: 270 },
];

const OcdCycle = () => {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  const stage = STAGES[step] ?? STAGES[TOTAL - 1];
  const progress = (step + 1) / TOTAL;
  // Rotate so the current stage type is at top
  const currentCycleIndex = CYCLE_LABELS.findIndex((c) => c.type === stage.type);
  const rotation = currentCycleIndex >= 0 ? currentCycleIndex * -90 : 0;
  const arcEnd = progress * 360;

  const handleNext = useCallback(() => {
    if (step >= TOTAL - 1) return;
    setFading(true);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, TOTAL - 1));
      setFading(false);
    }, 350);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step <= 0) return;
    setFading(true);
    setTimeout(() => {
      setStep((s) => Math.max(s - 1, 0));
      setFading(false);
    }, 350);
  }, [step]);

  const isMantra = stage.type === "mantra";
  const stageColor = STAGE_COLORS[stage.type];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center px-5 py-6 max-w-md mx-auto select-none">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3 mb-4">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground active:scale-90 transition-transform"
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: isMantra
                ? STAGE_COLORS.mantra
                : `linear-gradient(90deg, hsl(var(--stage-obsession)), ${stageColor})`,
            }}
          />
        </div>
      </div>

      {/* Circle area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          {/* SVG — circle + arc */}
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="absolute inset-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--stage-obsession))" />
                <stop offset="35%" stopColor="hsl(var(--stage-anxiety))" />
                <stop offset="65%" stopColor="hsl(var(--stage-compulsion))" />
                <stop offset="100%" stopColor="hsl(var(--stage-relief))" />
              </linearGradient>
              <linearGradient id="arcGradMantra" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--stage-mantra))" />
                <stop offset="100%" stopColor="hsl(var(--stage-relief))" />
              </linearGradient>
            </defs>

            {/* Dashed background circle */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.15)"
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />

            {/* Solid progress arc */}
            {arcEnd > 2 && (
              <path
                d={describeArc(CENTER, CENTER, CIRCLE_RADIUS, 0, Math.min(arcEnd, 359.5))}
                fill="none"
                stroke={isMantra ? "url(#arcGradMantra)" : "url(#arcGrad)"}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ transition: "d 0.6s ease-out, stroke 0.4s ease" }}
              />
            )}

            {/* Cycle position markers (small dots + labels) */}
            {CYCLE_LABELS.map((item) => {
              const pos = polarToCartesian(CENTER, CENTER, CIRCLE_RADIUS, item.angle);
              return (
                <circle
                  key={item.type + item.angle}
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill={STAGE_COLORS[item.type]}
                  opacity={0.5}
                />
              );
            })}
          </svg>

          {/* Floating labels around circle (counter-rotated to stay upright) */}
          {CYCLE_LABELS.map((item) => {
            const labelR = CIRCLE_RADIUS + 20;
            const pos = polarToCartesian(CENTER, CENTER, labelR, item.angle);
            return (
              <div
                key={item.type + "-label"}
                className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                  transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  opacity: isMantra ? 0.3 : 0.45,
                }}
              >
                <span style={{ color: STAGE_COLORS[item.type] }}>
                  {STAGE_ICON_MAP[item.type]}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: STAGE_COLORS[item.type] }}
                >
                  {item.type}
                </span>
              </div>
            );
          })}

          {/* Center content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10">
            {/* Stage label + icon */}
            <div
              className={`flex items-center gap-1.5 mb-3 transition-all duration-350 ${
                fading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
              }`}
              style={{ color: stageColor }}
            >
              {STAGE_ICON_MAP[stage.type]}
              <span className="text-sm font-bold tracking-wide lowercase">
                {stage.label}
              </span>
            </div>

            {/* Content card */}
            <div
              className={`rounded-2xl p-5 max-w-[230px] text-center transition-all duration-350 ${
                fading ? "opacity-0 scale-95 translate-y-1" : "opacity-100 scale-100 translate-y-0"
              }`}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: `1px solid hsl(var(--border))`,
                boxShadow: isMantra
                  ? `0 0 40px hsl(var(--stage-mantra) / 0.12), 0 4px 24px hsl(var(--stage-mantra) / 0.08)`
                  : `0 4px 24px hsl(var(--foreground) / 0.05), 0 1px 4px hsl(var(--foreground) / 0.03)`,
              }}
            >
              <p className="text-[13.5px] leading-[1.65] text-foreground whitespace-pre-line">
                {stage.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="w-full mt-4 pb-4">
        <button
          onClick={handleNext}
          disabled={step >= TOTAL - 1}
          className={`w-full py-4 px-6 rounded-2xl text-[15px] font-semibold transition-all duration-300 active:scale-[0.97] ${
            fading ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
          }`}
          style={{
            background: isMantra
              ? `linear-gradient(135deg, hsl(var(--stage-mantra)), hsl(var(--stage-relief)))`
              : `linear-gradient(135deg, hsl(var(--stage-obsession)), hsl(var(--stage-compulsion) / 0.85))`,
            color: "hsl(var(--background))",
            ...(step >= TOTAL - 1 ? { opacity: 0.7 } : {}),
          }}
        >
          {stage.button}
        </button>
      </div>
    </div>
  );
};

export default OcdCycle;
