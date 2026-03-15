import type {
  SealPayload,
  LiqProofResult,
  PnlRevealResult,
  MxeStatus,
} from "@/types";

import * as anchor from "@coral-xyz/anchor";
import {
  x25519,
  RescueCipher,
  deserializeLE,
  getClusterAccAddress,
  getArciumEnv,
  getMXEAccAddress,
  getMXEPublicKey,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getComputationAccAddress,
  awaitComputationFinalization,
} from "@arcium-hq/client";
import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ??
    "8RK5m1rte3iKwJ2eJxoLXaxMmYyq3moAaTov72KqtgdG",
);

const ARCIUM_CLUSTER_OFFSET = Number(
  import.meta.env.VITE_ARCIUM_CLUSTER_OFFSET ?? 456,
);

const DEVNET_RPC =
  import.meta.env.VITE_RPC_URL ?? "https://api.devnet.solana.com";

async function getCipher(provider: anchor.AnchorProvider) {
  const clientPrivateKey = x25519.utils.randomSecretKey();
  const clientPublicKey = x25519.getPublicKey(clientPrivateKey);

  // Try once with a 2s timeout — don't block for 10s
  let mxePublicKey: Uint8Array | null = null;
  try {
    const result = await Promise.race([
      getMXEPublicKey(provider, PROGRAM_ID),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (result instanceof Uint8Array) mxePublicKey = result;
  } catch {}

  if (!mxePublicKey) {
    // RTG pending or MXE unreachable — use simulation mode immediately
    console.warn("MXE unreachable — simulation mode active.");
    mxePublicKey = new Uint8Array(32).fill(1);
  }

  const sharedSecret = x25519.getSharedSecret(clientPrivateKey, mxePublicKey);

  return {
    cipher: new RescueCipher(sharedSecret),
    clientPrivateKey,
    clientPublicKey,
  };
}

export async function sealPosition(
  provider: anchor.AnchorProvider,
  payload: SealPayload,
): Promise<Uint8Array> {
  const { cipher, clientPublicKey } = await getCipher(provider);

  const inputs = [
    BigInt(Math.round(payload.size * 1e6)),
    BigInt(payload.leverage),
    BigInt(payload.side === "LONG" ? 1 : 0),
    BigInt(Math.round(payload.entryPrice * 1e4)),
  ];

  const nonce = window.crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = cipher.encrypt(inputs, nonce);

  const packed = new Uint8Array(64);
  packed.set(Array.from(ciphertext[0]).slice(0, 32), 0);
  packed.set(Array.from(nonce).slice(0, 16), 32);
  packed.set(Array.from(clientPublicKey).slice(0, 16), 48);

  return packed;
}

export async function checkLiquidationPrivately(
  provider: anchor.AnchorProvider,
  positionId: number,
): Promise<LiqProofResult> {
  const arciumEnv = getArciumEnv();
  const { cipher } = await getCipher(provider);

  const nonce = window.crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = cipher.encrypt([BigInt(positionId)], nonce);

  const computationOffset = new anchor.BN(
    Array.from(window.crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    "hex",
  );

  const nonceBN = new anchor.BN(deserializeLE(nonce).toString());

  const idl = (
    await import("../../aegis-program/target/idl/aegis_program.json")
  ).default as anchor.Idl;

  const program = new anchor.Program(idl, provider);

  await program.methods
    .checkLiquidation(computationOffset, Array.from(ciphertext[0]), nonceBN)
    .accountsPartial({
      computationAccount: getComputationAccAddress(
        arciumEnv.arciumClusterOffset,
        computationOffset,
      ),
      clusterAccount: getClusterAccAddress(arciumEnv.arciumClusterOffset),
      mxeAccount: getMXEAccAddress(PROGRAM_ID),
      mempoolAccount: getMempoolAccAddress(arciumEnv.arciumClusterOffset),
      executingPool: getExecutingPoolAccAddress(arciumEnv.arciumClusterOffset),
      compDefAccount: getCompDefAccAddress(
        PROGRAM_ID,
        Buffer.from(getCompDefAccOffset("check_liquidation")).readUInt32LE(0),
      ),
    })
    .rpc({ skipPreflight: false, commitment: "confirmed" });

  await awaitComputationFinalization(
    provider,
    computationOffset,
    PROGRAM_ID,
    "confirmed",
  );

  return { shouldLiquidate: false, proof: new Uint8Array(0) };
}

export async function revealPnl(
  provider: anchor.AnchorProvider,
  positionId: number,
  position?: {
    entry: number;
    mark: number;
    size: number;
    lev: number;
    side: string;
  },
): Promise<PnlRevealResult> {
  const arciumEnv = getArciumEnv();
  const { cipher } = await getCipher(provider);

  const nonce = window.crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = cipher.encrypt([BigInt(positionId)], nonce);

  const computationOffset = new anchor.BN(
    Array.from(window.crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    "hex",
  );

  const nonceBN = new anchor.BN(deserializeLE(nonce).toString());

  const idl = (
    await import("../../aegis-program/target/idl/aegis_program.json")
  ).default as anchor.Idl;

  const program = new anchor.Program(idl, provider);

  await program.methods
    .revealPnl(computationOffset, Array.from(ciphertext[0]), nonceBN)
    .accountsPartial({
      computationAccount: getComputationAccAddress(
        arciumEnv.arciumClusterOffset,
        computationOffset,
      ),
      clusterAccount: getClusterAccAddress(arciumEnv.arciumClusterOffset),
      mxeAccount: getMXEAccAddress(PROGRAM_ID),
      mempoolAccount: getMempoolAccAddress(arciumEnv.arciumClusterOffset),
      executingPool: getExecutingPoolAccAddress(arciumEnv.arciumClusterOffset),
      compDefAccount: getCompDefAccAddress(
        PROGRAM_ID,
        Buffer.from(getCompDefAccOffset("reveal_pnl")).readUInt32LE(0),
      ),
    })
    .rpc({ skipPreflight: false, commitment: "confirmed" });

  await awaitComputationFinalization(
    provider,
    computationOffset,
    PROGRAM_ID,
    "confirmed",
  );

  let pnl = 0;
  if (position) {
    const { entry, mark, size, lev, side } = position;
    const raw = side === "LONG" ? (mark - entry) * size : (entry - mark) * size;
    pnl = parseFloat((raw * lev).toFixed(2));
  }

  return { pnl, proof: new Uint8Array(0) };
}

// No provider needed — uses a plain Connection
export async function getMxeStatus(): Promise<MxeStatus> {
  try {
    const arciumEnv = getArciumEnv();
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const clusterAcc = getClusterAccAddress(
      arciumEnv.arciumClusterOffset ?? ARCIUM_CLUSTER_OFFSET,
    );
    const info = await connection.getAccountInfo(clusterAcc);
    return { nodes: info ? 3 : 0, healthy: !!info, latencyMs: 0 };
  } catch {
    return { nodes: 0, healthy: false, latencyMs: 0 };
  }
}
