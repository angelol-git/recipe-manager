import "./App.css";
import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Add from "./pages/Add";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/add" element={<Add />} />

        <Route path="/add/:id" element={<Add />} />
      </Route>
    </Routes>
  );
}

export default App;
