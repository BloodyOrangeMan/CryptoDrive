import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import axios from 'axios'
import {message} from 'antd'

// axios.defaults.baseURL = `http://127.0.0.1:3001`


axios.interceptors.response.use(
    function (response) {
		let msg = response?.data?.message
		message.destroy()
		msg&&message.success(msg)
        return response;
    },
    function (error) {

		let msg = error?.response?.data?.message
		message.destroy()
		msg&&message.warn(msg)
        return Promise.reject(error);
    }
);


ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
