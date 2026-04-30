# Stralio

A React-based donation application that allows users to submit donations via the Stellar network using Freighter Wallet.

## Features

- Clean, modern UI with responsive design
- Form validation with character counters
- Freighter Wallet integration
- Real-time transaction status
- Docker support for containerized deployment

## Prerequisites

- Node.js 18+ and npm
- Freighter Wallet browser extension (for testing transactions)

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
   Edit `.env` and set your contract-id recipient address:
   ```
   VITE_STRALIO_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Docker

### Build the Docker Image

```bash
docker build -t stralio-frontend .
```

### Run the Container

```bash
docker run -d -p 3000:80 --env-file .env stralio-frontend
```

The application will be available at `http://localhost:3000`.

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  stralio:
    build: .
    ports:
      - "3000:80"
    env_file:
      - .env
```

Run with:
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
│   │   ├── useFreighter.js        # Freighter wallet integration
│   │   └── useStralioForm.js      # Form state management
│   ├── utils/
│   │   ├── stellar.js             # Stellar transaction helpers
│   │   └── validation.js          # Form validation utilities
│   ├── config/
│   │   └── constants.js           # App configuration
│   ├── styles/
│   │   └── index.css              # Tailwind + custom styles
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── Dockerfile                     # Multi-stage Docker build
├── nginx.conf                     # Nginx configuration
├── .env                           # Environment variables
├── .env.example                   # Environment template
└── README.md                      # This file
```

## Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Username | Text | Yes | Max 30 characters |
| Message | Textarea | Yes | Max 500 characters |
| Amount | Number | Yes | 10 - 10,000 XLM |

## Technical Details

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **Stellar SDK**: `@stellar/stellar-sdk`
- **Wallet**: `@stellar/freighter-api`
- **Network**: Stellar Public Network

## Security Notes

- Never commit `.env` files with real addresses to version control
- The recipient address is hardcoded in the client-side code
- For production, consider using environment-specific builds
- Always verify transaction details in Freighter before confirming

## Troubleshooting

### Freighter Wallet Not Detected
- Ensure the Freighter extension is installed and unlocked
- Refresh the page after unlocking Freighter
- Check browser console for errors

### Transaction Fails
- Verify you have sufficient XLM balance
- Check that the recipient address is valid
- Ensure Freighter is connected to the public network

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher

## License

MIT
