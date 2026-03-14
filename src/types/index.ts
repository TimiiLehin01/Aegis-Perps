import type { ReactNode } from "react";

/* ── Market ─────────────────────────────────────────────────── */

export interface Market {
  id: string;
  pair: string;
  price: number;
  ch: number;
  vol: string;
  logo?: string;
  oi?: string;
  fund?: string;
}

/* ── Charting ───────────────────────────────────────────────── */

export interface Candle {
  time: number;
  o: number;
  h: number;
  l: number;
  c: number;
  up: boolean;
}

/* ── Orderbook ──────────────────────────────────────────────── */

export interface BookLevel {
  price: number;
  size: number;
  cum: number;
}

export interface Order {
  price: number;
  size: number;
  total: number;
  cum?: number;
}

export interface Orderbook {
  bids: Order[];
  asks: Order[];
}

/* ── Trading primitives ─────────────────────────────────────── */

export type Side = "LONG" | "SHORT";
export type OrderType = "MARKET" | "LIMIT" | "STOP";
export type LevMultiple = 1 | 2 | 5 | 10 | 20 | 25 | 50 | 100;
export type ActiveTab = "TRADE" | "PORTFOLIO" | "HISTORY" | "MARKETS";
export type MobilePanel =
  | "chart"
  | "book"
  | "trade"
  | "positions"
  | "markets"
  | "form"
  | "portfolio"
  | "history";

/* ── Domain models ──────────────────────────────────────────── */

export interface Position {
  readonly id: number;
  readonly market: string;
  readonly side: Side;
  readonly lev: LevMultiple;
  readonly size: number;
  readonly entry: number;
  readonly tp?: number;
  readonly sl?: number;
  mark: number;
  pnl: number;
  pct: number;
  shown: boolean;
}

export interface ClosedTrade {
  id: number;
  time: string;
  market: string;
  side: Side;
  size: number;
  lev: LevMultiple;
  entry: number;
  exit: number;
  pnl: number;
  pct: number;
  fee: number;
  status: "SEALED" | "REVEALED";
}

/* ── Arcium / MPC ───────────────────────────────────────────── */

export interface SealPayload {
  size: number;
  leverage: LevMultiple;
  side: Side;
  entryPrice: number;
  market: string;
}

export interface LiqProofResult {
  shouldLiquidate: boolean;
  proof: Uint8Array;
}

export interface PnlRevealResult {
  pnl: number;
  proof: Uint8Array;
}

export interface MxeStatus {
  nodes: number;
  healthy: boolean;
  latencyMs: number;
}

/* ── Component props ────────────────────────────────────────── */

export interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (t: ActiveTab) => void;
  wallet: boolean;
  onWalletToggle: () => void;
  mxeNodes: number;
}

export interface MarketBarProps {
  markets: Market[];
  active: Market;
  onChange: (m: Market) => void;
}

export interface CandleChartProps {
  market: Market;
  positions?: Position[];
}

export interface OrderbookProps {
  market: Market;
}

export interface TradeFormProps {
  market: Market;
  onExecute: (
    side: Side,
    size: number,
    lev: LevMultiple,
    tp?: number,
    sl?: number,
  ) => void;
  walletConnected: boolean;
}

export interface PositionsPanelProps {
  positions: Position[];
  onReveal: (id: number) => void;
  onClose: (id: number) => void;
}

export interface PnlRevealProps {
  pos: Position;
  onClose: () => void;
  onDone: (id: number) => void;
}

export interface StatsBarProps {
  positions: Position[];
}

export interface MobileNavProps {
  panel: MobilePanel;
  onChange: (p: MobilePanel) => void;
  positions: number;
}

/* ── Primitive props ────────────────────────────────────────── */

export interface EncValProps {
  children: ReactNode;
  variant?: "mxe" | "amber";
}
export interface PanelHeaderProps {
  title: string;
  badge?: string;
}
export interface StatCellProps {
  label: string;
  value: ReactNode;
  color?: string;
}
export interface MpcVizProps {
  size?: number;
}
export interface LockIconProps {
  className?: string;
  size?: number;
}
export interface ToastProps {
  msg: string;
}
