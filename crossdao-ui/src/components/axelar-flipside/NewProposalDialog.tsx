import { Button, Divider, Form, Input, Modal, Select, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import { CONTRACTS } from "src/utils/contracts";
import { useAccount, useContractWrite, useNetwork } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
import { changeTld } from "src/utils/domain";

export default function NewProposalDialog({
  show,
  onClose,
}: any) {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const [ form ] = useForm();

  async function onFinish(data: any) {
    console.log(data)

    data.expiration = Math.floor(new Date(data.expirationDate).getTime() / 1000)
    data.chainId = chain?.id;
    data.owner = address;
    data.contractAddress = CONTRACTS.AxelarProposalController.address;

    data.conditions = data.conditions.map((condition: any) => ({
      ...condition,
      node: ethers.utils.namehash(changeTld(condition.domainName, 'axl', 'axl.axelar.op')),
    }))

    const response = await axios.post(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/axelar-flipside/proposal', data);

    console.log(response.data)

    onClose();

    form.resetFields()
  }

  return (
    <>
      <Modal
        title="New Proposal"
        open={show}
        footer={[]}
        onCancel={onClose}
      >
        <Form
          form={form}
          onFinish={(data) => {
            onFinish(data)
          }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="expirationDate"
            label="Expiration Date"
            rules={[{ required: true, message: "Expiration date is required" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Divider />

          <Form.List name="conditions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} direction="vertical" className="mb-6">
                    <div className="flex items-center">
                      <div className="mr-3">Condition {field.key + 1}</div>

                      <DeleteOutlined onClick={() => remove(field.name)} />
                    </div>

                    <Form.Item
                      {...field}
                      label="Domain Name"
                      name={[field.name, "domainName"]}
                      rules={[{ required: true, message: "Missing domain name" }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="Topic"
                      name={[field.name, "topic"]}
                      rules={[{ required: true, message: "Missing topic" }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="Value"
                      name={[field.name, "value"]}
                      rules={[{ required: true, message: "Missing value" }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Condition
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.List name="actions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} direction="vertical" className="mb-6">
                    <div className="flex items-center">
                      <div className="mr-3">Action {field.key + 1}</div>

                      <DeleteOutlined onClick={() => remove(field.name)} />
                    </div>

                    <Form.Item
                      {...field}
                      label="Contract Executable Address"
                      name={[field.name, "target"]}
                      rules={[{ required: true, message: "Missing contract address" }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="Value (ETH / Native coin)"
                      name={[field.name, "value"]}
                      rules={[{ required: true, message: "Missing value" }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="Description (Optional)"
                      name={[field.name, "description"]}
                      rules={[{ required: false }]}
                      style={{ marginBottom: "4px" }}
                    >
                      <Input />
                    </Form.Item>
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Action
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="default" htmlType="button" onClick={() => onClose()} className="mr-3">
              Cancel
            </Button>

            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
