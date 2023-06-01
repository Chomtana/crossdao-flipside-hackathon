import { Button, Input, Modal } from 'antd';
import React, { useState } from 'react'
import { CONTRACTS } from 'src/utils/contracts';
import { useContractWrite } from 'wagmi';

export default function CCAttestDialog({ show, onClose, node, chainId }: any) {
  const [topic, setTopic] = useState('')
  const [value, setValue] = useState('')

  const { 
    data: attestTx,
    isLoading: attestLoading,
    isSuccess: attestSuccess,
    writeAsync: attest
  } = useContractWrite({
    ...CONTRACTS.DiamondResolver,
    functionName: 'setText',
    args: [node, 'ccattest:' + topic, value],
    chainId,
  })

  async function doAttest() {
    try {
      await attest();

      const attestations = JSON.parse(window.localStorage.getItem("AXELAR_ATTESTATION_" + node) || "[]")
      attestations.push({ key: topic, value })
      window.localStorage.setItem("AXELAR_ATTESTATION_" + node, JSON.stringify(attestations))

      onClose();
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Modal title="Attest" open={show} onOk={() => doAttest()} onCancel={onClose} confirmLoading={attestLoading}>
        <div className='my-3'>
          <div className='mb-1'>Topic</div>
          <Input placeholder="Topic" value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        <div className='my-3'>
          <div className='mb-1'>Value</div>
          <Input placeholder="Value" value={value} onChange={e => setValue(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}