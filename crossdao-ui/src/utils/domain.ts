import axios from "axios"

export interface DomainMetadata {
  node: string
  chain: string // evm_xxxx
  name: string
  owner: string
  expiry: number
}

export function changeTld(domain: string, tld: string, targetTld: string) {
  if (domain.endsWith(tld)) {
    return domain.substring(0, domain.length - tld.length) + targetTld
  }

  return domain;
}

export async function getDomainList(owner: string, tld?: string, chain?: string): Promise<DomainMetadata[]> {
  const response = await axios.get(import.meta.env.VITE_INDEXER_ENDPOINT + '/owner/' + owner)

  let data: DomainMetadata[] = response.data

  if (chain) {
    data = response.data.filter((x: DomainMetadata) => x.chain == chain)
  }

  if (tld) {
    data = response.data.filter((x: DomainMetadata) => x.name.endsWith(tld))
  }

  return data
}