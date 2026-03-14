import { useState, useEffect, useCallback, useMemo, type FC } from "react";
import { MARKETS as BASE_MARKETS } from "@/data/markets";
import { useLivePositions, useToast, usePythPrices, PYTH_IDS } from "@/hooks";
import { getMxeStatus } from "@/lib/arcium";

import Navbar from "@/components/Navbar";
import { Ticker, MarketBar } from "@/components/MarketBar";
import Orderbook from "@/components/Orderbook";
import CandleChart from "@/components/CandleChart";
import TradeForm from "@/components/TradeForm";
import PositionsPanel from "@/components/PositionsPanel";
import PnlReveal from "@/components/PnlReveal";
import StatsBar from "@/components/StatsBar";
import MobileNav from "@/components/MobileNav";
import { Toast } from "@/components/Primitives";
import PortfolioPanel from "@/components/PortfolioPanel";
import HistoryPanel from "@/components/HistoryPanel";
import MarketsPanel from "@/components/MarketsPanel";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import type {
  ActiveTab,
  MobilePanel,
  Market,
  Side,
  LevMultiple,
  Position,
} from "@/types";

// Map Pyth feed ID → our market ID
const PYTH_TO_MARKET: Record<string, string> = {
  [PYTH_IDS.SOL.replace("0x", "")]: "SOL",
  [PYTH_IDS.ETH.replace("0x", "")]: "ETH",
  [PYTH_IDS.BTC.replace("0x", "")]: "BTC",
  [PYTH_IDS.JUP.replace("0x", "")]: "JUP",
  [PYTH_IDS.WIF.replace("0x", "")]: "WIF",
};

