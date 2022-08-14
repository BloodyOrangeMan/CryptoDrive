import { useState, useEffect } from "react";
import { Button, Modal, Select, Input, Form } from "antd";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { getUrlParams } from "../utils/publicfunc";

require("dotenv").config();

const Main = () => {
  const [state, setState] = useState({
    metaData: {
      fileName: "",
      createDate: "",
      lastModified: "",
      fileSize: "",
    },
    keyData: "",
  });
  const [visible, setVisible] = useState(false);
  const [sharedLink, setSharedLink] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const params = getUrlParams(window.location.href);
    setState({
      ...state,
      metaData: {
        fileName: decodeURIComponent(params.filename),
        createDate: decodeURIComponent(params.createdate),
        lastModified: decodeURIComponent(params.lastmodified),
        fileSize: decodeURIComponent(params.filesize),
        jwt: decodeURIComponent(params.jwt),
      },
    });
    // 判断是否为有效链接
    axios
      .get("/api/isSharedLink", {
        withCredentials: true,
        headers: {
          sig: decodeURIComponent(params.sig),
          jwt: decodeURIComponent(params.jwt),
          publickey:decodeURIComponent(params.publickey)
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSharedLink(true);
        } else {
          setSharedLink(false);
        }
      })
      .catch((err) => {
        setSharedLink(false);
      });
  }, []);

  const handleModal = () => {
    showModal();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleSubmit = (values) => {
    const filename = state.metaData.fileName;
    const jwt = state.metaData.jwt;

    axios
      .get(`/api/sharefile/${filename}`, {
        responseType: "blob",
        withCredentials: true,
        headers: {
          jwt,
          sharecode: values.sharecode,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename); //or any other extension
          document.body.appendChild(link);
          link.click();
        }
      })
      .catch((error) => {
        console.error("File could not be downloaded:", error);
      });
  };

  return (
    <>
    {sharedLink && (
    <div className="share-file">
      <Modal
        visible={visible}
        title="ShareFile"
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
          form={form}
          onFinish={handleSubmit}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout="horizontal"
        >
          <Form.Item
            name="sharecode"
            label="分享码"
            rules={[
              {
                required: true,
                message: "请输入分享码",
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
          <div className="file-header">
            <InsertDriveFileIcon />
            <p className="file-name" title={state.metaData.fileName}>
              {state.metaData.fileName}
            </p>

            <IconButton onClick={handleModal}>
              <DownloadIcon />
            </IconButton>
          </div>
          <div className="file-info">
            Created: {state.metaData.createDate} <br />
            Last Modified: {state.metaData.lastModified} <br />
            File Size: {state.metaData.fileSize} MB
          </div>
    </div>
    )}

    {
      !sharedLink && <>
      <div style={{color:'red',padding:'20px'}}>you can not visit the page</div>
      </>
    }
    </>
  );
};
export default Main;
