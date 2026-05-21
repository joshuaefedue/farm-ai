"use client";

interface DualLineChartProps {
  data: [number, number, number][];
  height?: number;
}

export function DualLineChart({ data, height = 220 }: DualLineChartProps) {
  const W = 720;
  const H = height;
  const P = { l: 42, r: 42, t: 14, b: 28 };

  const eggs = data.map((d) => d[0]);
  const mort = data.map((d) => d[1]);

  const eggMax = Math.max(...eggs);
  const eggMin = Math.min(...eggs);
  const mortMax = Math.max(...mort);
  const eggRange = eggMax - eggMin || 1;
  const mortRange = mortMax || 1;

  const innerW = W - P.l - P.r;
  const innerH = H - P.t - P.b;

  const x = (i: number) => P.l + (i / (data.length - 1)) * innerW;
  const ye = (v: number) => P.t + innerH - ((v - eggMin) / eggRange) * innerH;
  const ym = (v: number) => P.t + innerH - (v / mortRange) * innerH;

  const ePoints = data.map((d, i) => `${x(i)},${ye(d[0])}`).join(" ");
  const mPoints = data.map((d, i) => `${x(i)},${ym(d[1])}`).join(" ");

  const gridYRatios = [0, 0.25, 0.5, 0.75, 1];

  const xLabels = [0, 7, 14, 21, 29];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height }}
      aria-label="Production chart — eggs and mortality over 30 days"
    >
      {/* Grid lines */}
      {gridYRatios.map((t, i) => {
        const y = P.t + innerH * t;
        return (
          <line
            key={i}
            x1={P.l}
            x2={W - P.r}
            y1={y}
            y2={y}
            className="chart-gridline"
          />
        );
      })}

      {/* Egg area fill */}
      <path
        d={`M${P.l},${H - P.b} L${ePoints.split(" ").join(" L")} L${W - P.r},${H - P.b} Z`}
        className="chart-area acc"
      />

      {/* Egg line */}
      <polyline points={ePoints} className="chart-line acc" />

      {/* Mortality line */}
      <polyline points={mPoints} className="chart-line dng" />

      {/* X-axis labels */}
      {xLabels.map((i) => (
        <text
          key={i}
          className="chart-axis"
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
        >
          {i === 29 ? "1d" : `${30 - i}d`}
        </text>
      ))}

      {/* Left axis — egg labels */}
      <text className="chart-axis" x={P.l - 6} y={ye(eggMax)} textAnchor="end">
        {(eggMax / 1000).toFixed(1)}k
      </text>
      <text className="chart-axis" x={P.l - 6} y={ye(eggMin) - 2} textAnchor="end">
        {(eggMin / 1000).toFixed(1)}k
      </text>

      {/* Right axis — mortality labels */}
      <text className="chart-axis" x={W - P.r + 6} y={ym(mortMax)} textAnchor="start">
        {mortMax}
      </text>
      <text className="chart-axis" x={W - P.r + 6} y={ym(0) - 2} textAnchor="start">
        0
      </text>
    </svg>
  );
}
