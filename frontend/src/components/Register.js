import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import { passwordStrength } from "check-password-strength";

require("dotenv").config();

const Register = () => {
  // useeffect
  useEffect(() => {
    document.title = "Register - Drive Clone";
  }, []);

  // State Variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setpasswordConfirm] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [isClicked, setIsclicked] = useState(false);
  const [warning, setWarning] = useState("");
  const [checker, setChecker] = useState("Password Empty😑");
  const [color, setColor] = useState("grey");

  const passwordChecker = (value) => {
    let strength = passwordStrength(value).value;
    switch (strength) {
      case "Too weak": {
        setChecker("Password Too weak😭");
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

  const validateCreds = (e) => {
    e.preventDefault();
    // email regex
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // password regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    const nameRegex = /^[a-zA-Z0-9_-]{4,16}$/;

    // if (
    // 	emailRegex.test(email) &&
    // 	passwordRegex.test(password) &&
    // 	nameRegex.test(name)
    // ) {
    // 	setIsValidated(true);
    // 	postRegister(e, email, password);
    // } else {
    // 	setIsValidated(false);
    // }

    if (!nameRegex.test(name)) {
      setIsValidated(false);
      setWarning(
        "Username must be 4 to 16 characters (letters, numbers, underscores, minus signs)!"
      );
    } else if (!emailRegex.test(email)) {
      setIsValidated(false);
      setWarning("Incorrect email format!");
    } else if (!passwordRegex.test(password)) {
      setIsValidated(false);
      setWarning(
        "Password should be 8 to 16 characters, at least one uppercase letter, one lowercase letter, one number and one special character!"
      );
    } else {
      setIsValidated(true);
      postRegister(e, email, password);
    }
    setIsclicked(true);
  };

  const postRegister = (e) => {
    e.preventDefault();
    axios
      .post("/api/signup", {
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      })
      .then((res) => {
        console.log(res.status);
        if (res.status === 201) {
          setIsValidated(true);
          history.push("/login");
        } else {
          setIsValidated(false);
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="login-container">
      <form className="login-form">
        <div className="form-header">
          <img
            className="form-logo"
            src={process.env.PUBLIC_URL + "/Static/google_drive.svg"}
            alt="Drive Logo"
          />
          <h3 className="form-title">Register</h3>
        </div>
        <TextField
          id="outlined-full-width"
          label="Name"
          style={{ margin: 8 }}
          {...(!isValidated && isClicked ? { error: true } : {})}
          placeholder="Name"
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
          Register
        </Button>
      </form>
    </div>
  );
};

export default Register;
