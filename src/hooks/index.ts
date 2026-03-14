import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { genBook, genCandles } from "@/lib/utils";
import type {
  Position,
  ClosedTrade,
  Market,
  Side,
  LevMultiple,
  Orderbook,
  Candle,
} from "@/types";

/* ── useToast ─────────────────────────────────────────────────────────────── */

export function useToast(
  durationMs = 3400,
): [string | null, (msg: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(msg);
      timer.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return [toast, notify];
}

/* ── useLivePositions ─────────────────────────────────────────────────────── */

interface UseLivePositionsReturn {
  positions: Position[];
  closedTrades: ClosedTrade[];
  addPosition: (
    market: Market,
    side: Side,
    size: number,
    lev: LevMultiple,
    tp?: number,
    sl?: number,
  ) => Position;
  closePosition: (id: number) => void;
  revealPosition: (id: number) => void;
}

export function useLivePositions(): UseLivePositionsReturn {
  const { publicKey } = useWallet();
  const walletKey = publicKey?.toString() ?? "anon";

  const posKey = `aegis_positions_${walletKey}`;
  const tradesKey = `aegis_trades_${walletKey}`;

  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const raw = localStorage.getItem(`aegis_positions_${walletKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => {
    try {
      const raw = localStorage.getItem(`aegis_trades_${walletKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const rawP = localStorage.getItem(posKey);
      setPositions(rawP ? JSON.parse(rawP) : []);
      const rawT = localStorage.getItem(tradesKey);
      setClosedTrades(rawT ? JSON.parse(rawT) : []);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletKey]);

  useEffect(() => {
    try {
      localStorage.setItem(posKey, JSON.stringify(positions));
    } catch {}
  }, [positions, posKey]);

  useEffect(() => {
    try {
      localStorage.setItem(tradesKey, JSON.stringify(closedTrades));
    } catch {}
  }, [closedTrades, tradesKey]);

  useEffect(() => {
    const id = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => {
          const newMark = p.mark * (1 + (Math.random() - 0.5) * 0.0012);
          const size = p.size ?? 1;
          const rawPnl =
            p.side === "LONG"
              ? (newMark - p.entry) * size
              : (p.entry - newMark) * size;
          const pnl = rawPnl * p.lev;
          const margin = p.entry * size;
          const pct = (pnl / margin) * 100;
          return { ...p, mark: newMark, pnl, pct };
        }),
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const addPosition = useCallback(
    (
      market: Market,
      side: Side,
      size: number,
      lev: LevMultiple,
      tp?: number,
      sl?: number,
    ): Position => {
      const pos: Position = {
        id: Date.now(),
        market: market.pair,
        side,
        lev,
        size,
        entry: market.price,
        mark: market.price,
        pnl: 0,
        pct: 0,
        shown: false,
        ...(tp ? { tp } : {}),
        ...(sl ? { sl } : {}),
      };
      setPositions((prev) => [pos, ...prev]);
      return pos;
    },
    [],
  );

  const closePosition = useCallback((id: number) => {
    setPositions((prev) => {
      const pos = prev.find((p) => p.id === id);
      if (!pos) return prev;

      const exitPrice = pos.mark;
      const rawPnl =
        pos.side === "LONG"
          ? (exitPrice - pos.entry) * pos.size
          : (pos.entry - exitPrice) * pos.size;
      const pnl = parseFloat((rawPnl * pos.lev).toFixed(2));
      const margin = pos.entry * pos.size;
      const pct = parseFloat(((pnl / margin) * 100).toFixed(2));
      const fee = parseFloat(
        (pos.entry * pos.size * pos.lev * 0.0002).toFixed(2),
      );
      const now = new Date();
      const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const trade: ClosedTrade = {
        id: pos.id,
        time,
        market: pos.market,
        side: pos.side,
        size: pos.size,
        lev: pos.lev,
        entry: pos.entry,
        exit: exitPrice,
        pnl,
        pct,
        fee,
        status: pos.shown ? "REVEALED" : "SEALED",
      };

      setTimeout(() => setClosedTrades((ct) => [trade, ...ct]), 0);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const revealPosition = useCallback((id: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, shown: true } : p)),
    );
  }, []);

  return {
    positions,
    closedTrades,
    addPosition,
    closePosition,
    revealPosition,
  };
}

/* ── useOrderbook ─────────────────────────────────────────────────────────── */

export function useOrderbook(market: Market, intervalMs = 2200): Orderbook {
  const [book, setBook] = useState<Orderbook>(() => genBook(market.price));

  useEffect(() => {
    setBook(genBook(market.price));
    const id = setInterval(
      () => setBook(genBook(market.price + (Math.random() - 0.5) * 0.08)),
      intervalMs,
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id]);

  return book;
}

/* ── useCandles ───────────────────────────────────────────────────────────── */

export function useCandles(
  market: Market,
  count = 64,
  intervalMs = 3200,
  volatility = 0.004,
): Candle[] {
  const [candles, setCandles] = useState<Candle[]>(() =>
    genCandles(count, market.price),
  );
  const marketPriceRef = useRef(market.price);

  useEffect(() => {
    const prev = marketPriceRef.current;
    const pct = Math.abs(market.price - prev) / prev;
    if (pct > 0.05) {
      setCandles(genCandles(count, market.price));
    }
    marketPriceRef.current = market.price;
  }, [market.price, count]);

  useEffect(() => {
    setCandles(genCandles(count, market.price));
    marketPriceRef.current = market.price;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id, count, volatility]);

  useEffect(() => {
    const id = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const anchor = marketPriceRef.current;
        const drift = (anchor - last.c) * 0.08;
        const noise = (Math.random() - 0.5) * last.c * volatility;
        const nc = last.c + drift + noise;
        // time advances by the implied candle duration (use last.time + 1 as a safe fallback)
        const nextTime = last.time + 1;
        return [
          ...prev.slice(1),
          {
            time: nextTime,
            o: last.c,
            c: nc,
            h:
              Math.max(last.c, nc) +
              Math.random() * last.c * (volatility * 0.5),
            l:
              Math.min(last.c, nc) -
              Math.random() * last.c * (volatility * 0.4),
            up: nc >= last.c,
          },
        ];
      });
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return candles;
}

/* ── useMediaQuery ────────────────────────────────────────────────────────── */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const h = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", h);
    return () => mql.removeEventListener("change", h);
  }, [query]);

  return matches;
}

export { usePythPrices, PYTH_IDS } from "./usePythPrices";
export type { PythPrice, PythPriceMap } from "./usePythPrices";

export { useOhlcv } from "./useOhlcv";
export type { Timeframe } from "./useOhlcv";
