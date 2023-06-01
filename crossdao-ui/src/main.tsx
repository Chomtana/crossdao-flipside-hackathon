import './polyfills.ts'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import '@rainbow-me/rainbowkit/styles.css';

import './index.css'

import {
  getDefaultWallets,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import {
  WalletProvider as SuiWalletProvider,
} from '@suiet/wallet-kit';

import { publicProvider } from 'wagmi/providers/public';
import { baseGoerli, optimismGoerli } from 'viem/chains';
import { SiweAuthProvider } from './components/providers/siwe-adapter.tsx';
import SocialOracleCallback from './social-oracle-callback.tsx';
import { AptosProvider } from './components/providers/aptos-adapter.tsx';
import { AntdAlertProvider } from './components/providers/antd-alert.tsx';
import ProposalPage from './components/axelar-flipside/ProposalPage.tsx';

const { chains, publicClient } = configureChains(
  [optimismGoerli, baseGoerli],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: '.town by Opti.Domains',
  projectId: 'dd2a5d8744a5d72247899ef644bf8e1e',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/social-oracle-callback",
    element: <SocialOracleCallback />
  },
  {
    path: "/proposal/:proposalId",
    element: <ProposalPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      {/* <SiweAuthProvider> */}
        <RainbowKitProvider chains={chains}>
          <AptosProvider>
            <SuiWalletProvider autoConnect={false}>
              <AntdAlertProvider>
                <RouterProvider router={router} />
              </AntdAlertProvider>
            </SuiWalletProvider>
          </AptosProvider>
        </RainbowKitProvider>
      {/* </SiweAuthProvider> */}
    </WagmiConfig>
  </React.StrictMode>,
)
