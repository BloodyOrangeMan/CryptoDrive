import { useState, useEffect } from "react";
import { Button, Modal, Select, Input, Form } from "antd";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { useRouteMatch } from 'react-router';

require("dotenv").config();

const Main = () => {
  const {params:{key}} = useRouteMatch();
  const [token,setToken] = useState(null)
  const [state, setState] = useState({
    metaData: {
      fileName: "",
      createDate: "",
      lastModified: "",
      fileSize: "",
    }
  });
  const [visible, setVisible] = useState(false);
  const [sharedLink, setSharedLink] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    
    axios.get(`/api/share/info/${key}`)
    .then(res=>{
      const {data} = res;
      if(data.info){
        let fileInfo = data.info;
        setState({
          metaData:fileInfo
        })
        setToken(fileInfo.token)
        setSharedLink(true);
      }
    })
  }, []);

  const handleModal = () => {
    console.log("下载")
    
    window.location.href = `${window.location.protocol}//localhost:3001/api/share/download/${token}`
    // axios.get(`/api/share/download/${token}`)
    // showModal();
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
