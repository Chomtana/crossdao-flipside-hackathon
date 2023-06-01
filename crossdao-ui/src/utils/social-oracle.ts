

// TODO: Move social oracle integration logic to this for better seperation

import axios from "axios"

export interface SocialProfileSimple {
  node: string
  provider: string
  identity: string
  displayName: string
  chainId: number
  uid: string
}

export async function getAssociatedSocialProfiles(node: string, chainId: number): Promise<SocialProfileSimple[]> {
  const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/attestation/social', {
    params: {
      node,
      chainId,
      simple: 1,
    }
  })

  return response.data
}