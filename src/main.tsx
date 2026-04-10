import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { createDefaultClient } from '@solana/client';
import { SolanaProvider } from '@solana/react-hooks';
import App from './App';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
const solanaClient = createDefaultClient({
  cluster: 'mainnet-beta',
  walletConnectors: 'default',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaProvider
      client={solanaClient}
      walletPersistence={{ autoConnect: true }}
    >
      {convex ? (
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      ) : (
        <App />
      )}
    </SolanaProvider>
  </React.StrictMode>,
);
