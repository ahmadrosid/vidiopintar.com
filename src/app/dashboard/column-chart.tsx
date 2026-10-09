"use client";

import { useEffect, useRef, useState } from "react";

export type ChartSeries = { key: string; label: string; color: string };

export type ChartPoint = { label: string; values: Record<string, number> };

interface ColumnChartProps {
  title: string;
  series: ChartSeries[];
  points: ChartPoint[];
  unit: "count" | "bytes";
}

const countFormat = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

const mbFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

const formatters = {
  count: (value: number) => countFormat.format(value),
  bytes: (value: number) => `${mbFormat.format(value / 1_000_000)} MB`,
};

const HEIGHT = 200;

const PAD = { top: 12, right: 8, bottom: 28, left: 52 };

const GAP = 2;

const MAX_BAR = 24;

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;

  return step * magnitude;
}

// A square-cornered column.
function rect(x: number, y: number, width: number, height: number) {
  return `M${x},${y}H${x + width}V${y + height}H${x},Z`;
}

export function ColumnChart({ title, series, points, unit }: ColumnChartProps) {
  const format = formatters[unit];
  const wrapRef = useRef<HTMLDivElement>(null);
  // Unknown until measured, so the server render never assumes a width that could overflow.
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

  const totals = points.map((point) => series.reduce((sum, item) => sum + (point.values[item.key] ?? 0), 0));
  const empty = totals.every((total) => total === 0);
  // Counts get at least 0 / 1 / 2 so the middle tick is never a fraction of a request.
  const yMax = Math.max(niceMax(Math.max(...totals, 0)), unit === "count" ? 2 : 0);
  const chartWidth = width ?? 0;
  const plotW = chartWidth - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / Math.max(points.length, 1);
  const barW = Math.max(2, Math.min(MAX_BAR, band - GAP));
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;
  const ticks = empty ? [0] : [0, yMax / 2, yMax];
  const xLabels = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) => Math.min(points.length - 1, Math.max(0, (current ?? (step > 0 ? -1 : points.length)) + step)));
  };

  const activePoint = active === null ? null : points[active];
  const tooltipLeft = active === null ? 0 : Math.min(Math.max(PAD.left + band * (active + 0.5), 80), chartWidth - 80);

  return (
    <figure className="space-y-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="text-sm text-site-text">{title}</span>
        {series.length > 1 && (
          <span className="flex gap-4 text-xs text-site-text-muted">
            {series.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2.5" style={{ background: item.color }} />
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
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
            className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={chartWidth - PAD.right} y1={y(tick)} y2={y(tick)} style={{ stroke: "var(--site-line)" }} strokeWidth={1} />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-site-text-faint text-[11px] tabular-nums">
                  {format(tick)}
                </text>
              </g>
            ))}

            {points.map((point, index) => {
              const x = PAD.left + band * index + (band - barW) / 2;
              let base = 0;

              const segments = series
                .map((item) => ({ item, value: point.values[item.key] ?? 0 }))
                .filter((segment) => segment.value > 0);

              return (
                <g key={point.label} opacity={active === null || active === index ? 1 : 0.45}>
                  {segments.map(({ item, value }, segmentIndex) => {
                    const bottom = y(base);
                    base += value;
                    // Leave a 2px surface gap above every segment that has one stacked on it.
                    const top = y(base) + (segmentIndex < segments.length - 1 ? GAP : 0);
                    const height = Math.max(1, bottom - top);
                    const isTop = segmentIndex === segments.length - 1;

                    return isTop ? (
                      <path key={item.key} d={rect(x, bottom - height, barW, height)} fill={item.color} />
                    ) : (
                      <rect key={item.key} x={x} y={bottom - height} width={barW} height={height} fill={item.color} />
                    );
                  })}
                  <rect
                    x={PAD.left + band * index}
                    y={PAD.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    onPointerEnter={() => setActive(index)}
                  />
                </g>
              );
            })}

            {xLabels.map((index, position) =>
              points[index] ? (
                <text
                  key={`${index}-${position}`}
                  x={PAD.left + band * (index + 0.5)}
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
