import { useState, useCallback } from "react";

const STAGES = [
  {
    type: "obsession",
    label: "obsession",
    text: "A sudden intrusive thought appears.\n\"What if I lose control?\"\nIt feels urgent and important.",
    button: "Yes… that happens.",
    color: "var(--stage-obsession)",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "Your body reacts.\nTension rises.\nYour mind says, \"Fix this now.\"",
    button: "I feel that.",
    color: "var(--stage-anxiety)",
  },
  {
    type: "compulsion",
    label: "compulsion",
    text: "You start checking.\nReplaying.\nAnalyzing the thought to feel safe.",
    button: "That's exactly what I do.",
    color: "var(--stage-compulsion)",
  },
  {
    type: "relief",
    label: "relief",
    text: "Anxiety drops a little.\nYou feel temporary safety.",
    button: "Okay… that helps.",
    color: "var(--stage-relief)",
  },
  {
    type: "obsession",
    label: "obsession",
    text: "Your brain learns:\n\"Thought + Checking = Relief.\"\nSo it sends the thought again.",
    button: "Wait… really?",
    color: "var(--stage-obsession)",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "The thought feels stronger now.\nMore convincing.",
    button: "That explains a lot.",
    color: "var(--stage-anxiety)",
  },
  {
    type: "compulsion",
    label: "compulsion",
    text: "Checking becomes automatic.\nA habit.",
    button: "I didn't notice that.",
    color: "var(--stage-compulsion)",
  },
  {
    type: "relief",
    label: "relief",
    text: "Relief comes again —\nbut fades faster.\nThe loop tightens.",
    button: "Oh…",
    color: "var(--stage-relief)",
  },
  {
    type: "obsession",
    label: "obsession",
    text: "The real fuel isn't the thought.\nIt's how important it feels.",
    button: "So what now?",
    color: "var(--stage-obsession)",
  },
  {
    type: "anxiety",
    label: "anxiety",
    text: "Anxiety is uncomfortable —\nbut not dangerous.\nWhat if you didn't solve the thought?",
    button: "But how?",
    color: "var(--stage-anxiety)",
  },
  {
    type: "mantra",
    label: "OCD Mantra",
    text: "The way out isn't more checking.\nIt's allowing the thought without solving it.\n\nOver time, your brain learns it's not a threat.\n\nThis is what OCD Mantra helps you practice.",
    button: "I'm ready to practice differently.",
    color: "var(--stage-mantra)",
  },
];

const TOTAL = STAGES.length;
const CIRCLE_RADIUS = 140;
const STROKE_WIDTH = 2;
const ARC_STROKE = 3;
const SVG_SIZE = 320;
const CENTER = SVG_SIZE / 2;

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const OcdCycle = () => {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  const stage = STAGES[step] ?? STAGES[TOTAL - 1];
  const progress = (step + 1) / TOTAL;
  const rotation = step * (360 / 4); // rotate by quarter each step
  const arcEnd = progress * 360;

  const handleNext = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, TOTAL - 1));
      setFading(false);
    }, 300);
  }, []);

  const isMantra = stage.type === "mantra";

  return (
    <div className="flex flex-col min-h-screen bg-background items-center px-4 py-6 max-w-md mx-auto">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3 mb-6">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-foreground"
          onClick={() => {
            if (step > 0) {
              setFading(true);
              setTimeout(() => {
                setStep((s) => s - 1);
                setFading(false);
              }, 300);
            }
          }}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: "hsl(var(--foreground))",
            }}
          />
        </div>
      </div>

      {/* Circle area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        {/* SVG Circle */}
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Dashed circle outline */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="hsl(var(--stage-obsession) / 0.25)"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray="8 6"
            />
            {/* Progress arc */}
            {arcEnd > 0.5 && (
              <path
                d={describeArc(CENTER, CENTER, CIRCLE_RADIUS, 0, Math.min(arcEnd, 359.9))}
                fill="none"
                stroke={isMantra ? "hsl(var(--stage-mantra))" : "hsl(var(--stage-obsession))"}
                strokeWidth={ARC_STROKE}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Center content (counter-rotated to stay upright) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            {/* Stage label at top of circle */}
            <div
              className={`absolute transition-all duration-300 ${fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
              style={{ top: "16px" }}
            >
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: isMantra ? "hsl(var(--stage-mantra))" : "hsl(var(--foreground))" }}
              >
                {stage.label}
              </span>
            </div>

            {/* Content card */}
            <div
              className={`bg-card rounded-2xl p-5 shadow-sm border border-border max-w-[240px] text-center transition-all duration-300 ${
                fading ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              style={{
                boxShadow: isMantra
                  ? "0 0 30px hsl(var(--stage-mantra) / 0.15)"
                  : "0 4px 20px hsl(var(--foreground) / 0.06)",
              }}
            >
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {stage.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="w-full mt-6 pb-4">
        <button
          onClick={handleNext}
          disabled={step >= TOTAL - 1 && true}
          className={`w-full py-4 px-6 rounded-2xl text-base font-medium transition-all duration-300 ${
            fading ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
          } ${
            step >= TOTAL - 1
              ? "text-primary-foreground"
              : "bg-foreground text-background"
          }`}
          style={
            isMantra
              ? { backgroundColor: "hsl(var(--stage-mantra))", color: "hsl(var(--background))" }
              : undefined
          }
        >
          {stage.button}
        </button>
      </div>
    </div>
  );
};

export default OcdCycle;
