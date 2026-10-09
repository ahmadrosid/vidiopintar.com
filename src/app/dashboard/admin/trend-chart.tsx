"use client";

import { useEffect, useId, useRef, useState } from "react";

export type TrendSeries = { key: string; label: string; color: string };

type TrendPoint = { label: string; values: Record<string, number> };

interface TrendChartProps {
  title: string;
  series: TrendSeries[];
  points: TrendPoint[];
  unit: "count" | "idr";
}

const countFormat = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

const formatters = {
  count: (value: number) => countFormat.format(value),
  idr: (value: number) => `Rp ${countFormat.format(value)}`,
};

const HEIGHT = 220;

const PAD = { top: 16, right: 12, bottom: 28, left: 56 };

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;

  return step * magnitude;
}

// Catmull-Rom converted to cubic Béziers, so the line passes through every point without corners.
function smoothPath(points: [number, number][]) {
  let d = `M${points[0][0]},${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }

  return d;
}

export function TrendChart({ title, series, points, unit }: TrendChartProps) {
  const format = formatters[unit];
  const gradientId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = wrapRef.current;

    if (!node) return;
    setWidth(Math.max(280, node.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const values = points.flatMap((point) => series.map((item) => point.values[item.key] ?? 0));
  const empty = values.every((value) => value === 0);
  const yMax = niceMax(Math.max(...values, 0));
  const chartWidth = width ?? 0;
  const plotW = chartWidth - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const baseY = PAD.top + plotH;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;
  const x = (index: number) => PAD.left + step * index;
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;
  const ticks = [0, yMax / 2, yMax];
  const xLabels = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const primary = series[0];

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const left = event.currentTarget.getBoundingClientRect().left;
    const index = step > 0 ? Math.round((event.clientX - left - PAD.left) / step) : 0;
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) => Math.min(points.length - 1, Math.max(0, (current ?? (delta > 0 ? -1 : points.length)) + delta)));
  };

  const activePoint = active === null ? null : points[active];
  const tooltipLeft = active === null ? 0 : Math.min(Math.max(x(active), 80), chartWidth - 80);

  return (
    <figure className="space-y-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="text-sm text-site-text">{title}</span>
        {series.length > 1 && (
          <span className="flex gap-4 text-xs text-site-text-muted">
            {series.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-0.5 w-3" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </span>
        )}
      </figcaption>

      <div ref={wrapRef} className="relative" style={{ height: HEIGHT }}>
        {width !== null && (
          <svg
            width={chartWidth}
            height={HEIGHT}
            role="img"
            aria-label={`${title}. Gunakan panah kiri dan kanan untuk membaca nilai per hari.`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerMove={onPointerMove}
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
            className="block touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={primary.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={primary.color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={chartWidth - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  style={{ stroke: "var(--site-line-soft)" }}
                  strokeWidth={1}
                />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-site-text-faint text-[11px] tabular-nums">
                  {format(tick)}
                </text>
              </g>
            ))}

            {!empty && series.length > 0 && (
              <path
                d={`${smoothPath(points.map((point, index): [number, number] => [x(index), y(point.values[primary.key] ?? 0)]))}L${x(points.length - 1)},${baseY}L${x(0)},${baseY}Z`}
                fill={`url(#${gradientId})`}
              />
            )}

            {series.map((item, seriesIndex) => (
              <path
                key={item.key}
                d={smoothPath(points.map((point, index): [number, number] => [x(index), y(point.values[item.key] ?? 0)]))}
                fill="none"
                stroke={item.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={seriesIndex > 0 ? "4 4" : undefined}
              />
            ))}

            {activePoint && active !== null && (
              <g>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={baseY}
                  style={{ stroke: "var(--site-line-strong)" }}
                  strokeDasharray="2 3"
                  strokeWidth={1}
                />
                {series.map((item) => (
                  <circle
                    key={item.key}
                    cx={x(active)}
                    cy={y(activePoint.values[item.key] ?? 0)}
                    r={4.5}
                    fill={item.color}
                    style={{ stroke: "var(--site-panel)" }}
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}

            {xLabels.map((index, position) =>
              points[index] ? (
                <text
                  key={`${index}-${position}`}
                  x={x(index)}
                  y={HEIGHT - 8}
                  textAnchor={position === 0 ? "start" : position === 2 ? "end" : "middle"}
                  className="fill-site-text-faint text-[11px]"
                >
                  {points[index].label}
                </text>
              ) : null,
            )}

            {empty && (
              <text x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} textAnchor="middle" className="fill-site-text-faint text-xs">
                Belum ada data
              </text>
            )}
          </svg>
        )}

        {activePoint && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 border border-site-line bg-site-header px-3 py-2 text-xs shadow-lg"
            style={{ left: tooltipLeft }}
          >
            <p className="mb-1.5 text-site-text-muted">{activePoint.label}</p>
            {series.map((item) => (
              <p key={item.key} className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-3" style={{ background: item.color }} />
                <span className="font-semibold text-site-text tabular-nums">{format(activePoint.values[item.key] ?? 0)}</span>
                <span className="text-site-text-muted">{item.label}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}
