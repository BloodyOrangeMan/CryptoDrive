import { TextField,InputAdornment  } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useState, useEffect,useRef } from 'react';
import { useHistory } from 'react-router';
import axios from 'axios';
import { passwordStrength } from "check-password-strength";

require('dotenv').config();

const ResetPsw = () => {
	// useeffect
	useEffect(() => {
		document.title = 'ResetPsw - Drive Clone';
	}, []);

	// State Variables
	const [code, setCode] = useState('');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setpasswordConfirm] = useState('');
	const [isValidated, setIsValidated] = useState(false);
	const [isClicked, setIsclicked] = useState(false);
	const [warning,setWarning] = useState('');
	const [color, setColor] = useState("grey");
	const [checker, setChecker] = useState("Password Empty😑");

	const [emailTimeout, setEmailTimeout] = useState(0);
    const timeRef=useRef()// Setting the delay timer
    useEffect(()=>{
    	// If the countdown is set and the countdown is not 0
        if(emailTimeout&&emailTimeout!==0)
            timeRef.current=setTimeout(()=>{
                setEmailTimeout(time=>time-1)
            },1000)
        //Clear Timeout
        return ()=>{
            clearTimeout(timeRef.current)
        }
    },[emailTimeout])

	const passwordChecker = (value) => {
		let strength = passwordStrength(value).value;
		switch (strength) {
		  case "Too weak": {
			setChecker("Password Too weak😅");
			setColor("red");
			break;
		  }
		  case "Weak": {
			setChecker("Password weak🥺");
			setColor("olive");
			break;
		  }
		  case "Medium": {
			setChecker("Password OK😬");
			setColor("lime");
			break;
		  }
		  case "Strong": {
			setChecker("Password Good🤩");
			setColor("green");
			break;
		  }
		}
	  };

	// functions
	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: theme.spacing(1),
		},
	}));
	const classes = useStyles();
	const history = useHistory();

    const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    const validateCreds = (e) => {
		e.preventDefault();
		// email regex
		
		// password regex
		const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;

		const codeRegex = /^[a-zA-Z0-9_-]{4,16}$/;

		

		if (!code) {
			setIsValidated(false);
			setWarning('code must be entered!')
		} else if(!emailRegex.test(email)) {
			setIsValidated(false);
			setWarning('Incorrect email format!')
		} else if (!passwordRegex.test(password)) {
			setIsValidated(false);
			setWarning('Password should be 8 to 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character!')
		}else if(password!==passwordConfirm){
            setIsValidated(false);
			setWarning('Passwords are not the same!')
        } else {
			setIsValidated(true);
			postReset(e, email, password);
		}
		setIsclicked(true);
	};

	const postReset = (e) => {
    e.preventDefault();
    axios
      .post("/api/resetPsw", {
        code: code,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.status);
        if (res.status === 201 || res.status === 200) {
          setIsValidated(true);
          history.push("/login");
        } else {
          setIsValidated(false);
        }
      })
      .catch((err) => console.log(err));
  };

    const getCode = ()=>{
        // Recapture countdown in progress
        if(emailTimeout) return;

		setWarning('')
        if(!emailRegex.test(email)){
            setIsValidated(false);
			setWarning('Incorrect email format!')
            return;
        }
        // Get verification code
        axios.post('/api/sendcode',{
            email
        })
        .then(res=>{
            const {data} = res;
            if(data.status==="success"){
                // Recapture countdown
                setEmailTimeout(60)
            }

        })
    }
    
	return (
		<div className="login-container">
		  <form className="login-form">
			<div className="form-header">
			  <img
				className="form-logo"
				src={process.env.PUBLIC_URL + "/Static/google_drive.svg"}
				alt="Drive Logo"
			  />
			  <h3 className="form-title">Reset</h3>
			</div>
			<TextField
			  id="outlined-full-width"
			  label="Email"
			  style={{ margin: 8 }}
			  {...(!isValidated && isClicked ? { error: true } : {})}
			  placeholder="Email"
			  fullWidth
			  margin="normal"
			  InputLabelProps={{
				shrink: true,
			  }}
			  autoComplete="off"
			  variant="outlined"
			  onChange={(e) => {
				setEmail(e.target.value);
			  }}
			/>
			<TextField
			  id="outlined-full-width"
			  label="Code"
			  style={{ margin: 8 }}
			  {...(!isValidated && isClicked ? { error: true } : {})}
			  placeholder="Code"
			  fullWidth
			  margin="normal"
			  InputLabelProps={{
				shrink: true,
			  }}
			  autoComplete="off"
			  variant="outlined"
			  onChange={(e) => {
				setCode(e.target.value);
			  }}
			  InputProps={{
				endAdornment: (
				  <InputAdornment position="end">
					<Button
					  variant="contained"
					  size="medium"
					  color="primary"
					  className={classes.margin}
					  style={{ width: 100 }}
					  onClick={() => getCode()}
					>
					  {emailTimeout > 0 ? emailTimeout : "Get Code"}
					</Button>
				  </InputAdornment>
				),
			  }}
			/>
	
			<TextField
			  id="outlined-full-width"
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
				passwordChecker(e.target.value);
			  }}
			/>
			<p style={{ color: color }}>{checker}</p>
	
			<TextField
			  id="outlined-full-width"
			  type="password"
			  label="PasswordConfirm"
			  style={{ margin: 8 }}
			  {...(!isValidated && isClicked ? { error: true } : {})}
			  placeholder="PasswordConfirm"
			  fullWidth
			  margin="normal"
			  InputLabelProps={{
				shrink: true,
			  }}
			  autoComplete="off"
			  variant="outlined"
			  onChange={(e) => {
				setpasswordConfirm(e.target.value);
			  }}
			/>
	
			<p className="warning">{warning}</p>
	
			<div className="links-div">
			  <a href="/login" className="forgot-password">
				Already Have an Account? Login.
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
			  Reset
			</Button>
		  </form>
		</div>
	  );
	};
	
	export default ResetPsw;