import Header from "./Header";
import SideBar from "./SideBar";
import Main from "./Main";
import { useState, useEffect } from "react";
import { useHistory, Redirect } from "react-router";
import axios from "axios";

require("dotenv").config();

const Dashboard = () => {
  // USE HSTORY
  const history = useHistory();

  console.log(process.env.REACT_APP_IP);

  // useEffect(() => {
  // 	document.title = 'Drive Clone';
  // 	let url =
  // 	'/api/isLoggedIn';
  // 	// get request with fetch
  // 	fetch(url, {
  // 		method: 'GET',
  // 		withCredentials: true,
  // 		credentials: 'include',
  // 		headers: {
  // 			'Content-Type': 'application/json',
  // 		},
  // 	})
  // 		.then((res) => {
  // 			if(res.status !== 200) {
  // 				setIsLoggedIn(false);
  // 				history.push('/login');
  // 			} else {
  // 				setIsLoggedIn(true);
  // 				setUserName('demo');
  // 			}
  // 		})
  // 		.catch((err) => console.log(err));
  // }, [history]);

  // API GET Request for is-logged
  useEffect(() => {
    document.title = "Drive Clone";
    axios
      .get("/api/isLoggedIn", {
        withCredentials: true,
      })
      .then((res) => {
		setIsLoggedIn(true);
		setUserName(res.data.user);
})
      .catch((err) => {
		history.push('/login');
	  });
  }, [history]);

  // State Variables
  const [userName, setUserName] = useState("");
  const [sideBarOption, setSideBarOption] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reRender, setReRender] = useState(0);
  console.log(userName);
  if (isLoggedIn)
    return (
      <div className="dashboard-container">
        {/* Header */}
        <Header userName={userName} setIsLoggedIn={setIsLoggedIn} />
        <div className="main-flex">
          {/* Side Bar */}
          <SideBar
            setSideBarOption={setSideBarOption}
            reRender={reRender}
            setReRender={setReRender}
          />
          {/* Main */}
          <Main
            sideBarOption={sideBarOption}
            reRender={reRender}
            setReRender={setReRender}
          />
        </div>
      </div>
    );
  else
    return (
      <>
        <h1>Checking Credentials...</h1>
      </>
    );
};

export default Dashboard;
