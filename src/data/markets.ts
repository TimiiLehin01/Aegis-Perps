import type { Market, Position } from "@/types";

export const MARKETS: Market[] = [
  {
    id: "SOL",
    pair: "SOL-PERP",
    price: 88.5,
    ch: +4.21,
    vol: "2.14B",
    oi: "840M",
    fund: "+0.0100%",
  },
  {
    id: "ETH",
    pair: "ETH-PERP",
    price: 2079.0,
    ch: -1.04,
    vol: "8.72B",
    oi: "3.21B",
    fund: "-0.0050%",
  },
  {
    id: "BTC",
    pair: "BTC-PERP",
    price: 71317.0,
    ch: +0.87,
    vol: "14.3B",
    oi: "9.80B",
    fund: "+0.0080%",
  },
  {
    id: "JUP",
    pair: "JUP-PERP",
    price: 0.1755,
    ch: +6.32,
    vol: "142M",
    oi: "38M",
    fund: "+0.0200%",
  },
  {
    id: "WIF",
    pair: "WIF-PERP",
    price: 0.1705,
    ch: -3.14,
    vol: "89M",
    oi: "22M",
    fund: "-0.0120%",
  },
];

export const INIT_POSITIONS: Position[] = [];
