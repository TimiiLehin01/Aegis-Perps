import { useState, useEffect, type FC } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { f2 } from "@/lib/utils";
import { EncVal, ArciumPrivacySeal } from "./Primitives";
import type { TradeFormProps, Side, LevMultiple, OrderType } from "@/types";

const ORDER_TYPES: OrderType[] = ["MARKET", "LIMIT", "STOP"];
const LEVERAGES: LevMultiple[] = [1, 2, 5, 10, 25];
const BTN_AREA_H = 64;

const TradeForm: FC<TradeFormProps> = ({
  market,
  onExecute,
  walletConnected,
}) => {
  const { setVisible } = useWalletModal();
  const { connecting, publicKey, signMessage } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [balanceTick, setBalanceTick] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey || !walletConnected) {
      setSolBalance(null);
      return;
    }

    connection
      .getBalance(publicKey)
      .then((l) => setSolBalance(l / 1e9))
      .catch(() => setSolBalance(null));
  }, [publicKey, walletConnected, connection, balanceTick]);

  const [side, setSide] = useState<Side>("LONG");
  const [otype, setOtype] = useState<OrderType>("MARKET");
  const [size, setSize] = useState("");
  const [lev, setLev] = useState<LevMultiple>(5);
  const [lxPx, setLxPx] = useState(f2(market.price));
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [showTpSl, setShowTpSl] = useState(false);

  const sizeNum = parseFloat(size || "0") || 0;
  const notional = sizeNum * market.price * lev;
  const margin = notional / lev;
  const fee = notional * 0.0002;
  const isLong = side === "LONG";
  const balanceUsd = solBalance !== null ? solBalance * market.price : null;

  const insufficient =
    walletConnected &&
    sizeNum > 0 &&
    balanceUsd !== null &&
    margin > balanceUsd;

  const canExecute =
    walletConnected &&
    sizeNum > 0 &&
    !insufficient &&
    !connecting &&
    !isSubmitting;

  const btnBg =
    connecting || isSubmitting
      ? "#1a1b1e"
      : !walletConnected
        ? "rgba(255,255,255,0.06)"
        : insufficient
          ? "rgba(244,63,94,0.15)"
          : sizeNum <= 0
            ? "rgba(255,255,255,0.04)"
            : isLong
              ? "#10b981"
              : "#f43f5e";

  const btnColor =
    connecting || isSubmitting
      ? "#a1a1aa"
      : !walletConnected
        ? "#6a7a9a"
        : insufficient
          ? "#f43f5e"
          : sizeNum <= 0
            ? "#3f3f46"
            : isLong
              ? "#000"
              : "#fff";

  const btnLabel = connecting
    ? "Handshaking..."
    : isSubmitting
      ? "Awaiting Signature..."
      : !walletConnected
        ? "⚡ Connect Wallet"
        : insufficient
          ? "Insufficient Balance"
          : sizeNum <= 0
            ? "Enter Size"
            : `Open ${side} · ${lev}x`;

  const buildTradeMessage = () => {
    const entryPrice =
      otype === "MARKET"
        ? market.price
        : parseFloat(lxPx || "0") || market.price;

    return [
      "Aegis Private Perps Trade Authorization",
      `Market: ${market.id}`,
      `Side: ${side}`,
      `Order Type: ${otype}`,
      `Size: ${sizeNum}`,
      `Leverage: ${lev}x`,
      `Entry Price: ${f2(entryPrice)}`,
      `Take Profit: ${tp || "None"}`,
      `Stop Loss: ${sl || "None"}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join("\n");
  };

  const handleExecute = async () => {
    setSubmitError(null);

    if (!walletConnected) {
      setVisible(true);
      return;
    }

    if (!canExecute) return;

    try {
      setIsSubmitting(true);

      if (!publicKey) {
        throw new Error("Wallet public key not found.");
      }

      if (!signMessage) {
        throw new Error(
          "This wallet does not support message signing. Please use a wallet that supports signing.",
        );
      }

      const message = buildTradeMessage();
      const encoded = new TextEncoder().encode(message);

      // This triggers the wallet signature popup
      const signature = await signMessage(encoded);

      if (!signature) {
        throw new Error("Signature was not completed.");
      }

      await onExecute(
        side,
        sizeNum,
        lev,
        tp ? parseFloat(tp) : undefined,
        sl ? parseFloat(sl) : undefined,
      );

      setSize("");
      setTp("");
      setSl("");
      setTimeout(() => setBalanceTick((n) => n + 1), 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Trade execution failed.";
      setSubmitError(msg);
      console.error("Trade execution/signing error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0c0d10",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: `${BTN_AREA_H + 28}px`,
          minHeight: 0,
        }}
      >
        <div style={{ padding: "10px 16px 0" }}>
          <div
            style={{
              display: "flex",
              padding: "4px",
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {(["LONG", "SHORT"] as Side[]).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 200ms",
                  backgroundColor:
                    side === s
                      ? s === "LONG"
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(244,63,94,0.12)"
                      : "transparent",
                  color:
                    side === s
                      ? s === "LONG"
                        ? "#34d399"
                        : "#f43f5e"
                      : "#52525b",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 16px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {ORDER_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setOtype(t)}
                style={{
                  paddingBottom: "8px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  transition: "all 150ms",
                  color: otype === t ? "#f5a623" : "#52525b",
                  borderBottom:
                    otype === t ? "1px solid #f5a623" : "1px solid transparent",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: "16px", position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "absolute",
                left: "12px",
                right: "12px",
                top: "8px",
                zIndex: 1,
              }}
            >
              <label
                style={{
                  fontSize: "10px",
                  color: "#52525b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Size
              </label>
              <span
                style={{ fontSize: "10px", color: "#52525b", fontWeight: 700 }}
              >
                Avail:{" "}
                <span
                  style={{ color: walletConnected ? "#d4d4d8" : "#3f3f46" }}
                >
                  {walletConnected
                    ? solBalance !== null
                      ? `${solBalance.toFixed(3)} SOL`
                      : "Loading..."
                    : "--"}
                </span>
              </span>
            </div>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: insufficient
                  ? "rgba(244,63,94,0.05)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${insufficient ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: "12px",
                paddingTop: "22px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                paddingRight: "40px",
                fontSize: "16px",
                fontFamily: "IBM Plex Mono",
                color: "#d8e2f0",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="0.00"
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                bottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#3f3f46",
              }}
            >
              {market.id}
            </span>
          </div>

          {otype !== "MARKET" && (
            <div style={{ marginBottom: "16px", position: "relative" }}>
              <label
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "8px",
                  fontSize: "10px",
                  color: "#52525b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Price
              </label>
              <input
                value={lxPx}
                onChange={(e) => setLxPx(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  paddingTop: "22px",
                  paddingBottom: "8px",
                  paddingLeft: "12px",
                  paddingRight: "40px",
                  fontSize: "16px",
                  fontFamily: "IBM Plex Mono",
                  color: "#d8e2f0",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#3f3f46",
                }}
              >
                USD
              </span>
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#52525b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Leverage
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: "IBM Plex Mono",
                  color: "#f5a623",
                  backgroundColor: "rgba(245,166,35,0.1)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(245,166,35,0.2)",
                }}
              >
                {lev}×
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "6px",
              }}
            >
              {LEVERAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLev(l)}
                  style={{
                    padding: "6px 0",
                    fontSize: "10px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: `1px solid ${lev === l ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                    backgroundColor:
                      lev === l ? "rgba(255,255,255,0.08)" : "transparent",
                    color: lev === l ? "#fff" : "#52525b",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  {l}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => setShowTpSl((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: showTpSl ? "10px" : 0,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#52525b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                TP / SL
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: showTpSl ? "#f5a623" : "#3f3f46",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {showTpSl ? "▲" : "▼"}
              </span>
              {(tp || sl) && (
                <span
                  style={{
                    fontSize: "9px",
                    color: "#f5a623",
                    backgroundColor: "rgba(245,166,35,0.1)",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    fontFamily: "IBM Plex Mono",
                  }}
                >
                  SET
                </span>
              )}
            </button>

            {showTpSl && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "7px",
                      fontSize: "9px",
                      color: "#34d399",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    TP
                  </label>
                  <input
                    value={tp}
                    onChange={(e) => setTp(e.target.value)}
                    placeholder={f2(market.price * (isLong ? 1.05 : 0.95))}
                    style={{
                      width: "100%",
                      backgroundColor: tp
                        ? "rgba(52,211,153,0.05)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${tp ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: "10px",
                      paddingTop: "20px",
                      paddingBottom: "7px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      fontSize: "12px",
                      fontFamily: "IBM Plex Mono",
                      color: "#d8e2f0",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "7px",
                      fontSize: "9px",
                      color: "#f43f5e",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    SL
                  </label>
                  <input
                    value={sl}
                    onChange={(e) => setSl(e.target.value)}
                    placeholder={f2(market.price * (isLong ? 0.95 : 1.05))}
                    style={{
                      width: "100%",
                      backgroundColor: sl
                        ? "rgba(244,63,94,0.05)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sl ? "rgba(244,63,94,0.25)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: "10px",
                      paddingTop: "20px",
                      paddingBottom: "7px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      fontSize: "12px",
                      fontFamily: "IBM Plex Mono",
                      color: "#d8e2f0",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "16px",
            }}
          >
            {[
              { label: "Notional", value: `$${f2(notional)}` },
              { label: "Margin", value: `$${f2(margin)}` },
              { label: "Est. Fee", value: `$${f2(fee)}` },
              {
                label: "Liq. Price",
                value: <EncVal>SHIELDED</EncVal>,
                amber: true,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: idx < 3 ? "10px" : 0,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#52525b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "IBM Plex Mono",
                    color: item.amber ? "#f5a623" : "#d4d4d8",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <ArciumPrivacySeal />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: `${BTN_AREA_H}px`,
          padding: "10px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "#0c0d10",
        }}
      >
        {insufficient && (
          <div
            style={{
              fontSize: "10px",
              color: "#f43f5e",
              textAlign: "center",
              marginBottom: "6px",
              fontFamily: "IBM Plex Mono",
            }}
          >
            Insufficient — margin required: ${f2(margin)}
          </div>
        )}

        {submitError && (
          <div
            style={{
              fontSize: "10px",
              color: "#f43f5e",
              textAlign: "center",
              marginBottom: "6px",
              fontFamily: "IBM Plex Mono",
            }}
          >
            {submitError}
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={connecting || isSubmitting}
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "10px",
            border: "none",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: canExecute || !walletConnected ? "pointer" : "not-allowed",
            transition: "all 150ms",
            backgroundColor: btnBg,
            color: btnColor,
            opacity:
              sizeNum <= 0 && walletConnected && !insufficient && !isSubmitting
                ? 0.3
                : 1,
            boxShadow: canExecute
              ? isLong
                ? "0 0 30px -10px rgba(16,185,129,0.6)"
                : "0 0 30px -10px rgba(244,63,94,0.6)"
              : "none",
          }}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
};

export default TradeForm;
