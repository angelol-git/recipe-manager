import "./App.css";
import { RecipesProvider } from "./contexts/RecipesContext";
import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <RecipesProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Route>
      </Routes>
    </RecipesProvider>
  );
}

export default App;
