import { useState, useCallback } from "react";
import { Brain, Zap, RefreshCw, Heart } from "lucide-react";

type StageType = "obsession" | "anxiety" | "compulsion" | "relief" | "mantra";

interface Stage {
  type: StageType;
  label: string;
  text: string;
  button: string;
}

const STAGES: Stage[] = [
  { type: "obsession", label: "obsession", text: "A sudden intrusive thought appears.\n\"What if I lose control?\"\nIt feels urgent and important.", button: "I notice the thought." },
  { type: "anxiety", label: "anxiety", text: "Your body reacts.\nTension rises.\nYour mind says, \"Fix this now.\"", button: "Anxiety is here." },
  { type: "compulsion", label: "compulsion", text: "You start checking.\nReplaying.\nAnalyzing the thought to feel safe.", button: "I’m doing a compulsion." },
  { type: "relief", label: "relief", text: "Anxiety drops a little.\nYou feel temporary safety.", button: "Relief is temporary." },
  { type: "obsession", label: "obsession", text: "Your brain learns:\n\"Thought + Checking = Relief.\"\nSo it sends the thought again.", button: "That reinforces the cycle." },
  { type: "anxiety", label: "anxiety", text: "The thought feels stronger now.\nMore convincing.", button: "The urge is stronger now." },
  { type: "compulsion", label: "compulsion", text: "Checking becomes automatic.\nA habit.", button: "It’s becoming automatic." },
  { type: "relief", label: "relief", text: "Relief comes again —\nbut fades faster.\nThe loop tightens.", button: "The cycle is tightening." },
  { type: "obsession", label: "obsession", text: "The real fuel isn't the thought.\nIt's how important it feels.", button: "What if I don’t respond?" },
  { type: "anxiety", label: "anxiety", text: "Anxiety is uncomfortable —\nbut not dangerous.\nWhat if you didn't solve the thought?", button: "Can I sit with the discomfort?" },
  { type: "mantra", label: "OCD Mantra", text: "The way out isn't more checking.\nIt's allowing the thought without solving it.\n\nOver time, your brain learns it's not a threat.\n\nThis is what OCD Mantra helps you practice.", button: "I’ll allow the thought." },
];

const STAGE_COLORS: Record<StageType, string> = {
  obsession: "hsl(var(--stage-obsession))",
  anxiety: "hsl(var(--stage-anxiety))",
  compulsion: "hsl(var(--stage-compulsion))",
  relief: "hsl(var(--stage-relief))",
  mantra: "hsl(var(--stage-mantra))",
};

const STAGE_ICONS: Record<StageType, React.ReactNode> = {
  obsession: <Brain size={14} />,
  anxiety: <Zap size={14} />,
  compulsion: <RefreshCw size={14} />,
  relief: <Heart size={14} />,
  mantra: <Heart size={14} />,
};

const TOTAL = STAGES.length;
const R = 190;
const SVG = 500;
const C = SVG / 2;

