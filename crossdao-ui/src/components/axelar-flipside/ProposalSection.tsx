import { Button } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import NewProposalDialog from "./NewProposalDialog"
import { useAccount } from "wagmi"
import axios from "axios"
import { IAxelarProposal } from "./proposal-interface"
import ProposalView from "./ProposalView"

export default function ProposalSection() {
  const { address } = useAccount()
  const [showNewProposal, setShowNewProposal] = useState(false)
  const [proposals, setProposals] = useState<IAxelarProposal[]>([])
  const [loading, setLoading] = useState(false)

  const refreshProposals = useCallback(async () => {
    try {
      setLoading(true)

      const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/axelar-flipside/proposal/' + address)
      setProposals(response.data)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    refreshProposals();
  }, [address])

  return (
    <section className="gallery container relative z-10 mx-auto py-10 px-6" id="proposals">
      <div className='flex justify-between'>
        <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Proposals</h3>

        <Button type="primary" size="large" onClick={() => setShowNewProposal(true)}>New Proposal</Button>
      </div>
      
      <NewProposalDialog show={showNewProposal} onClose={() => {
        setShowNewProposal(false)
        refreshProposals();
      }}></NewProposalDialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {proposals.map(proposal => 
          <div key={proposal.proposalId} className={"rounded-xl bg-red-950 p-4 shadow-lg"}>
            <ProposalView proposal={proposal}></ProposalView>
          </div>
        )}
      </div>
    </section>
  )
}