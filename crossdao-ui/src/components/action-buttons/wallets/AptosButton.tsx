import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Menu, Modal, Typography } from "antd";
import {
  useWallet,
  WalletName,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
const { Text } = Typography;

import aptosIcon from "src/assets/social-button/aptos.png";
import styled from "styled-components";
import ActionButton from "../ActionButton";
import { generateSignMessage } from "src/utils/signMessage";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import axios from "axios"
import { ISocialOracleState } from "src/context/SocialOracleContext";
import { addressEllipsis } from "@suiet/wallet-kit";

const truncateAddress = (address: string | undefined) => {
  if (!address) return;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
};

function AptosButtonUnstyled(props: any) {
  const { domainName, state, dispatch } = useContext(DomainConnectContext)
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const { connect, disconnect, account, wallets, connected, signMessage } = useWallet();

  const walletState = state.find((x: ISocialOracleState) => x.provider == 'wallet:637')

  const onWalletButtonClick = () => {
    if (connected) {
      disconnect();
    } else {
      setWalletSelectorModalOpen(true);
    }
  };

  const onWalletSelected = (wallet: WalletName) => {
    connect(wallet);
    setWalletSelectorModalOpen(false);
  };

  const handleSignMsg = useCallback(async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000)

      console.log(generateSignMessage(domainName, 'aptos', 637, account?.address as string, timestamp))

      const payload = {
        message: generateSignMessage(domainName, 'aptos', 637, account?.address as string, timestamp),
        nonce: "opti.domains",
      };

      const signResponse = await signMessage(payload);
      console.log("response", signResponse);

      // console.log(account?.address, account?.publicKey)

      // Generate attestation
      const response = await axios.post(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/wallet/aptos/verify', {
        domainName,
        publicKey: account?.publicKey as string,
        timestamp,
        signature: signResponse?.signature,
      }, {
        withCredentials: true,
      })

      dispatch({
        provider: 'wallet:637',
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      })

      disconnect()
    } catch (error: any) {
      console.log("error", error);
      disconnect()
    }
  }, [account])

  useEffect(() => {
    if (connected) {
      handleSignMsg()
    }
  }, [connected])
  
  return (
    <div {...props}>
      <ActionButton color="white" background="black" icon={aptosIcon} onClick={() => onWalletButtonClick()}>
        {walletState ? addressEllipsis(walletState.displayName) : "Connect Aptos Wallet"}
      </ActionButton>
      {/* <Button className="wallet-button" onClick={() => onWalletButtonClick()}>
        {connected ? buttonText : "Connect Aptos Wallet"}
      </Button> */}
      <Modal
        title={<div className="wallet-modal-title">Connect Aptos Wallet</div>}
        centered
        open={walletSelectorModalOpen}
        onCancel={() => setWalletSelectorModalOpen(false)}
        footer={[]}
        closable={false}
      >
        {!connected && (
          <div {...props}>
            <Menu>
              {wallets.map((wallet) => {
                return (
                  <Menu.Item
                    key={wallet.name}
                    onClick={
                      wallet.readyState === WalletReadyState.Installed ||
                      wallet.readyState === WalletReadyState.Loadable
                        ? () => onWalletSelected(wallet.name)
                        : () => window.open(wallet.url)
                    }
                  >
                    <div className="wallet-menu-wrapper">
                      <div className="wallet-name-wrapper">
                        <img
                          src={wallet.icon}
                          width={25}
                          style={{ marginRight: 10 }}
                        />
                        <Text className="wallet-selector-text">
                          {wallet.name}
                        </Text>
                      </div>
                      {wallet.readyState === WalletReadyState.Installed ||
                      wallet.readyState === WalletReadyState.Loadable ? (
                        <Button className="wallet-connect-button">
                          <Text className="wallet-connect-button-text">
                            Connect
                          </Text>
                        </Button>
                      ) : (
                        <Text className="wallet-connect-install">Install</Text>
                      )}
                    </div>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default styled(AptosButtonUnstyled)`
.ant-menu {
  border: none !important;
}

.ant-menu-item {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  height: auto !important;
  margin-bottom: 10px !important;
}

.ant-menu-item-selected {
  background-color: rgba(0, 0, 0, 0.06) !important;
  color: black !important;
}

.wallet-selector-text {
  font-size: 14px;
}

.wallet-connect-button-text {
  color: white;
}

.wallet-menu-wrapper {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
}

.wallet-name-wrapper {
  display: flex;
  align-items: center;
}

.wallet-connect-button {
  align-self: center;
  background-color: #3f67ff;
  height: auto;
}

.wallet-connect-install {
  align-self: center;
  color: #3f67ff;
  padding-right: 15px;
  font-size: 16px;
  padding-top: 3px;
  padding-bottom: 3px;
}

.wallet-button {
  padding: 10px 20px;
  height: auto;
  font-size: 16px;
  background-color: #3f67ff;
  color: white;
}

.wallet-modal-title {
  text-align: center;
  font-size: 2rem;
}
`

// export default function AptosButton() {
//   return (
//     <ActionButton color="white" background="black" icon={aptosIcon}>
//       Connect Aptos Wallet
//     </ActionButton>
//   );
// }
