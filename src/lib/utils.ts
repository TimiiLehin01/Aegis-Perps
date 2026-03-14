import type { Orderbook, Order, Candle } from "@/types";

export const f2 = (n: number): string =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fP = (n: number): string =>
  n >= 1000 ? f2(n) : n >= 1 ? n.toFixed(4) : n.toFixed(7);

export const sign = (n: number): string => (n >= 0 ? "+" : "");

export function genBook(mid: number): Orderbook {
  const step = mid * 0.00042;
  const asks: Order[] = [];
  const bids: Order[] = [];
  let cumA = 0,
    cumB = 0;

  for (let i = 0; i < 14; i++) {
    const sz = Math.random() * 480 + 35;
    cumA += sz;
    asks.push({
      price: mid + step * (i + 1),
      size: sz,
      total: cumA,
    });
  }

  for (let i = 0; i < 14; i++) {
    const sz = Math.random() * 480 + 35;
    cumB += sz;
    bids.push({
      price: mid - step * (i + 1),
      size: sz,
      total: cumB,
    });
  }

  return { asks: asks.reverse(), bids };
}

export function genCandles(n: number, base: number): Candle[] {
  const raw: Candle[] = [];
  let p = base;

  const now = Math.floor(Date.now() / 1000);
  const interval = 900;

  for (let i = 0; i < n; i++) {
    const o = p;
    const d = (Math.random() - 0.5) * p * 0.014;
    const c = o + d;

    raw.unshift({
      time: now - i * interval,
      o: c,
      c: o,
      h: Math.max(o, c) + Math.random() * p * 0.005,
      l: Math.min(o, c) - Math.random() * p * 0.004,
      up: o >= c,
    });
    p = c;
  }

  return raw.map((candle, i) => {
    if (i === raw.length - 1) {
      const isUp = base >= candle.o;
      return {
        ...candle,
        c: base,
        h: Math.max(candle.o, base) + Math.random() * base * 0.003,
        l: Math.min(candle.o, base) - Math.random() * base * 0.003,
        up: isUp,
      };
    }
    return { ...candle, up: candle.c >= candle.o };
  });
}
