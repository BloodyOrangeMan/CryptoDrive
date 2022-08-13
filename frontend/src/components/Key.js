import { useState } from "react";
import { Space, Table, Col, Row, Form, Input, } from "antd";
import { Button, Modal } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import axios from "axios";

const Key = ({ keyData, reRender, setReRender }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const handleClick = () => {
    setVisible(true);
  };

  const handleSubmit = (values) => {
    axios
      .post("api/key/", {
        withCredentials: true,
        keyName: values.keyname,
        passphrase: values.password,
        passphraseConfirm: values.confirm,
      })
      .then((res) => {
        if (res.status === 201) {
          reRender ? setReRender(0) : setReRender(1);
          setVisible(false);
        }
      });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "UsageCount",
      dataIndex: "times",
      key: "times",
    },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      key: "createdAt",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Delete</a>
        </Space>
      ),
    },
  ];


  let data = [];
  if (keyData !== undefined) {
    data = keyData.map((key, index) => {
      let newKey = {};
      newKey.index = index;
      newKey.name = key.name;
      newKey.times = key.times;
      newKey.createdAt = key.createdAt;
      newKey.tags = "test";
      return newKey;
    });
  }

  return (
    <div className="key">
      <Row>
        <Col span={24}>
          <Modal
            title="Create Your Key"
            visible={visible}
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Return
              </Button>,
              <Button key="submit" type="primary" onClick={form.submit}>
                Submit
              </Button>,
            ]}
          >
            <Form
              {...formItemLayout}
              form={form}
              name="register"
              onFinish={handleSubmit}
              scrollToFirstError
            >
              <Form.Item
                name="keyname"
                label="Keyname"
                tooltip="What do you want to name this key? "
                rules={[
                  {
                    required: true,
                    message: "Please input your keyname!",
                    whitespace: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>
          <Button
            type="primary"
            icon={<KeyOutlined />}
            onClick={handleClick}
            size="large"
          >
            Create A Key For Your File Encryption!
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Key;
