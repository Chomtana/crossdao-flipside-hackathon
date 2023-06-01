import ActionButton from "../ActionButton";
import suiIcon from "src/assets/social-button/sui.png";
import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
  formatSUI,
  addressEllipsis
} from "@suiet/wallet-kit";
import '@suiet/wallet-kit/style.css';
import { message } from "antd";
import { useContext, useEffect, useState } from "react";
import { generateSignMessage } from "src/utils/signMessage";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import axios from "axios"
import { ISocialOracleState } from "src/context/SocialOracleContext";

export default function SuiButton() {
  const { domainName, state, dispatch } = useContext(DomainConnectContext)
  const wallet = useWallet()

  const walletState = state.find((x: ISocialOracleState) => x.provider == 'wallet:784')

  async function handleSignMsg() {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const msg = generateSignMessage(domainName, 'sui', 784, wallet.account?.address as string, timestamp)
      const msgBytes = new TextEncoder().encode(msg)
      const result: any = await wallet.signMessage({
        message: msgBytes
      })

      console.log(result)

      if (!result) {
        message.error('Sign message failed!')
        wallet.disconnect();
        return;
      }

      // Generate attestation
      const response = await axios.post(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/wallet/sui/verify', {
        domainName,
        walletAddress: wallet.account?.address as string,
        timestamp,
        signature: result.signature,
      }, {
        withCredentials: true,
      })

      dispatch({
        provider: 'wallet:784',
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      })

      wallet.disconnect()

      // const verifyResult = wallet.verifySignedMessage(result)
      // console.log('verify signedMessage', verifyResult)
      // if (!verifyResult) {
      //   alert(`signMessage succeed, but verify signedMessage failed`)
      // } else {
      //   alert(`signMessage succeed, and verify signedMessage succeed!`)
      // }
    } catch (e) {
      console.error('signMessage failed', e)
      wallet.disconnect();
      message.error('Sign message failed!')
    }
  }

  useEffect(() => {
    if (wallet.connected) {
      handleSignMsg();
    }
  }, [wallet.connected])

  return (
    <div className="sui-connect-button">
      <ConnectButton
        onConnectError={(error) => {
          if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
            message.warning('User rejected the connection request')
          } else {
            console.error(error)
            message.error('Unknown connect error')
          }
        }}
      >
        <div className="w-full flex items-center">
          <div className="mr-3">
            <img src={suiIcon} style={{ height: 28 }} />
          </div>

          <div className="truncate flex grow font-normal">
            {walletState ? addressEllipsis(walletState.displayName) : "Connect Sui Wallet"}
          </div>
        </div>
      </ConnectButton>
    </div>
  );
}

// export default function SuiButton() {
//   return (
//     <ActionButton color="white" background="#4CA3FF" icon={suiIcon}>
//       Connect Sui Wallet
//     </ActionButton>
//   );
// }