// Fixed label positions — these sit on/near the circle boundary
const LABELS: { type: StageType; x: number; y: number }[] = [
  { type: "obsession", x: C, y: C - R - 10 },       // top (50)
  { type: "anxiety", x: C + R + 10, y: C },        // right (450)
  { type: "compulsion", x: C, y: C + R + 10 },    // bottom (450)
  { type: "relief", x: C - R - 10, y: C },         // left (50)
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const OcdCycle = () => {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  // Track cumulative clockwise rotation (always increases)
  const [cumulativeRotation, setCumulativeRotation] = useState(0);

  const stage = STAGES[step] ?? STAGES[TOTAL - 1];
  const progress = (step + 1) / TOTAL;
  const arcDeg = progress * 360;
  const isMantra = stage.type === "mantra";
  const stageColor = STAGE_COLORS[stage.type];

  // Map stage type to which quarter it belongs (for rotation target)
  const typeToQuarter: Record<StageType, number> = {
    obsession: 0,
    anxiety: 1,
    compulsion: 2,
    relief: 3,
    mantra: 0,
  };

  const advance = useCallback((delta: 1 | -1) => {
    const nextStep = step + delta;
    if (nextStep < 0 || nextStep >= TOTAL) return;

    setFading(true);

    const currentType = STAGES[step].type;
    const nextType = STAGES[nextStep].type;
    const currentQ = typeToQuarter[currentType];
    const nextQ = typeToQuarter[nextType];

    // Calculate shortest clockwise step
    let rotDelta = ((nextQ - currentQ) % 4 + 4) % 4;
    // For going back, allow counter-clockwise
    if (delta === -1 && rotDelta > 0) {
      rotDelta = rotDelta - 4;
    }

    setTimeout(() => {
      setStep(nextStep);
      setCumulativeRotation((prev) => prev + rotDelta * 90);
      setFading(false);
    }, 300);
  }, [step]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center px-5 py-6 max-w-xl mx-auto select-none">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3 mb-4">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground active:scale-90 transition-transform"
          onClick={() => advance(-1)}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="relative" style={{ width: SVG, height: SVG }}>

          {/* SVG — dashed circle + progress arc — this rotates */}
          <svg
            width={SVG}
            height={SVG}
            viewBox={`0 0 ${SVG} ${SVG}`}
            className="absolute inset-0"
            style={{
              transform: `rotate(${cumulativeRotation}deg)`,
              transition: "transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)",
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
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.13)"
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />

            {/* Progress arc */}
            {arcDeg > 2 && (
              <path
                d={arcPath(C, C, R, 0, Math.min(arcDeg, 359.5))}
                fill="none"
                stroke={isMantra ? "url(#arcGradMantra)" : "url(#arcGrad)"}
                strokeWidth={3}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Fixed labels — these DO NOT rotate, they stay in place */}
          {LABELS.map((item) => {
            const isActive = item.type === stage.type;
            const isTop = item.y < C / 2;
            const isBottom = item.y > SVG - C / 2;
            const isLeft = item.x < C / 2;
            const isRight = item.x > SVG - C / 2;

            let anchor: React.CSSProperties = {};
            // Flip anchors: if it's on top, anchor by its bottom so it grows UP
            if (isTop) anchor = { bottom: SVG - item.y, left: "50%", transform: "translateX(-50%)" };
            else if (isBottom) anchor = { top: item.y, left: "50%", transform: "translateX(-50%)" };
            else if (isRight) anchor = { left: item.x, top: "50%", transform: "translateY(-50%)" };
            else if (isLeft) anchor = { right: SVG - item.x, top: "50%", transform: "translateY(-50%)" };

            return (
              <div
                key={item.type}
                className="absolute flex flex-col items-center gap-0.5 pointer-events-none transition-opacity duration-400"
                style={{
                  ...anchor,
                  opacity: isActive ? 1 : (isMantra ? 0.2 : 0.3),
                  color: STAGE_COLORS[item.type],
                }}
              >
                {STAGE_ICONS[item.type]}
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{
                    fontWeight: isActive ? 700 : 500,
                  }}
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
              className={`flex items-center gap-1.5 mb-3 transition-all duration-300 ${fading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                }`}
              style={{ color: stageColor }}
            >
              {STAGE_ICONS[stage.type]}
              <span className="text-sm font-bold tracking-wide lowercase">
                {stage.label}
              </span>
            </div>

            {/* Content card */}
            <div
              className={`rounded-2xl p-5 max-w-[230px] text-center transition-all duration-300 ${fading ? "opacity-0 scale-95 translate-y-1" : "opacity-100 scale-100 translate-y-0"
                }`}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: isMantra
                  ? "0 0 40px hsl(var(--stage-mantra) / 0.12), 0 4px 24px hsl(var(--stage-mantra) / 0.08)"
                  : "0 4px 24px hsl(var(--foreground) / 0.05), 0 1px 4px hsl(var(--foreground) / 0.03)",
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
          onClick={() => advance(1)}
          disabled={step >= TOTAL - 1}
          className={`w-full py-4 px-6 rounded-2xl text-[15px] font-semibold transition-all duration-300 active:scale-[0.97] ${fading ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
            }`}
          style={{
            background: isMantra
              ? "linear-gradient(135deg, hsl(var(--stage-mantra)), hsl(var(--stage-relief)))"
              : "linear-gradient(135deg, hsl(var(--stage-obsession)), hsl(var(--stage-compulsion) / 0.85))",
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
