# AEGIS Perps

**Private perpetual futures trading on Solana, powered by Arcium MXE.**

AEGIS Perps is a decentralized perpetuals exchange where position data is encrypted on-chain using Arcium's Multi-Party Computation (MPC) network. Your size, leverage, entry price, and PnL are never exposed — not to other traders, not to validators, not to anyone — until you choose to reveal them.

---

## The Problem

Every perpetuals DEX on Solana today exposes your positions publicly on-chain. Anyone can see:

- What you're trading and at what size
- Your entry price and leverage
- Whether you're about to get liquidated
- Your cumulative PnL

This leaks strategy, enables front-running, and exposes traders to targeted attacks. Privacy is not a feature — it's a requirement for professional trading.

---

## How AEGIS Perps Uses Arcium

AEGIS Perps integrates Arcium's MXE (Multi-party eXecution Environment) for three core privacy operations:

### 1. Position Sealing (`sealPosition`)

When you open a position, the position data — size, leverage, side, and entry price — is encrypted using a RescueCipher key exchange with the MXE before being stored on-chain. The Solana program stores only the ciphertext. No plaintext position data ever touches the chain.

```
User opens position
  → x25519 key exchange with MXE node
  → RescueCipher encrypts [size, leverage, side, entryPrice]
  → Ciphertext stored in PositionAccount on-chain
  → UI shows ⊘ SEALED
```

### 2. Private Liquidation Check (`checkLiquidation`)

Liquidation checks run inside the MXE as an encrypted computation. The liquidation price threshold is never revealed — only the boolean result (liquidate: yes/no) is returned, encrypted, and decrypted client-side.

```
MXE receives encrypted position data
  → Computes liquidation check privately
  → Returns encrypted boolean result
  → Client decrypts: shouldLiquidate true/false
  → Position closed if needed — threshold never exposed
```

### 3. PnL Reveal (`revealPnl`)

PnL remains sealed as `⊘ SEALED` until the trader explicitly triggers a reveal. The MXE computes the PnL inside the secure enclave and returns the encrypted result. Only the position owner can decrypt and view the final number.

```
Trader clicks "Reveal PnL"
  → MPC computation runs across Arcium nodes (~2.8s)
  → Encrypted PnL result returned
  → Client decrypts using shared secret
  → PnL displayed: +$142.50 (+14.25%)
```

### Privacy Guarantees

| What                         | Visibility            |
| ---------------------------- | --------------------- |
| Position size                | ⊘ Encrypted           |
| Entry price                  | ⊘ Encrypted           |
| Leverage                     | ⊘ Encrypted           |
| Unrealized PnL               | ⊘ Sealed until reveal |
| Liquidation price            | ⊘ Never revealed      |
| Trade direction (Long/Short) | Public                |
| Realized PnL (after reveal)  | Trader only           |

---

## Technical Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Blockchain     | Solana (Devnet)                      |
| Privacy Layer  | Arcium MXE — 3 nodes                 |
| Smart Contract | Anchor 0.32.1                        |
| Encryption     | RescueCipher via `@arcium-hq/client` |
| Frontend       | React + TypeScript + Tailwind CSS    |
| Live Prices    | Pyth Network (Hermes SSE)            |
| Charts         | lightweight-charts v5                |
| Wallet         | Solana Wallet Adapter (Phantom)      |

---

## Program Details

|                           |                                                |
| ------------------------- | ---------------------------------------------- |
| **Program ID**            | `8RK5m1rte3iKwJ2eJxoLXaxMmYyq3moAaTov72KqtgdG` |
| **Network**               | Solana Devnet                                  |
| **Arcium Cluster Offset** | `456` (Devnet)                                 |
| **MXE Nodes**             | 3                                              |

---

## Instructions

The on-chain program (`aegis_program`) exposes four instructions:

| Instruction         | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `open_position`     | Opens an encrypted position. Stores ciphertext on-chain via PDA. |
| `close_position`    | Closes a position. Records sealed exit state.                    |
| `check_liquidation` | Submits encrypted liq check to Arcium MXE.                       |
| `reveal_pnl`        | Submits encrypted PnL reveal to Arcium MXE.                      |

---

## Running Locally

### Prerequisites

- Node.js v18+
- Yarn
- Phantom wallet browser extension
- Devnet SOL (faucet.solana.com)

### Setup

```bash
git clone https://github.com/Timilehin01/Aegis-perps.git
cd aegis-perps
yarn install
```

Create a `.env` file:

```env
VITE_ARCIUM_CLUSTER_OFFSET=456
VITE_PROGRAM_ID=8RK5m1rte3iKwJ2eJxoLXaxMmYyq3moAaTov72KqtgdG
VITE_RPC_URL=https://api.devnet.solana.com
```

Run the dev server:

```bash
yarn dev
```

### Building the Anchor Program

```bash
cd aegis-program
cargo-build-sbf
anchor deploy --provider.cluster devnet
```

---

## Features

- **Private positions** — size, entry, leverage encrypted via Arcium MXE
- **Sealed PnL** — unrealized PnL hidden until trader triggers MPC reveal
- **Private liquidations** — liq price never exposed on-chain
- **Live prices** — Pyth Network Hermes SSE feeds for SOL, BTC, ETH, JUP, WIF
- **Full order types** — Market, Limit, Stop
- **TP/SL** — take profit and stop loss with on-chart visualization
- **Trade history** — closed trades with SEALED/REVEALED status
- **Portfolio panel** — equity, margin, win rate across revealed trades
- **Persistent state** — positions survive refresh via wallet-namespaced localStorage
- **Mobile responsive** — full trading UI on mobile

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + TypeScript + Tailwind               │
│  Pyth Hermes SSE → Live Prices               │
│  lightweight-charts → Candlestick Chart      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│            Solana Program                    │
│  Anchor 0.32.1                               │
│  Program: 8RK5m1rte3iKwJ2eJxoLXaxMmYyq3mo.. │
│  Stores encrypted position PDAs             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│            Arcium MXE                        │
│  3-node MPC cluster (Devnet offset: 456)    │
│  RescueCipher encryption                    │
│  Private compute: liq checks + PnL reveals  │
└─────────────────────────────────────────────┘
```

---

## Submission

Built for Arcium RTG Program.

**Category:** Private DeFi / Perpetuals  
**Network:** Solana Devnet  
**Privacy Layer:** Arcium MXE
