import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import axios from 'axios';

require('dotenv').config();

const Login = () => {
	const history = useHistory();
	
	// useEffect
	useEffect(() => {
		document.title = 'Login - Drive Clone';
		axios.get('/api/isLoggedIn', {
			withCredentials: true
		}).then(res => {
			if (res.status === 200) {
				history.push('/');
			}
		}).catch((err) => console.log(err));

	}, [history]);

	// state Variables
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [isValidated, setIsValidated] = useState(false);
	const [isClicked, setIsclicked] = useState(false);

	// Functions
	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: theme.spacing(1),
		},
	}));
	const classes = useStyles();

	const validateCreds = (e) => {
		e.preventDefault();

		// Username regex
		// password regex
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

		const nameRegex = /^[a-zA-Z0-9_-]{3,16}$/;


		if (nameRegex.test(name) && passwordRegex.test(password)) {
			setIsValidated(true);

			// Posting to the API
			e.preventDefault();
			postLogin(name, password);
		} else {
			setIsValidated(false);
		}
		setIsclicked(true);
	};

	const postLogin = (name, password) => {
		axios.post('/api/login', {
			name: name,
			password: password
		}).then(res => {
			if (res.status === 200) {
				// localStorage.setItem("psw",password)
				history.push('/');
			} else {
				setIsValidated(false);
			}
		})
	};

	return (
		<div className="login-container">
			<form className="login-form">
				<div className="form-header">
					<img
						className="form-logo"
						src={process.env.PUBLIC_URL + '/Static/google_drive.svg'}
						alt="Drive Logo"
					/>
					<h3 className="form-title">Login</h3>
				</div>
				<TextField
					id="outlined-full-width login-email"
					label="Username"
					style={{ margin: 8 }}
					{...(!isValidated && isClicked ? { error: true } : {})}
					placeholder="Username"
					fullWidth
					margin="normal"
					InputLabelProps={{
						shrink: true,
					}}
					autoComplete="off"
					variant="outlined"
					onChange={(e) => {
						setName(e.target.value);
					}}
				/>
				<TextField
					id="outlined-full-width login-password"
					type="password"
					label="Password"
					style={{ margin: 8 }}
					{...(!isValidated && isClicked ? { error: true } : {})}
					placeholder="Password"
					fullWidth
					margin="normal"
					InputLabelProps={{
						shrink: true,
					}}
					autoComplete="off"
					variant="outlined"
					onChange={(e) => {
						setPassword(e.target.value);
					}}
				/>

				<div className="links-div">
					<a href="/register" className="forgot-password">
						Dont have an Account? Register Now.
					</a>
				</div>
				<div className="links-div">
					<a href="/resetPsw" className="forgot-password">
						retrieve password
					</a>
				</div>
				<Button
					type="submit"
					variant="contained"
					size="medium"
					color="primary"
					className={classes.margin}
					onClick={validateCreds}
				>
					Login
				</Button>
			</form>
		</div>
	);
};

export default Login;
