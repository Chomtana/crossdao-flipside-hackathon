import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  IAxelarProposal,
  IAxelarProposalCondition,
} from "./proposal-interface";
import { useContractReads, useContractWrite, useNetwork } from "wagmi";
import { Button, Skeleton, message } from "antd";
import axios from "axios";
import { changeTld } from "src/utils/domain";
import { CONTRACTS } from "src/utils/contracts";
import { parseEther } from "viem";

interface ProposalConditionProps extends IAxelarProposalCondition {
  chainId: number;
  sourceChainId?: number;
  index: number;
  onPassed: any;
}

function ProposalConditionInner({
  domainName,
  node,
  topic,
  value,
  chainId,
  sourceChainId,
  index,
  onPassed,
}: ProposalConditionProps) {
  const [attested, setAttested] = useState("");
  const [attestedDest, setAttestedDest] = useState("");

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...CONTRACTS.DiamondResolver,
        functionName: "text",
        chainId: sourceChainId,
        args: [node, "ccattest:" + topic],
      },
      {
        ...CONTRACTS.DiamondResolver,
        functionName: "text",
        chainId: chainId,
        args: [node, "ccattest:" + topic],
      },
    ],
  });

  useEffect(() => {
    if (data) {
      setAttested(data[0].result as any as string);
      setAttestedDest(data[1].result as any as string);

      if (data[0].result && data[1].result && data[0].result == data[1].result) {
        onPassed(index);
      }
    }
  }, [data]);

  const { writeAsync: bridgeText, isLoading: isBridging } = useContractWrite({
    ...CONTRACTS.AxelarWhitelistRegistrarController,
    functionName: "bridgeText",
    chainId: sourceChainId,
  });

  if (isLoading || isError) {
    return <Skeleton.Input active={true} size="small" />;
  }

  return (
    <div className="mt-3 mb-3">
      <div>
        <b>{domainName}</b>
      </div>
      <div>
        Condition: {topic} = {value}
      </div>
      <div>
        {attested
          ? `Attested: ${attested} (${
              attested == value ? "PASSED" : "REJECTED"
            })`
          : "Not attested"}
      </div>
      {attested && (
        <div>
          <div>
            {attestedDest === attested
              ? "Attested on Destination Chain"
              : "NOT Attested on Destination Chain !!!"}
          </div>
          {attestedDest !== attested && (
            <div
              className={
                "px-3 p-1 rounded bg-white hover:cursor-pointer hover:bg-gray-200 text-gray-800 text-center mt-1 " + (isBridging ? "opacity-80" : "")
              }
              style={{ width: 240 }}
              onClick={async () => {
                try {
                  await bridgeText({
                    args: [
                      domainName.split(".")[0],
                      "ccattest:" + topic,
                      chainId == 420 ? "optimism" : "base",
                    ],
                    value: parseEther('0.002'),
                  })
                } catch (err) {
                  console.error(err)
                  message.warning("Please make sure that you are on " + (chainId == 420 ? "optimism" : "base") + " chain")
                }
              }}
            >
              Attest on Destination Chain
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProposalCondition({
  domainName,
  node,
  topic,
  value,
  chainId,
  index,
  onPassed,
}: ProposalConditionProps) {
  const [sourceChainId, setSourceChainId] = useState(0);

  async function fetchSourceChainId() {
    const response = await axios.get(
      import.meta.env.VITE_INDEXER_ENDPOINT +
        "/name/" +
        changeTld(domainName, "axl", "axl.axelar.op")
    );
    setSourceChainId(parseInt(response.data[0].chain.split("_")[1]));
  }

  useEffect(() => {
    fetchSourceChainId();
  }, [domainName]);

  if (!chainId) {
    return <Skeleton.Input active={true} size="small" />;
  }

  return (
    <ProposalConditionInner
      domainName={domainName}
      node={node}
      topic={topic}
      value={value}
      chainId={chainId}
      sourceChainId={sourceChainId}
      index={index}
      onPassed={onPassed}
    />
  );
}

const PASSED_STORE: any = {}

export default function ProposalView({
  proposal,
}: {
  proposal: IAxelarProposal;
}) {
  const uuid = useMemo(() => Math.random() * 1000000000, [])
  const { chains } = useNetwork();
  const [passed, setPassed] = useState([])

  let status = "Pending Attestation";

  if (proposal.executedTx) {
    status = "Executed";
  } else if (new Date() > new Date(proposal.expiration * 1000)) {
    status = "Expired";
  } else if (passed.length == proposal.conditions.length) {
    status = "Pending Execution";
  }

  const onPassed = useCallback(
    (i: any) => {
      if (!PASSED_STORE[uuid]) PASSED_STORE[uuid] = new Set()
      PASSED_STORE[uuid].add(i)

      if (PASSED_STORE[uuid]?.size >= proposal.conditions.length) {
        setPassed(Array.from(PASSED_STORE[uuid]))
      }
    },
    []
  );

  const { writeAsync: execute, isLoading: isExecuting } = useContractWrite({
    ...CONTRACTS.AxelarProposalController,
    functionName: "executeProposal",
    chainId: proposal.chainId,
  });

  return (
    <div>
      <div>{proposal.name}</div>
      <div className="truncate text-sm text-gray-200">{proposal.proposalId}</div>
      <div className="text-sm text-gray-200">
        {chains.find((chain) => chain.id == proposal.chainId)?.name ||
          proposal.chainId}
      </div>
      <div className="text-sm text-gray-200">
        Expire: {new Date(proposal.expiration * 1000).toDateString()}
      </div>
      <div className="mt-2 mb-3">Status: {status}</div>

      <hr />

      <div className="mt-3 text-lg font-bold">Conditions</div>
      <div className="truncate text-sm text-gray-200">
        Hash: {proposal.conditionHash}
      </div>
      <div>
        {proposal.conditions.map((condition, i) => (
          <ProposalCondition
            {...condition}
            chainId={proposal.chainId}
            index={i}
            key={i}
            onPassed={onPassed}
          />
        ))}
      </div>

      <hr />

      <div className="mt-3 text-lg font-bold">Actions</div>
      <div>
        {proposal.actions.map((action, i) => (
          <div className="mt-3 mb-3" key={i}>
            <div>{action.description}</div>
            <div className="truncate">{action.target}</div>
            {action.value && <div>Value: {action.value} ETH</div>}
          </div>
        ))}
      </div>

      {status == "Pending Execution" && (
        <div>
          <Button type="primary" disabled={isExecuting} onClick={async () => {
            try {
              await execute({
                args: [
                  {
                    expiration: proposal.expiration,
                    conditions: proposal.conditions.map(x => ({
                      node: x.node,
                      key: 'ccattest:' + x.topic,
                      value: x.value,
                    })),
                    actions: proposal.actions.map(x => ({
                      target: x.target,
                      value: x.value,
                      data: x.data,
                    }))
                  }
                ],
                value: proposal.actions.reduce((acc, x) => BigInt(x.value) + BigInt(acc), BigInt(0))
              })
            } catch (err) {
              console.error(err)
              message.warning("Please make sure that you are on " + (chains.find(x => x.id == proposal.chainId)?.name) + " chain")
            }
          }}>Execute</Button>
        </div>
      )}

      {proposal.executedTx && (
        <div className="truncate"><b>Executed Tx:</b> <a className="underline" href={chains.find(x => x.id == proposal.chainId)?.blockExplorers?.default.url + "/tx/" + proposal.executedTx}>{proposal.executedTx}</a></div>
      )}
    </div>
  );
}
