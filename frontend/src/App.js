import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPsw from './components/Resetpsw';
import ShareFile from './components/Share';
import Check from './components/Check';

function App() {
	return (
		// <div className="App">
		<Router>
			<Switch>
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
				<Route exact path="/share/:key">
					<ShareFile />
				</Route>
				{/* Dashboard Route */}
				<Route exact path="/">
					<Dashboard />
				</Route>
				<Route exact path="/check">
					<Check />
				</Route>
			</Switch>
		</Router>
		// </div>
	);
}

export default App;
