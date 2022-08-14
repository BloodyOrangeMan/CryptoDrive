import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPsw from './components/Resetpsw';
import ShareFile from './components/Share';



function App() {
	return (
		// <div className="App">
			<Router>
				<Switch>
					{/**分享链接 */}
					<Route exact path="/share/file">
						<ShareFile />
					</Route>
					{/* Login Route */}
					<Route exact path="/login">
						<Login />
					</Route>
					<Route exact path="/register">
						<Register />
					</Route>
					<Route exact path="/resetpsw">
						<ResetPsw />
					</Route>
					{/* Dashboard Route */}
					<Route exact path="/">
						<Dashboard />
					</Route>
				</Switch>
			</Router>
		// </div>
	);
}

export default App;
