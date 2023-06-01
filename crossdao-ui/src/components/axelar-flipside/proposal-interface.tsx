export interface IAxelarProposalCondition {
  domainName: string;
  sourceChainId?: number;
  node: string;
  topic: string;
  value: string;
}

export interface IAxelarProposalAction {
  target: string;
  value: string;
  data: string;
  description: string;
}

export interface IAxelarProposal {
  proposalId: string
  conditionHash: string
  owner: string
  name: string
  chainId: number
  expiration: number

  conditions: IAxelarProposalCondition[]
  actions: IAxelarProposalAction[]
  contractAddress: string
  executedTx: string
}