import { useState, useEffect, useRef, type FC } from "react";
import { f2, sign } from "@/lib/utils";
import { MpcViz } from "./Primitives";
import type { PnlRevealProps } from "@/types";

type Phase = "computing" | "done";

const PnlReveal: FC<PnlRevealProps> = ({ pos, onClose, onDone }) => {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<Phase>("computing");

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      const jump =
        p < 62
          ? Math.random() * 3.5 + 0.8
          : p < 88
            ? Math.random() * 0.8 + 0.1
            : Math.random() * 2.5 + 0.5;
      p = Math.min(100, p + jump);
      setPct(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          setPhase("done");
          onDoneRef.current(pos.id);
        }, 260);
      }
    }, 40);
    return () => clearInterval(id);
  }, [pos.id]);

  const size = pos.size ?? 1;
  const rawPnl =
    pos.side === "LONG"
      ? (pos.mark - pos.entry) * size
      : (pos.entry - pos.mark) * size;
  const realPnl = parseFloat((rawPnl * pos.lev).toFixed(2));
  const margin = pos.entry * size;
  const realPct = parseFloat(((realPnl / margin) * 100).toFixed(2));
  const isProfit = realPnl >= 0;
  const pnlCls = isProfit ? "text-long" : "text-short";

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: "rgba(7,9,14,0.92)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase === "done") onClose();
      }}
    >
      <div
        className={`relative bg-surface border rounded-md shadow-modal
                      w-full max-w-[400px] px-6 sm:px-[34px] py-8 sm:py-[38px]
                      text-center amber-topbar
                      ${phase === "computing" ? "animate-border-glow" : "border-enc-border"}`}
      >
        <p className="text-xs text-mid tracking-widest uppercase mb-1">
          PnL Settlement
        </p>
        <p className="font-display text-2xl sm:text-3xl font-extrabold text-primary mb-1">
          {pos.market}
        </p>
        <p
          className={`text-sm tracking-label mb-5 ${pos.side === "LONG" ? "text-long" : "text-short"}`}
        >
          {pos.side} {pos.lev}× POSITION
        </p>

        <div className="flex justify-center mb-5">
          <div className="block sm:hidden">
            <MpcViz size={90} />
          </div>
          <div className="hidden sm:block">
            <MpcViz size={116} />
          </div>
        </div>

        {phase === "computing" && (
          <div>
            <p className="text-xs text-mxe-dim tracking-label uppercase mb-2">
              Arcium MPC Computing Result...
            </p>
            <div className="h-0.5 bg-enc rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full mxe-gradient rounded-full transition-[width] duration-[40ms]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-muted font-mono">{Math.floor(pct)}%</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              {["ARX-1", "ARX-2", "ARX-3"].map((n, i) => (
                <div key={n} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-mxe animate-mpc-pulse"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  />
                  <span className="text-2xs text-mxe-dim tracking-badge">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="animate-fade-up">
            <p
              className={`font-display text-4xl sm:text-5xl font-extrabold mb-1.5 ${pnlCls}`}
            >
              {isProfit ? "+" : "-"}${f2(Math.abs(realPnl))}
            </p>
            <p className={`text-md opacity-65 mb-1 font-mono ${pnlCls}`}>
              {sign(realPct)}
              {Math.abs(realPct).toFixed(2)}% return on position
            </p>
            <p className="text-xs text-muted tracking-label mb-6 leading-relaxed">
              Computed privately · Position sealed · Only PnL surfaced
            </p>
            <button
              onClick={onClose}
              className="text-sm text-amber border border-amber-dim px-6 py-2.5 rounded
                         tracking-wide uppercase font-mono hover:bg-amber-subtle transition-colors"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PnlReveal;
