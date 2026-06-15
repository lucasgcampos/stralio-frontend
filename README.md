# Stralio Frontend

React donation app built on the Stellar network. Supports desktop and mobile wallets via [`@creit.tech/stellar-wallets-kit`](https://github.com/Creit-Tech/Stellar-Wallets-Kit).

## Features

- Multi-wallet support: Freighter, Lobstr, xBull, and any WalletConnect-compatible wallet
- Works on desktop (browser extension) and mobile (QR code / deep link via WalletConnect)
- Soroban smart contract integration for on-chain donations
- Form validation with character counters
- Real-time transaction status with StellarExpert link
- Docker support for containerized deployment

## Supported Wallets

| Wallet | Desktop | Mobile |
|--------|---------|--------|
| Freighter | ✅ Extension | ✅ WalletConnect |
| Lobstr | ✅ Extension | ✅ WalletConnect |
| xBull | ✅ Extension | ✅ WalletConnect |
| Any WalletConnect wallet | — | ✅ |

## Prerequisites

- Node.js 18+
- A supported Stellar wallet (see table above)
- A [WalletConnect Cloud](https://cloud.walletconnect.com) project ID (free)

## Getting Started

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_STRALIO_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_STRALIO_CONTRACT_ID` | Yes | Soroban contract address (C…) |
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com) |

When deploying to Vercel, add these in **Project Settings → Environment Variables**.

## Docker

### Build and Run

```bash
docker build -t stralio-frontend .
docker run -d -p 3000:80 --env-file .env stralio-frontend
```

The app will be available at `http://localhost:3000`.

### Docker Compose

```yaml
services:
  stralio:
    build: .
    ports:
      - "3000:80"
    env_file:
      - .env
```

```bash
docker-compose up -d
```

## Project Structure

```
stralio-frontend/
├── src/
│   ├── components/
│   │   ├── CharacterCounter.jsx   # Character count display
│   │   ├── FormField.jsx          # Reusable form field
│   │   ├── StatusMessage.jsx      # Success/error/loading messages
│   │   └── StralioForm.jsx        # Main donation form
│   ├── hooks/
│   │   ├── useWallet.js           # Multi-wallet integration (stellar-wallets-kit)
│   │   └── useStralioForm.js      # Form state management
│   ├── utils/
│   │   ├── stellar.js             # Transaction build / sign / submit helpers
│   │   └── validation.js          # Form validation
│   ├── config/
│   │   └── constants.js           # Network config and env vars
│   ├── App.jsx
│   └── main.jsx
├── Dockerfile
├── nginx.conf
├── .env
├── .env.example
└── README.md
```

## Form Fields

| Field | Required | Validation |
|-------|----------|------------|
| Username | Yes | Max 30 characters |
| Message | Yes | Max 200 characters |
| Amount (XLM) | Yes | 2 – 10,000 XLM |

## Technical Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Stellar SDK**: `@stellar/stellar-sdk`
- **Wallet layer**: `@creit.tech/stellar-wallets-kit` (Freighter, Lobstr, xBull, WalletConnect)
- **Network**: Stellar Testnet (change `STELLAR_NETWORK` in `constants.js` for Mainnet)

## Troubleshooting

**Wallet modal doesn't open**
- Make sure `VITE_WALLETCONNECT_PROJECT_ID` is set correctly
- On mobile, ensure you have a WalletConnect-compatible wallet installed (Freighter or Lobstr app)

**Transaction simulation fails**
- Verify the contract ID in `VITE_STRALIO_CONTRACT_ID` is deployed on the correct network
- Check the browser console for the exact simulation error

**Transaction never confirms**
- The app polls for up to 20 seconds. If the network is slow, the transaction may still succeed — check [StellarExpert](https://stellar.expert) with the hash from the console

**Build errors**
```bash
rm -rf node_modules && npm install
```
Ensure Node.js 18+.

## License

MIT
