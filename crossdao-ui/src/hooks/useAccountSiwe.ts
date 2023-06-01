import { useContext } from "react";
import { useAccount } from "wagmi";
import { SiweAuthContext } from "../components/providers/siwe-adapter";

export default function useAccountSiwe() {
  const account = useAccount();
  const siweStatus = useContext(SiweAuthContext)

  return {
    ...account,
    isConnected: account.isConnected && siweStatus == 'authenticated',
  }
}