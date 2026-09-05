import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

import Dashboard from "./Pages/DashBoard";
import Scenarios from "./Pages/Scenarios";
import Portfolio from "./Pages/Portfolio";
import RiskControl from "./Pages/RiskControl";
import Optimisation from "./Pages/Optimisation";

import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/scenarios"
            element={<Scenarios />}
          />

          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          <Route
            path="/risk-control"
            element={<RiskControl />}
          />

          <Route
            path="/optimisation"
            element={<Optimisation />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;