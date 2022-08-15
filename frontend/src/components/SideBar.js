import { useState, useEffect } from "react";
import { Button, Modal, Select, Input, Form, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { makeStyles } from "@material-ui/styles";
import GroupIcon from "@material-ui/icons/Group";
import ComputerIcon from "@material-ui/icons/Computer";
import AddIcon from "@material-ui/icons/Add";
// import Button from '@mui/material/Button';
// import Modal from '@mui/material/Modal';
import KeyIcon from "@mui/icons-material/Key";

require("dotenv").config();


const SideBar = ({
  sideBarOption,
  setSideBarOption,
  reRender,
  setReRender,
  keyData,
}) => {
  // State Variables
  const [listActive1, setListActive1] = useState("list-item-active");
  const [listActive2, setListActive2] = useState("");
  const [listActive3, setListActive3] = useState("");
 
  const [visible, setVisible] = useState(false);
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    axios.get("api/key/", { withCredentials: true }).then((res) => {
      setKeys(res.data.keys);
    });
  }, [visible]);

  // Functions
  // Button Styles
  const useStyles = makeStyles({
    btn: {
      color: "#5F6368",
    },
    uploadbtn: {
      color: "#2185FC",
      fontSize: "40px",
    },
  });

  const [form] = Form.useForm();
  const classes = useStyles();
  const { Option } = Select;
  

  const normFile = (e) => {
    console.log("Upload event:", e);

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };


  const handleModal = () => {
    showModal();
  };

  const onChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    console.log("search:", value);
  };

  const handleClick = (option) => {
    setSideBarOption(option);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleSubmit = async (values) => {
	console.log('Received values of form: ', values);
	const fileList = values.upload;
	console.log(fileList);
    var data = new FormData();
	fileList.forEach(file => {
		console.log(file);
		data.append('file',file.originFileObj);
	});
	
  data.append('key',values.key);
  data.append('passphrase',values.password);
  
	  axios.post(`/api/file/`, data)
		.then((res) => {
		  if (res.status === 200) {
			reRender ? setReRender(0) : setReRender(1);
      setVisible(false);
		  }
		})
		.catch((err) => console.log(err));
  };


  const handleCancel = () => {
    setVisible(false);
  };



  const props = {
    showUploadList: true,
    beforeUpload: () => false,
  };

  return (
    <div className="sidebar">
      <div className="upload-btn" onClick={handleModal}>
        <AddIcon className={classes.uploadbtn} />
        Upload
      </div>
      <Modal
        visible={visible}
        title="Upload your file"
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
          name="key"
          label="Key"
          >
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
            name="upload"
            label="Upload"
            getValueFromEvent={normFile}
			valuePropName="fileList"
          >
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <ul className="sidebar-list">
        <li
          className={`list-item ${listActive1}`}
          onClick={() => {
            handleClick(0);
            setListActive1("list-item-active");
            setListActive2("");
            setListActive3("");
          }}
        >
          <ComputerIcon className={classes.btn} fontSize="large" />
          <p className="list-text">My Drive</p>
        </li>
        <li
          className={`list-item ${listActive2}`}
          onClick={() => {
            handleClick(1);
            setListActive2("list-item-active");
            setListActive1("");
            setListActive3("");
          }}
        >
          <KeyIcon className={classes.btn} fontSize="large" />
          <p className="list-text">My Keys</p>
        </li>
        <li
          className={`list-item ${listActive3}`}
          onClick={() => {
            handleClick(2);
            setListActive3("list-item-active");
            setListActive1("");
            setListActive2("");
          }}
        >
          <GroupIcon className={classes.btn} fontSize="large" />
          <p className="list-text">Dev Team</p>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
