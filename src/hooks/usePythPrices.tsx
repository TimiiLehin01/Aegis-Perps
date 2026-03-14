import { useState, useEffect, useRef } from "react";

export interface PythPrice {
  id: string;
  price: number;
  conf: number;
  expo: number;
  time: number;
}

export type PythPriceMap = Record<string, PythPrice>;

export const PYTH_IDS = {
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  JUP: "0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996",
  WIF: "0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc",
} as const;

const HERMES_URL = "https://hermes.pyth.network";
const IDS = Object.values(PYTH_IDS);

function parsePriceUpdate(raw: {
  id: string;
  price: { price: string; conf: string; expo: number; publish_time: number };
}): PythPrice {
  const expo = raw.price.expo;
  const price = parseInt(raw.price.price) * Math.pow(10, expo);
  const conf = parseInt(raw.price.conf) * Math.pow(10, expo);
  return { id: raw.id, price, conf, expo, time: raw.price.publish_time };
}

export function usePythPrices(): PythPriceMap {
  const [prices, setPrices] = useState<PythPriceMap>({});
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const params = IDS.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");

    fetch(
      `${HERMES_URL}/v2/updates/price/latest?${params}&encoding=hex&parsed=true`,
    )
      .then((r) => r.json())
      .then((data) => {
        const map: PythPriceMap = {};
        for (const item of data.parsed ?? []) {
          const p = parsePriceUpdate(item);
          map[p.id] = p;
        }
        setPrices((prev) => ({ ...prev, ...map }));
      })
      .catch((e) => console.warn("[pyth] snapshot fetch failed", e));

    const url = `${HERMES_URL}/v2/updates/price/stream?${params}&encoding=hex&parsed=true&allow_unordered=true&benchmarks_only=false`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const map: PythPriceMap = {};
        for (const item of data.parsed ?? []) {
          const p = parsePriceUpdate(item);
          map[p.id] = p;
        }
        setPrices((prev) => ({ ...prev, ...map }));
      } catch {}
    };

    es.onerror = () => {
      es.close();
      const poll = setInterval(() => {
        fetch(
          `${HERMES_URL}/v2/updates/price/latest?${params}&encoding=hex&parsed=true`,
        )
          .then((r) => r.json())
          .then((data) => {
            const map: PythPriceMap = {};
            for (const item of data.parsed ?? []) {
              const p = parsePriceUpdate(item);
              map[p.id] = p;
            }
            setPrices((prev) => ({ ...prev, ...map }));
          })
          .catch(() => {});
      }, 2000);
      // Store poll id for cleanup
      (esRef.current as any)._poll = poll;
    };

    return () => {
      es.close();
      if ((esRef.current as any)?._poll) {
        clearInterval((esRef.current as any)._poll);
      }
    };
  }, []);

  return prices;
}
