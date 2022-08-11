import Header from './Header';
import SideBar from './SideBar';
import Main from './Main';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import axios from 'axios';

require('dotenv').config();

const Dashboard = () => {
	// USE HSTORY
	const history = useHistory();

	console.log(process.env.REACT_APP_IP);

	// API GET Request for is-logged
	useEffect(() => {
		document.title = 'Drive Clone';
		axios.get('/api/isLoggedIn', {
			withCredentials: true
		}).then(res => {

			if (res.status === 200) {
				setIsLoggedIn(true);
				setUserName('demo');
			} else {
				setIsLoggedIn(false);
				history.push('/login');
			}
		}).catch((err) => {
			setIsLoggedIn(false);
			history.push('/login');
		});


	}, [history]);

	// State Variables
	const [userName, setUserName] = useState('');
	const [sideBarOption, setSideBarOption] = useState(0);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [reRender, setReRender] = useState(0);

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
