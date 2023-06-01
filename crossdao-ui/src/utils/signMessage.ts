import { ethers } from "ethers";

export function generateSignMessage(domainName: string, chainName: string, coinType: number, walletAddress: string, timestamp: number) {
  return `Connect ${chainName} wallet ${walletAddress} coin type ${coinType} to Opti.domains ${domainName} ${ethers.utils.namehash(domainName)} at ${timestamp}`
}