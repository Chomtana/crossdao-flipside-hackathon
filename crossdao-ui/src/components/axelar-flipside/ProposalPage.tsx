import React, { useEffect, useState } from "react"
import { IAxelarProposal } from "./proposal-interface"
import { Skeleton } from "antd"
import axios from "axios"
import { useParams } from "react-router-dom"
import ProposalView from "./ProposalView"
import { changeTld } from "src/utils/domain"
import { DomainCard } from "../domain/DomainCard"

export default function ProposalPage() {
  const {proposalId} = useParams()
  const [proposal, setProposal] = useState<IAxelarProposal>()

  useEffect(() => {
    axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + "/axelar-flipside/proposal-id/" + proposalId).then(response => {
      const data = response.data
      
      // Get source chain ID
      const promises = data.conditions.map((condition: any) => new Promise((resolve, reject) => {
        axios.get(
          import.meta.env.VITE_INDEXER_ENDPOINT +
            "/name/" +
            changeTld(condition.domainName, "axl", "axl.axelar.op")
        ).then(response2 => {
          condition.sourceChainId = parseInt(response2.data[0].chain.split("_")[1])
          resolve(undefined)
        }).catch(reject);
      }))
      
      Promise.all(promises).then(() => setProposal(data))
    })
  }, [])

  if (!proposal) {
    return <Skeleton active></Skeleton>
  }

  return (
    <div className="min-h-screen bg-red-900 text-white selection:bg-indigo-500 selection:text-white">
      <div className="flex justify-between p-8">
        <h1 className="mb-4 text-5xl font-bold xl:text-6xl">CrossDAO</h1>

        <div className="hidden lg:flex flex-col items-center sm:space-x-4 space-y-4 sm:flex-row sm:space-y-0">
          {/* <a href="/#mydomains">
            <div className="flex w-fit space-x-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-[1px] hover:bg-amber-700">
              <span>Register Your DAO</span> 
              <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
                <path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z" />
              </svg>
            </div>
          </a> */}
          <a href="https://zonic.app/collection/boredtown" target="_blank">
            <div className="flex w-fit space-x-2 rounded-2xl bg-teal-600 px-4 py-3 font-semibold shadow-lg shadow-teal-500/20 transition-all duration-300 hover:-translate-y-[1px] hover:bg-teal-700">
              <span>Register Your DAO</span> 
              <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
              </svg>
            </div>
          </a>
        </div>
      </div>
      
      <section className="gallery container relative z-10 mx-auto py-10 px-6" id="proposal">
        <h3 className="mb-4 text-left text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Proposal Details</h3>

        <div>
          <ProposalView proposal={proposal} />
        </div>
      </section>

      <section className="gallery container relative z-10 mx-auto py-10 px-6" id="proposal">
        <h3 className="mb-4 text-left text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Social Profiles</h3>

        <div>Verified by CrossDAO</div>

        {proposal.conditions.map(condition => (
          <div className="my-4">
            <DomainCard
              domainChainId={condition.sourceChainId!}
              domainName={changeTld(condition.domainName, 'axl', 'axl.axelar.op')}
              domainDisplayName={condition.domainName}
            />
          </div>
        ))}
      </section>

    </div>
  )
}