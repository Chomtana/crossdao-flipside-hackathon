import { Skeleton } from "antd"
import React, { useEffect, useState } from "react"
import { DomainMetadata, changeTld, getDomainList } from "src/utils/domain"
import { useNetwork } from "wagmi"
import { DomainCard } from "./DomainCard"

interface DomainListProps {
  owner: string
  chain?: string
  tld: string
  formattedTld: string
}

export default function DomainList({ owner, chain, tld, formattedTld }: DomainListProps) {
  // const { chains } = useNetwork();

  const [loading, setLoading] = useState(true)
  const [domainList, setDomainList] = useState<DomainMetadata[]>([])

  useEffect(() => {
    setLoading(true)

    const promises = []

    promises.push(getDomainList(owner, tld, chain).then(x => setDomainList(x)))

    Promise.all(promises).then(() => {
      setLoading(false)
    })
  }, [owner])

  if (loading) {
    return <Skeleton active={true} />
  }

  if (domainList.length == 0) {
    return (
      <div className="flex flex-col items-center text-lg">
        <div className="mb-3">You don't have any domain name</div>

        <div onClick={() => window.open(import.meta.env.VITE_CROSSDAO_REGISTER_DOMAIN + "/register")} className="underline hover:cursor-pointer hover:opacity-90 text-lg">
          Register a new domain
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {domainList.map(domain => (
          <DomainCard
            domainName={domain.name}
            domainDisplayName={changeTld(domain.name, tld, formattedTld)}
            domainChainId={parseInt(domain.chain.split('_')[1])}
            key={domain.node + "_" + domain.chain}
          ></DomainCard>
        ))}
      </div>

      <div className="flex justify-center mt-5">
        <div onClick={() => window.open(import.meta.env.VITE_CROSSDAO_REGISTER_DOMAIN + "/register")} className="underline hover:cursor-pointer hover:opacity-90 text-lg">
          Register a new domain
        </div>
      </div>
    </div>

  )
}