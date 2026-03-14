import { useState, useEffect, useRef } from "react";
import { genCandles } from "@/lib/utils";
import type { Candle, Market } from "@/types";

export type Timeframe = "15M" | "1H" | "4H" | "1D" | "1W";

const COINGECKO_IDS: Record<string, string> = {
  SOL: "solana",
  ETH: "ethereum",
  BTC: "bitcoin",
};

const TF_CONFIG: Record<
  Timeframe,
  {
    days: number;
    interval: string;
    count: number;
    display: number;
    seconds: number;
  }
> = {
  "15M": { days: 0, interval: "none", count: 80, display: 80, seconds: 900 },
  "1H": { days: 1, interval: "hourly", count: 24, display: 24, seconds: 3600 },
  "4H": {
    days: 11,
    interval: "hourly",
    count: 100,
    display: 100,
    seconds: 14400,
  },
  "1D": { days: 64, interval: "daily", count: 64, display: 64, seconds: 86400 },
  "1W": {
    days: 365,
    interval: "daily",
    count: 52,
    display: 52,
    seconds: 604800,
  },
};

async function fetchOhlcv(
  marketId: string,
  tf: Timeframe,
  currentPrice: number,
): Promise<Candle[]> {
  if (tf === "15M") return genCandles(80, currentPrice);

  const cgId = COINGECKO_IDS[marketId];
  if (!cgId) return genCandles(TF_CONFIG[tf].count, currentPrice);

  const cfg = TF_CONFIG[tf];
  const url = `https://api.coingecko.com/api/v3/coins/${cgId}/ohlc?vs_currency=usd&days=${cfg.days}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data: [number, number, number, number, number][] = await res.json();

  let candles: Candle[] = data.map(([ts, o, h, l, c]) => ({
    time: ts / 1000,
    o,
    h,
    l,
    c,
    up: c >= o,
  }));

  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.c = currentPrice;
    last.h = Math.max(last.h, currentPrice);
    last.l = Math.min(last.l, currentPrice);
    last.up = currentPrice >= last.o;
  }

  return candles;
}

export function useOhlcv(market: Market, tf: Timeframe) {
  const [candles, setCandles] = useState<Candle[]>(() =>
    genCandles(80, market.price),
  );
  const [loading, setLoading] = useState(false);
  const priceRef = useRef(market.price);
  const cacheRef = useRef<Map<string, Candle[]>>(new Map());

  useEffect(() => {
    priceRef.current = market.price;
  }, [market.price]);

  useEffect(() => {
    const key = `${market.id}-${tf}`;
    if (cacheRef.current.has(key)) {
      setCandles(cacheRef.current.get(key)!);
      return;
    }

    setLoading(true);
    fetchOhlcv(market.id, tf, priceRef.current)
      .then((c) => {
        cacheRef.current.set(key, c);
        setCandles(c);
      })
      .catch(() =>
        setCandles(genCandles(TF_CONFIG[tf].count, priceRef.current)),
      )
      .finally(() => setLoading(false));
  }, [market.id, tf]);

  useEffect(() => {
    const config = TF_CONFIG[tf];

    const id = setInterval(() => {
      setCandles((prev) => {
        if (!prev.length) return prev;

        const now = Math.floor(Date.now() / 1000);
        const last = prev[prev.length - 1];
        const anchor = priceRef.current;

        const nc =
          last.c +
          (anchor - last.c) * 0.35 +
          (Math.random() - 0.5) * anchor * 0.0004;

        const nextCandleTime = last.time + config.seconds;
        if (now >= nextCandleTime) {
          return [
            ...prev.slice(1),
            {
              time: nextCandleTime,
              o: last.c,
              c: nc,
              h: Math.max(last.c, nc, anchor),
              l: Math.min(last.c, nc, anchor),
              up: nc >= last.c,
            },
          ];
        }

        const updated = {
          ...last,
          c: nc,
          h: Math.max(last.h, nc, anchor),
          l: Math.min(last.l, nc, anchor),
          up: nc >= last.o,
        };
        return [...prev.slice(0, -1), updated];
      });
    }, 3000);

    return () => clearInterval(id);
  }, [tf]);

  return { candles, loading, display: TF_CONFIG[tf].display };
}
