import { useState, useEffect } from "react";

import { Button, Modal, Select, Input,  Form } from "antd";
import { TextField } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Buttonicon from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modalui from "@mui/material/Modal";
import axios from "axios";
import { ConsoleSqlOutlined } from "@ant-design/icons";

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

const Main = ({ metaData, reRender, setReRender ,keyData}) => {
  const [open, setOpen] = useState(false);
  const [newFileName, setNewFileName] = useState(metaData.filename);
  const [visible, setVisible] = useState(false);
  const [keys, setKeys] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  useEffect( () => {
    console.log(keyData);
    setKeys(keyData);
  }, [visible]);

  const handleModal = () => {
    showModal();
  };

  const handleCancel = () => {
    setVisible(false);
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
      filename: metaData.filename,
      metadata: {
        filename: newFileName,
        createdate: metaData.createdate,
        lastmodified: new Date(Date.now()).toDateString(),
        filesize: metaData.filesize,
        type: metaData.type,
      },
    };
    fetch(`${process.env.REACT_APP_IP}/renameBlob`, {
      method: "PATCH",
      withCredentials: true,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          handleClose();
          reRender ? setReRender(0) : setReRender(1);
        }
      })
      .catch((err) => console.log(err));
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
		if(res.status === 200) {
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
              keys ? (              <Select
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
