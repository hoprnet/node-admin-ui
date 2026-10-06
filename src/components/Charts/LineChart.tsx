import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { formatCompact } from '../../utils/format';
import { v } from '../../theme';

export type Point = { t: number; v: number };

/*
 * Single-series time chart (small multiples, one metric each): 2px line,
 * faint area wash, hairline grid, end dot, crosshair + tooltip on hover.
 * `compact` drops the axes for sparklines.
 */

const Wrap = styled.div`
  position: relative;
  width: 100%;
  svg {
    display: block;
    overflow: visible;
  }
  .tick {
    font-family: var(--font-mono);
    font-size: 10.5px;
    fill: ${v.text3};
  }
  .tooltip {
    position: absolute;
    top: 0;
    pointer-events: none;
    transform: translateX(-50%);
    padding: 5px 8px;
    border-radius: 6px;
    background: ${v.surface};
    border: 1px solid ${v.border};
    box-shadow: ${v.shadowOverlay};
    font-size: 12px;
    white-space: nowrap;
    z-index: 2;
    strong {
      display: block;
      font-family: var(--font-mono);
      font-weight: 500;
      color: ${v.text};
    }
    span {
      color: ${v.text3};
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: ${v.text3};
  }
`;

const niceStep = (range: number, ticks: number) => {
  const raw = range / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw || 1));
  const normalized = raw / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
};

const timeLabel = (t: number) =>
  new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export default function LineChart({
  data,
  height = 120,
  compact = false,
  unit = '',
  label,
  format = (value: number) => formatCompact(value),
}: {
  data: Point[];
  height?: number;
  compact?: boolean;
  unit?: string;
  label: string;
  format?: (value: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, set_width] = useState(0);
  const [hover, set_hover] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => set_width(entries[0].contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pad = compact ? { top: 4, right: 5, bottom: 4, left: 0 } : { top: 8, right: 6, bottom: 20, left: 40 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;

  const scale = useMemo(() => {
    if (data.length === 0) return null;
    const t0 = data[0].t;
    const t1 = data[data.length - 1].t;
    const max = Math.max(...data.map((p) => p.v));
    const min = Math.min(0, ...data.map((p) => p.v));
    const step = niceStep(max - min || 1, compact ? 2 : 3);
    const top = Math.max(step, Math.ceil(max / step) * step);
    const ticks: number[] = [];
    for (let value = min; value <= top + step / 2; value += step) ticks.push(value);
    const x = (t: number) => pad.left + (t1 === t0 ? innerW : ((t - t0) / (t1 - t0)) * innerW);
    const y = (value: number) => pad.top + innerH - ((value - min) / (top - min || 1)) * innerH;
    return { x, y, ticks, t0, t1 };
  }, [data, innerW, innerH, compact]);

  const path = scale ? data.map((p, i) => `${i ? 'L' : 'M'}${scale.x(p.t)},${scale.y(p.v)}`).join(' ') : '';
  const area =
    scale && data.length > 1
      ? `${path} L${scale.x(data[data.length - 1].t)},${scale.y(scale.ticks[0])} L${scale.x(data[0].t)},${scale.y(
          scale.ticks[0],
        )} Z`
      : '';
  const last = data[data.length - 1];
  const hovered = hover !== null ? data[hover] : null;

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    if (!scale || data.length === 0) return;
    const box = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = event.clientX - box.left + pad.left;
    let best = 0;
    data.forEach((p, i) => {
      if (Math.abs(scale.x(p.t) - px) < Math.abs(scale.x(data[best].t) - px)) best = i;
    });
    set_hover(best);
  };

  return (
    <Wrap ref={ref}>
      {data.length < 2 || !scale || width === 0 ? (
        <div
          className="empty"
          style={{ height }}
        >
          {width === 0 ? '' : 'Collecting data…'}
        </div>
      ) : (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${label}, last value ${format(last.v)}${unit}`}
        >
          {!compact &&
            scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={pad.left + innerW}
                  y1={scale.y(tick)}
                  y2={scale.y(tick)}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  className="tick"
                  x={pad.left - 8}
                  y={scale.y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {format(tick)}
                </text>
              </g>
            ))}
          {!compact && (
            <>
              <text
                className="tick"
                x={pad.left}
                y={height - 4}
              >
                {timeLabel(scale.t0)}
              </text>
              <text
                className="tick"
                x={pad.left + innerW}
                y={height - 4}
                textAnchor="end"
              >
                {timeLabel(scale.t1)}
              </text>
            </>
          )}
          <path
            d={area}
            fill="var(--accent)"
            opacity={0.1}
          />
          <path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={compact ? 1.5 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hovered && (
            <line
              x1={scale.x(hovered.t)}
              x2={scale.x(hovered.t)}
              y1={pad.top}
              y2={pad.top + innerH}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
          )}
          <circle
            cx={scale.x((hovered ?? last).t)}
            cy={scale.y((hovered ?? last).v)}
            r={compact ? 3 : 4}
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
          <rect
            x={pad.left}
            y={0}
            width={innerW}
            height={height}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => set_hover(null)}
          />
        </svg>
      )}
      {hovered && scale && (
        <div
          className="tooltip"
          style={{ left: Math.min(Math.max(scale.x(hovered.t), 50), width - 50), top: compact ? -40 : -8 }}
        >
          <strong>
            {format(hovered.v)}
            {unit}
          </strong>
          <span>{timeLabel(hovered.t)}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((p) => (
            <tr key={p.t}>
              <td>{timeLabel(p.t)}</td>
              <td>
                {format(p.v)}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Wrap>
  );
}
