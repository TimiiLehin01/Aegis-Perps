import { useState, useEffect, useRef, type FC } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
} from "lightweight-charts";
import { fP } from "@/lib/utils";
import { useOhlcv, type Timeframe } from "@/hooks/useOhlcv";
import type { CandleChartProps } from "@/types";

const TF: Timeframe[] = ["15M", "1H", "4H", "1D", "1W"];

const CandleChart: FC<CandleChartProps> = ({ market }) => {
  const [tf, setTf] = useState<Timeframe>("15M");
  const { candles } = useOhlcv(market, tf);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [legend, setLegend] = useState<{
    o: number;
    h: number;
    l: number;
    c: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#07090e" },
        textColor: "#4a5a72",
        fontFamily: "IBM Plex Mono",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#111722", style: LineStyle.Solid },
        horzLines: { color: "#111722", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: "#182030" },
        horzLine: { labelBackgroundColor: "#182030" },
      },
      rightPriceScale: {
        borderColor: "#182030",
        textColor: "#4a5a72",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#182030",
        timeVisible: true,
        barSpacing: 10,
      },
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00e676",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#00e676",
      wickDownColor: "#f43f5e",
    });

    const maSeries = chart.addSeries(LineSeries, {
      color: "#f5a623",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    maRef.current = maSeries;

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (
        !param.time ||
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setLegend((prev) => prev);
        return;
      }
      const data = param.seriesData.get(candleSeries);
      if (data) {
        const d = data as any;
        setLegend({ o: d.open, h: d.high, l: d.low, c: d.close });
      }
    });

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candleRef.current || !maRef.current || candles.length === 0) return;

    const data = candles.map((c) => ({
      time: c.time as any,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    }));

    candleRef.current.setData(data);

    const last = data[data.length - 1];
    setLegend({ o: last.open, h: last.high, l: last.low, c: last.close });

    const ma = data
      .map((v, i, a) => {
        if (i < 7) return null;
        const avg = a.slice(i - 7, i).reduce((s, x) => s + x.close, 0) / 7;
        return { time: v.time, value: avg };
      })
      .filter((v): v is { time: any; value: number } => v !== null);

    maRef.current.setData(ma);
  }, [candles]);

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#182030] bg-[#0b0e18] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
            <span className="text-[9px] text-[#00e676] font-bold tracking-widest font-mono uppercase">
              Live
            </span>
          </div>
          <div className="w-[1px] h-6 bg-[#182030]" />
          <div>
            <div className="text-[8px] text-[#323d54] uppercase tracking-wider">
              Market
            </div>
            <div className="font-mono text-xs text-[#d8e2f0] font-semibold">
              {market.pair}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#0e1220] border border-[#182030] rounded p-0.5">
          {TF.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-2.5 py-1 text-[9px] font-mono rounded transition-colors ${
                t === tf
                  ? "bg-[#182030] text-[#f5a623]"
                  : "text-[#323d54] hover:text-[#4a5a72]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-[250px] w-full">
        {legend && (
          <div className="absolute top-2 left-4 z-20 pointer-events-none flex items-center gap-3 bg-[#07090e]/40 backdrop-blur-md p-1.5 rounded font-mono">
            <span className="text-[11px] font-bold text-[#f5a623]">{tf}</span>
            <div className="flex gap-2.5 text-[10px]">
              {(["O", "H", "L", "C"] as const).map((k) => {
                const val =
                  k === "O"
                    ? legend.o
                    : k === "H"
                      ? legend.h
                      : k === "L"
                        ? legend.l
                        : legend.c;
                return (
                  <span key={k} className="text-[#4a5a72]">
                    {k}{" "}
                    <span
                      className={
                        legend.c >= legend.o
                          ? "text-[#00e676]"
                          : "text-[#f43f5e]"
                      }
                    >
                      {fP(val)}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default CandleChart;
