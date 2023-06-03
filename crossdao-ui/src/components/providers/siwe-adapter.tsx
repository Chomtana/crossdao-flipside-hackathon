import { AuthenticationStatus, RainbowKitAuthenticationProvider, createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { createContext, useCallback, useEffect, useState } from 'react';
import { SiweMessage } from 'src/utils/SiweMessage';
import { useChainId } from 'wagmi';
import { useAccount } from 'wagmi';

export const SiweAuthContext = createContext("unauthenticated")

export function SiweAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId()

  const [status, setStatus] = useState<AuthenticationStatus>("loading")

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/nonce', {
        credentials: 'include',
      });
      return await response.text();
    },
  
    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to .town by Opti.Domains',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
  
    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },
  
    verify: async ({ message, signature }) => {
      const verifyRes = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
        credentials: 'include',
      });
  
      if (verifyRes.ok) {
        setStatus("authenticated")
        return true
      } else {
        setStatus("unauthenticated")
        return false
      }
    },
  
    signOut: async () => {
      await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/logout', {
        credentials: 'include',
      });
      setStatus("unauthenticated")
    },
  });

  const refreshMe = useCallback(async () => {
    try {
      if (!isConnected) {
        setStatus('unauthenticated')
        return
      }
  
      const response = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json()
        const nowPlus1day = new Date()
        nowPlus1day.setDate(nowPlus1day.getDate() + 1)
        
        if (
          data.address?.toLowerCase() == address?.toLowerCase() && 
          data.chainId == chainId &&
          (!data.expirationTime || nowPlus1day < new Date(data.expirationTime))
        ) {
          setStatus('authenticated')
        }
      } else {
        setStatus('unauthenticated')
      }
    } catch (err) {
      console.error(err)
      setStatus('unauthenticated')
    }
  }, [address, chainId, isConnected])

  useEffect(() => {
    refreshMe()
  }, [address, chainId, isConnected])

  if (!parseInt(import.meta.env.VITE_USE_SIWE)) {
    return <>{children}</>
  }

  return (
    <SiweAuthContext.Provider value={status}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={status}
      >
        {children}
      </RainbowKitAuthenticationProvider>
    </SiweAuthContext.Provider>
  )
}