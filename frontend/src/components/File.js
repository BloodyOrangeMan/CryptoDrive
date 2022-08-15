import { useState, useEffect } from "react";

import { Button, Modal, Select, Input, Form ,InputNumber,DatePicker,message} from "antd";
import { TextField } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import ShareIcon from "@material-ui/icons/Share";
import TagIcon from '@mui/icons-material/Tag';

import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Buttonicon from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modalui from "@mui/material/Modal";
import axios from "axios";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import {copyText} from '../utils/publicfunc' 

require("dotenv").config();

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  borderRadius: 5,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const Main = ({ metaData, info, reRender, setReRender, keyData, fileID }) => {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState(false);

  const [newFileName, setNewFileName] = useState(metaData.filename);
  const [visible, setVisible] = useState(false);
  const [keys, setKeys] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  useEffect(() => {
    setKeys(keyData);
  }, [visible, share]);

  const handleModal = () => {
    showModal();
  };

  const handleCancel = () => {
    setVisible(false);
    setShare(false);
  };

  // HANDLE DELETE
  const handleDelete = () => {
    const filename = metaData.fileName;
    console.log(metaData);
    fetch(`/api/file/${filename}`, {
      method: "DELETE",
      withCredentials: true,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          reRender ? setReRender(0) : setReRender(1);
        }
      })
      .catch((err) => console.log(err));
  };

  // HANDLE RENAME
  const handleRename = () => {
    const data = {
      fileID,
      metadata: {
        filename: newFileName,
        createdate: metaData.createdate,
        lastmodified: new Date(Date.now()).toDateString(),
        filesize: metaData.filesize,
        type: metaData.type,
      },
    };

    axios.patch("/api/file/", {
      withCredentials: true,
      data,
    }).then((res) => {
      handleClose();
      reRender ? setReRender(0) : setReRender(1);
    })
  };

  const showModal = () => {
    setVisible(true);
  };


  const onChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    console.log("search:", value);
  };

  const handleSubmit = (values) => {
    console.log(values);
    const filename = metaData.fileName;

    axios
      .get(`/api/file/${filename}`, {
        responseType: "blob",
        withCredentials: true,
        headers: {
          passphrase: values.password,
          key: values.key,
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

  const handleShare = () => {
    setShare(true);
  };

  const handleShareSubmit = (values) => {
    const filename = metaData.fileName;
    const createdate = metaData.createDate;
    const lastmodified = metaData.lastModified;
    const filesize = metaData.fileSize;
    axios
      .post(`/api/share/${filename}`, {
        withCredentials: true,
        passphrase: values.password,
        key: values.key,
        sharecode: values.sharecode,
        password: values.sharecode,
        count:values.count,
        ddl:values.ddl.format()
      })
      .then((res) => {
        if (res.status === 200) {
          const { data } = res
          const jwt = data.jwt;
          const publicKey = data.publicKey;
          const sign = data.sign;
          const url = window.location.href + data.shareURL;
          console.log(url)
          
          handleCancel();
          Modal.success({
            title: 'Share',
            content: (
              <div>
                <p>分享码：{data.key}</p>
                <p>链接：{url}</p>
              </div>
            ),
            onOk() {
            copyText(url);
            message.success('链接已复制');
            },
            okText:"Copy"
          });
        }
      })
      .catch((error) => {
        console.error("File could not be downloaded:", error);
      });
  };


  const handleShowFileInfo = () => {
    Modal.info({
      title: 'CHECKSUM',
      content: (
        <div>
          <p>MD5:{info.md5}</p>
          <p>Sha256:{info.sha}</p>
        </div>
      ),
      onOk() { },
    });
  }

  return (
    <div className="file">
      <Modal
        visible={visible}
        title="Download"
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
          <Form.Item name="key" label="Key">

            {
              keys ? (<Select
                showSearch
                placeholder="Select a key"
                optionFilterProp="children"
                onChange={onChange}
                onSearch={onSearch}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {keys.map((key) => {
                  return <Option value={key._id}>{key.name}</Option>;
                })}
              </Select>) : (<Select></Select>)}
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
        </Form>
      </Modal>
      <Modal
        visible={share}
        title="Share"
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
          onFinish={handleShareSubmit}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <Form.Item name="key" label="Key">
            {keys ? (
              <Select
                showSearch
                placeholder="Select a key"
                optionFilterProp="children"
                onChange={onChange}
                onSearch={onSearch}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {keys.map((key) => {
                  return <Option value={key._id}>{key.name}</Option>;
                })}
              </Select>
            ) : (
              <Select></Select>
            )}
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
            name="sharecode"
            label="Login Password"
            rules={[
              {
                required: true,
                message: "Please input your Login Password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="count"
            label="Count"
            rules={[
              {
                required: true,
                message: "Please input your count!",
              },
            ]}
            hasFeedback
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="ddl"
            label="End Date"
            rules={[
              {
                required: true,
                message: "Please select end date!",
              },
            ]}
            hasFeedback
          >
            <DatePicker style={{ width: '50%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <div className="file-header">
        <InsertDriveFileIcon />
        <p className="file-name" title={metaData.fileName}>
          {metaData.fileName}
        </p>

        <IconButton onClick={handleModal}>
          <DownloadIcon />
        </IconButton>
      </div>
      <div className="file-info">
        Created: {metaData.createDate} <br />
        Last Modified: {metaData.lastModified} <br />
        File Size: {metaData.fileSize} MB
        <br />
        <br />
      </div>

      <div className="file-footer">
        <IconButton onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
        <IconButton onClick={handleShowFileInfo}>
          <TagIcon />
        </IconButton>
        <IconButton onClick={handleOpen}>
          <CreateIcon />
        </IconButton>
      </div>
      <Modalui
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <TextField
              required
              id="outlined-full-width"
              label="File Name"
              margin="normal"
              variant="outlined"
              fullWidth
              style={{ margin: 8 }}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={metaData.fileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
              }}
            />
          </Typography>

          {/* SAVE / EDIT / UPDATE REQUEST */}
          <Buttonicon
            style={{ margin: 8 }}
            variant="contained"
            onClick={handleRename}
          >
            Save
          </Buttonicon>
        </Box>
      </Modalui>
    </div>
  );
};
export default Main;
