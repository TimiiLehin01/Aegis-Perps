import { useState, useEffect, useCallback, useMemo, type FC } from "react";
import { MARKETS as BASE_MARKETS } from "@/data/markets";
import { useLivePositions, useToast, usePythPrices, PYTH_IDS } from "@/hooks";
import { getMxeStatus, sealPosition } from "@/lib/arcium";

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

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import * as anchor from "@coral-xyz/anchor";

import type {
  ActiveTab,
  MobilePanel,
  Market,
  Side,
  LevMultiple,
  Position,
} from "@/types";

const PYTH_TO_MARKET: Record<string, string> = {
  [PYTH_IDS.SOL.replace("0x", "")]: "SOL",
  [PYTH_IDS.ETH.replace("0x", "")]: "ETH",
  [PYTH_IDS.BTC.replace("0x", "")]: "BTC",
  [PYTH_IDS.JUP.replace("0x", "")]: "JUP",
  [PYTH_IDS.WIF.replace("0x", "")]: "WIF",
};

const App: FC = () => {
  const pythPrices = usePythPrices();

  const markets = useMemo<Market[]>(() => {
    return BASE_MARKETS.map((m) => {
      const liveEntry = Object.entries(pythPrices).find(
        ([id]) => PYTH_TO_MARKET[id] === m.id,
      );
      if (!liveEntry) return m;
      return { ...m, price: liveEntry[1].price };
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

  const wallet = useWallet();
  const { connection } = useConnection();
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
    if (window.innerWidth >= 1024) setShowDrawer(false);
  }, []);
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  const handleWalletToggle = () =>
    wallet.connected ? wallet.disconnect() : setVisible(true);

  // Always build a fresh provider from current wallet + connection
  const getProvider = useCallback(
    () =>
      new anchor.AnchorProvider(
        connection,
        wallet as unknown as anchor.Wallet,
        { commitment: "confirmed" },
      ),
    [connection, wallet],
  );

  const handleExecute = async (
    side: Side,
    size: number,
    lev: LevMultiple,
    tp?: number,
    sl?: number,
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }

    try {
      notify(`Encrypting position via Arcium MXE...`);
      const provider = getProvider();
      await sealPosition(provider, {
        size,
        leverage: lev,
        side,
        entryPrice: market.price,
        market: market.pair,
      });
      addPosition(market, side, size, lev, tp, sl);
      notify(`Private ${side} sealed via Arcium MXE.`);
    } catch (err: any) {
      console.error("sealPosition error:", err);
      // Still add locally even if MXE seal fails
      addPosition(market, side, size, lev, tp, sl);
      notify(`Private ${side} opened (simulation mode).`);
    }
  };

  const handleReveal = (posId: number) => {
    const pos = positions.find((p) => p.id === posId);
    if (pos) {
      setRevealPos(pos);
      setShowDrawer(false);
    }
  };

  const handleRevealDone = async (posId: number) => {
    revealPosition(posId);
    setRevealPos(null);
    notify("PnL revealed.");
  };

  const handleClose = (posId: number) => {
    closePosition(posId);
    notify("Position closed.");
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
            {/* Chart: flex-1, TradeForm: fixed height */}
            <div
              style={{
                flex: "0 0 60%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <CandleChart market={market} />
            </div>
            <div
              style={{ flex: "0 0 40%", position: "relative", minHeight: 0 }}
            >
              <TradeForm
                market={market}
                onExecute={handleExecute}
                walletConnected={wallet.connected}
              />
            </div>
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
              <div
                style={{
                  flex: "0 0 55%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CandleChart market={market} />
              </div>
              <div
                style={{ flex: "0 0 45%", position: "relative", minHeight: 0 }}
              >
                <TradeForm
                  market={market}
                  onExecute={handleExecute}
                  walletConnected={wallet.connected}
                />
              </div>
            </div>
          )}

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
              <CandleChart market={market} />
            </div>
          )}

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

          {mobilePanel === "positions" && !showDrawer && (
            <div style={{ width: "100%", minHeight: 0, overflow: "hidden" }}>
              <PositionsPanel
                positions={positions}
                onReveal={handleReveal}
                onClose={handleClose}
              />
            </div>
          )}

          {mobilePanel === "portfolio" && (
            <div style={{ width: "100%", minHeight: 0, overflow: "auto" }}>
              <PortfolioPanel positions={positions} />
            </div>
          )}

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

      {showDrawer && (
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