const App: FC = () => {
  const pythPrices = usePythPrices();

  // Merge live Pyth prices into MARKETS
  const markets = useMemo<Market[]>(() => {
    return BASE_MARKETS.map((m) => {
      const liveEntry = Object.entries(pythPrices).find(
        ([id]) => PYTH_TO_MARKET[id] === m.id,
      );
      if (!liveEntry) return m;
      const live = liveEntry[1];
      return { ...m, price: live.price };
    });
  }, [pythPrices]);

  const [activeMarketId, setActiveMarketId] = useState<string>(
    BASE_MARKETS[0].id,
  );
  const market = useMemo(
    () => markets.find((m) => m.id === activeMarketId) ?? markets[0],
    [markets, activeMarketId],
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>("TRADE");
  const [revealPos, setRevealPos] = useState<Position | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chart");
  const [mxeNodes, setMxeNodes] = useState(3);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [toast, notify] = useToast();
  const {
    positions,
    closedTrades,
    addPosition,
    closePosition,
    revealPosition,
  } = useLivePositions();

  useEffect(() => {
    getMxeStatus().then((s) => setMxeNodes(s.nodes));
  }, []);

  const onResize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 1024);
    if (window.innerWidth >= 1024) setShowDrawer(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  const handleWalletToggle = () =>
    wallet.connected ? wallet.disconnect() : setVisible(true);

  const handleExecute = (
    side: Side,
    size: number,
    lev: LevMultiple,
    tp?: number,
    sl?: number,
  ) => {
    if (!wallet.connected) {
      setVisible(true);
      return;
    }
    addPosition(market, side, size, lev, tp, sl);
    notify(`Private ${side} sealed. Arcium MXE encrypting your position.`);
  };

  const handleReveal = (posId: number) => {
    const pos = positions.find((p) => p.id === posId);
    if (pos) {
      setRevealPos(pos);
      setShowDrawer(false);
    }
  };

  const handleRevealDone = (posId: number) => {
    revealPosition(posId);
    setRevealPos(null);
  };

  const handleClose = (posId: number) => {
    closePosition(posId);
    notify("Position closed privately via Arcium MXE.");
  };

  const handleMobilePanel = (p: MobilePanel) => {
    setMobilePanel(p);
    setShowDrawer(p === "book" || p === "positions");
    setActiveTab("TRADE");
  };

  const handleMarketChange = (m: Market) => {
    setActiveMarketId(m.id);
    setActiveTab("TRADE");
  };

  const renderTabContent = () => {
    if (activeTab === "PORTFOLIO")
      return <PortfolioPanel positions={positions} />;
    if (activeTab === "HISTORY")
      return <HistoryPanel closedTrades={closedTrades} />;
    if (activeTab === "MARKETS")
      return (
        <MarketsPanel
          active={market}
          onChange={handleMarketChange}
          markets={markets}
        />
      );
    return null;
  };

  const isTradeTab = activeTab === "TRADE";

  return (
    <div className="bg-void text-primary font-mono h-screen flex flex-col overflow-hidden text-base">
      <div className="noise-overlay" />
      <div className="scanlines-overlay" />
      {toast && <Toast msg={toast} />}

      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wallet={wallet.connected}
        onWalletToggle={handleWalletToggle}
        mxeNodes={mxeNodes}
      />
      <Ticker markets={markets} />

      {isTradeTab && (
        <MarketBar
          markets={markets}
          active={market}
          onChange={(m) => setActiveMarketId(m.id)}
        />
      )}

      {!isTradeTab && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {renderTabContent()}
        </div>
      )}

      {isTradeTab && (
        <div
          className="hidden lg:grid lg:grid-cols-trade overflow-hidden"
          style={{ flex: 1, minHeight: 0 }}
        >
          <div style={{ minHeight: 0, overflow: "hidden", height: "100%" }}>
            <Orderbook market={market} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
              height: "100%",
            }}
          >
            <CandleChart market={market} positions={positions} />
            <TradeForm
              market={market}
              onExecute={handleExecute}
              walletConnected={wallet.connected}
            />
          </div>
          <div style={{ minHeight: 0, overflow: "hidden", height: "100%" }}>
            <PositionsPanel
              positions={positions}
              onReveal={handleReveal}
              onClose={handleClose}
            />
          </div>
        </div>
      )}

      {isTradeTab && (
        <div
          className="flex lg:hidden overflow-hidden"
          style={{ flex: 1, minHeight: 0, position: "relative" }}
        >
          {/* Chart panel */}
          {mobilePanel === "chart" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "100%",
                minHeight: 0,
              }}
            >
              <CandleChart market={market} positions={positions} />
              <TradeForm
                market={market}
                onExecute={handleExecute}
                walletConnected={wallet.connected}
              />
            </div>
          )}
          {/* Form panel — no chart, just form */}
          {mobilePanel === "form" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "100%",
                minHeight: 0,
              }}
            >
              <TradeForm
                market={market}
                onExecute={handleExecute}
                walletConnected={wallet.connected}
              />
            </div>
          )}
          {/* Book panel — chart stays behind, drawer slides over */}
          {mobilePanel === "book" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "100%",
                minHeight: 0,
              }}
            >
              <CandleChart market={market} positions={positions} />
            </div>
          )}
          {/* Markets panel — full screen market switcher */}
          {mobilePanel === "markets" && (
            <div style={{ width: "100%", minHeight: 0, overflow: "hidden" }}>
              <MarketsPanel
                active={market}
                onChange={(m) => {
                  handleMarketChange(m);
                  setMobilePanel("chart");
                }}
                markets={markets}
              />
            </div>
          )}
          {/* Positions panel — fully replaces everything */}
          {mobilePanel === "positions" && !showDrawer && (
            <div style={{ width: "100%", minHeight: 0, overflow: "hidden" }}>
              <PositionsPanel
                positions={positions}
                onReveal={handleReveal}
                onClose={handleClose}
              />
            </div>
          )}
          {/* Portfolio panel */}
          {mobilePanel === "portfolio" && (
            <div style={{ width: "100%", minHeight: 0, overflow: "auto" }}>
              <PortfolioPanel positions={positions} />
            </div>
          )}
          {/* History panel */}
          {mobilePanel === "history" && (
            <div style={{ width: "100%", minHeight: 0, overflow: "auto" }}>
              <HistoryPanel closedTrades={closedTrades} />
            </div>
          )}
        </div>
      )}

      <MobileNav
        panel={mobilePanel}
        onChange={handleMobilePanel}
        positions={positions.length}
      />
      <StatsBar positions={positions} />

      {showDrawer && !isDesktop && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setShowDrawer(false)}
          />
          <div className="drawer-panel">
            <div className="flex items-center justify-between px-4 py-2 border-b border-dim flex-shrink-0">
              <span className="text-xs text-muted tracking-label uppercase">
                {mobilePanel === "book" ? "Order Book" : "Positions"}
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-muted text-xl leading-none hover:text-primary transition-colors"
              >
                ×
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(88dvh - 48px)" }}
            >
              {mobilePanel === "book" && <Orderbook market={market} />}
              {mobilePanel === "positions" && (
                <PositionsPanel
                  positions={positions}
                  onReveal={handleReveal}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>
        </>
      )}

      {revealPos && (
        <PnlReveal
          pos={revealPos}
          onClose={() => setRevealPos(null)}
          onDone={handleRevealDone}
        />
      )}
    </div>
  );
};

export default App;
