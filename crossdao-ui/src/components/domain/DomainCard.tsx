import { ethers } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { SocialProfileSimple, getAssociatedSocialProfiles } from "src/utils/social-oracle";
import { useNetwork } from "wagmi"
import { DomainSocialRecordFromProfiles } from "./DomainSocialRecord";
import CCAttestDialog from "../axelar-flipside/CCAttestDialog";
import { Button } from "antd";

interface DomainCardProps {
  domainName: string
  domainDisplayName: string
  domainChainId: number
  key?: string
  className?: string
}

export function DomainCard({ domainName, domainDisplayName, domainChainId, key, className = "" }: DomainCardProps) {
  const { chain, chains } = useNetwork();
  const node = useMemo(() => ethers.utils.namehash(domainName), [domainName])

  const [loading, setLoading] = useState(true)
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileSimple[]>([])

  useEffect(() => {
    if (chain) {
      const promises = [];

      promises.push(getAssociatedSocialProfiles(node, domainChainId).then(profiles => setSocialProfiles(profiles)))

      Promise.all(promises).then(() => setLoading(false))
    }
  }, [node, chain])

  const socialProviderList = [
    'discord',
    'facebook',
    'github',
    'google',
    'line',
    'linkedin',
    'microsoft',
    'twitter',
  ]

  // Axelar attestations
  const [showAttestationDialog, setShowAttestationDialog] = useState(false)
  const [attestations, setAttestations] = useState<any[]>([])
  
  const refreshAttestations = useCallback(() => {
    setAttestations(JSON.parse(window.localStorage.getItem("AXELAR_ATTESTATION_" + node) || "[]"))
  }, [])

  useEffect(refreshAttestations, [])

  return (
    <div key={key} className={"rounded-xl bg-red-950 p-4 shadow-lg " + className}>
      <h4 className="text-xl text-amber-200">{domainDisplayName}</h4>
      <div className="text-sm text-gray-200">{chains.find(x => x.id == domainChainId)?.name}</div>
      <div className="text-sm text-gray-200">Expire: 1/1/2025, 7:00:01 AM</div>

      <div className="grid grid-cols-2">
        <div className="mt-4">
          {socialProviderList.map(provider => (
            <div className='mb-2'>
              <DomainSocialRecordFromProfiles provider={provider} profiles={socialProfiles} loading={loading} />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-lg font-bold">Attestations</div>

          <div className="mt-3">
            {attestations.map(attestation => (
              <div key={attestation.key}>{attestation.key}: {attestation.value}</div>
            ))}
          </div>

          <div className="mt-3">
            <Button type="primary" onClick={() => setShowAttestationDialog(true)}>Attest</Button>
          </div>
        </div>
      </div>

      <CCAttestDialog 
        show={showAttestationDialog} 
        onClose={() => {
          setShowAttestationDialog(false)
          refreshAttestations()
        }} 
        node={node} 
        chainId={chain?.id} 
      />


      {/* <div className='mt-4 flex'>
        <div className='cursor-pointer text-amber-100 hover:text-amber-200 mr-4'>SET AS PRIMARY</div>
        <div className='cursor-pointer text-amber-100 hover:text-amber-200 mr-4'>RENEW</div>
      </div> */}
    </div>
  )
}