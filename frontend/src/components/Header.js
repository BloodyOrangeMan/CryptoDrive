import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router';
import axios from 'axios';

require('dotenv').config();

function Header({ userName, setIsLoggedIn }) {
	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: 10,
		},
		avatar: {
			backgroundColor: 'red',
		},
	}));
	const history = useHistory();

	const handleLogout = () => {
		axios.get('/api/logout').then(res => {
			if (res.status === 200) {
				history.push('/login');
			} 
		}).catch((err) => console.log(err));
	};

	const classes = useStyles();
	return (
		<div className="header">
			<div className="logo">
				<img
					src={process.env.PUBLIC_URL + '/Static/google_drive.svg'}
					alt="Logo"
				/>
				<h1>Drive Clone</h1>
			</div>

			<div className="avatar">
				<Button
					type="submit"
					variant="contained"
					size="small"
					color="primary"
					className={classes.margin}
					onClick={handleLogout}
				>
					Logout
				</Button>
				<Avatar className={classes.avatar}>{userName.slice(0,3)}</Avatar>
			</div>
		</div>
	);
}

export default Header;
