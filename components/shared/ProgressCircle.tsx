"use client";

interface ProgressCircleProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressCircle({
  progress,
  size = 40,
  strokeWidth = 3,
  color = "currentColor",
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.1s ease-out",
          }}
          strokeLinecap="round"
        />
      </svg>

    </div>
  );
}
