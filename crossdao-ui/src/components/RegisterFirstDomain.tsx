import { ethers } from "ethers";
import React, { useCallback, useReducer, useState } from "react";
import { socialOracleReducer } from "src/context/SocialOracleContext";
import { v4 as uuid } from "uuid";

import TwitterButton from './action-buttons/social/TwitterButton'
import DiscordButton from './action-buttons/social/DiscordButton'
import TwitterFollowQuestButton from './action-buttons/quests/TwitterFollowQuestButton'
import DiscordJoinQuestButton from './action-buttons/quests/DiscordJoinQuestButton'
import GoogleButton from './action-buttons/social/GoogleButton'
import MicrosoftButton from "./action-buttons/social/MicrosoftButton";
import LinkedInButton from './action-buttons/social/LinkedInButton'
import FacebookButton from './action-buttons/social/FacebookButton'
import LineButton from './action-buttons/social/LineButton'
import GithubButton from './action-buttons/social/GithubButton'
import AptosButton from './action-buttons/wallets/AptosButton'
import SuiButton from './action-buttons/wallets/SuiButton'
import SolanaButton from './action-buttons/wallets/SolanaButton'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useAccountSiwe from "src/hooks/useAccountSiwe";
import { Input, message } from "antd";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import ActionButton from "./action-buttons/ActionButton";
import { useContractRead, useContractWrite, useNetwork } from "wagmi";
import { CONTRACTS } from "src/utils/contracts";
import axios from "axios";
import { changeTld } from "src/utils/domain";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function RegisterFirstDomain() {
  const { address, isConnected } = useAccountSiwe()
  const { chain } = useNetwork()

  const [domainName, setDomainName] = useState("");
  const [domainNameInput, setDomainNameInput] = useState("");
  const [owner, setOwner] = useState("");
  const [state, dispatch] = useReducer(socialOracleReducer, []);
  const [isTakeover, setIsTakeover] = useState(false);
  const [step, setStep] = useState(0)

  const nonce = uuid();

  const performSocialLogin = useCallback((provider: string) => {
    const url = new URL(
      import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
        "/social/" +
        provider +
        "/auth"
    );

    if (domainName) {
      url.searchParams.set("node", ethers.utils.namehash(domainName));
    } else {
      if (provider != 'twitter') {
        return message.error("Please login with twitter first");
      }
    }

    url.searchParams.set(
      "callback",
      import.meta.env.VITE_SOCIAL_ORACLE_CALLBACK
    );
    url.searchParams.set("nonce", nonce);

    window.addEventListener("message", (event) => {
      if (event.origin != window.location.origin) return;

      if (typeof event.data === "string" && event.data.startsWith(nonce)) {
        const data = JSON.parse(event.data.substr(nonce.length))
        console.log(data)

        if (data.status == 'success') {
          // if (provider == 'twitter') {
          //   setDomainName(data.identity.toLowerCase() + '.axl.axelar.op')
          // }
  
          dispatch({
            ...data,
            refUid: import.meta.env.VITE_SOCIAL_REF_ID,
            type: "CALLBACK",
          })
        } else {
          return message.error(data.message || 'Internal Server Error')
        }
      }
    })

    window.open(url);
  }, [domainName]);

  const { 
    data: registerTx,
    isLoading: registerLoading,
    isSuccess: registerSuccess,
    writeAsync: register
  } = useContractWrite({
    ...CONTRACTS.AxelarWhitelistRegistrarController,
    functionName: 'register',
  })

  useContractRead({
    ...CONTRACTS.ENSRegistry,
    functionName: 'owner',
    args: [
      ethers.utils.namehash(domainName),
    ],
    onSuccess(data: string) {
      if (domainName) {
        if (data == '0x0000000000000000000000000000') {
          setIsTakeover(false)
        } else {
          setIsTakeover(true)
        }
      }
    },
  })

  const registerAction = useCallback(async () => {
    try {
      const resolverData = []

      const node = ethers.utils.namehash(domainName)

      for (let action of state) {
        if (action.provider.startsWith("wallet:")) {
          // Wallet attestation
          const abi = ["function setAddrWithRef(bytes32,uint256,bytes32,bytes)"]
          const contractInterface = new ethers.utils.Interface(abi);
          const functionData = contractInterface.encodeFunctionData(
            'setAddrWithRef',
            [
              node,
              parseInt(action.provider.substring(7)),
              // action.refUid,
              "0x" + "".padStart(64, '0'),
              action.identity,
            ],
          );
          resolverData.push(functionData)
        } else {
          // Social attestation
          const abi = ["function setTextWithRef(bytes32,bytes32,string,string)"]
          const contractInterface = new ethers.utils.Interface(abi);
          const functionData = contractInterface.encodeFunctionData(
            'setTextWithRef',
            [
              node,
              // action.refUid,
              "0x" + "".padStart(64, '0'),
              action.provider,
              action.identity,
            ],
          );
          resolverData.push(functionData)
        }
      }

      const secret = new Uint8Array(32);
      window.crypto.getRandomValues(secret);

      const name = domainName.split('.')[0]

      const args = {
        controllerAddress: CONTRACTS.AxelarWhitelistRegistrarController.address,
        chainId: chain?.id,

        name,
        owner,
        secret: '0x' + Buffer.from(secret).toString("hex"),
        resolver: CONTRACTS.DiamondResolver.address,
        data: resolverData,
        reverseRecord: false,
        ownerControlledFuses: 0,

        isTakeover,
      }

      const oracleResponse = await axios.post(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/axelar-flipside/register', args, {
        withCredentials: true,
      })

      await register({
        args: [
          args.name,
          args.owner,
          args.data,
          oracleResponse.data.signature,
        ],
      })

      setStep(2)

      await wait(75000)
    } catch (err) {
      console.error(err)
      message.error('Domain registration failed!')
    }
  }, [domainName, state, address, register, isTakeover])

  return (
    <DomainConnectContext.Provider value={{ domainName, state, dispatch }}>
      {step == 0 && (
        <div>
          {!isConnected ? <div className="flex flex-col items-center">
            <div>Please connect your wallet (EOA) to get started.</div>
            <div>You will be asked to enter your DAO multisig address in the next step</div>

            <div className="mt-5">
              <div>
                <ConnectButton
                  showBalance={{
                    smallScreen: false,
                    largeScreen: true,
                  }}
                />
              </div>
            </div>
          </div> : <div>
            <div className="mb-4">Please enter your desired domain name (Ends with .axl) and your DAO gnosis safe multisig address</div>

            <div>
              <div className="mb-3">
                <div className="mb-1">Domain Name</div>
                <Input value={domainNameInput} onChange={e => setDomainNameInput(e.target.value)} />
              </div>

              <div className="mb-4">
                <div className="mb-1">DAO Gnosis Safe address</div>
                <Input value={owner} onChange={e => setOwner(e.target.value)} />
              </div>

              <div className="flex justify-center mt-6">
                <ActionButton background="white" color="black" onClick={() => {
                  if (domainNameInput && domainNameInput.endsWith('.axl') && owner && owner.startsWith("0x") && owner.length == 42) {
                    setStep(1)
                    setDomainName(changeTld(domainNameInput, 'axl', 'axl.axelar.op'))
                  } else {
                    message.error("Please enter domain name and owner in the correct format")
                  }
                }}>
                  <div className="px-8">Next</div>
                </ActionButton>
              </div>
            </div>
          </div>}

        </div>
      )}

      {step == 1 && (
        <div>
          <div>Please verify your DAO identity by connecting to at least one social provider</div>

          {true && (
            <>
              <div className="mt-4">
                <div className="mb-3">
                  <TwitterButton state={state} onClick={() => performSocialLogin('twitter')} />
                </div>

                <div className="mb-3">
                  <DiscordButton state={state} onClick={() => performSocialLogin('discord')} />
                </div>

                <div className="mb-3">
                  <GoogleButton state={state} onClick={() => performSocialLogin('google')} />
                </div>

                <div className="mb-3">
                  <MicrosoftButton state={state} onClick={() => performSocialLogin('microsoft')} />
                </div>

                <div className="mb-3">
                  <LinkedInButton state={state} onClick={() => performSocialLogin('linkedin')} />
                </div>

                <div className="mb-3">
                  <FacebookButton state={state} onClick={() => performSocialLogin('facebook')} />
                </div>

                <div className="mb-3">
                  <LineButton state={state} onClick={() => performSocialLogin('line')} />
                </div>

                <div className="mb-3">
                  <GithubButton state={state} onClick={() => performSocialLogin('github')} />
                </div>
              </div>
            </>
          )}

          {true && (
            <div className="mt-8">
              <ActionButton background="black" color="white" onClick={() => registerAction()}>
                Register Domain
              </ActionButton>
            </div>
          )}
        </div>
      )}

      {step == 2 && (
        <div className="text-lg">
          Please wait for 1 minute for the domain to be registered to your DAO
        </div>
      )}
    </DomainConnectContext.Provider>
  );
}
