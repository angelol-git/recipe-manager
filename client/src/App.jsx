import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ChatLayout from "./pages/chat/ChatLayout";
import Chat from "./pages/chat/Chat";
import NewChat from "./pages/chat/NewChat";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<ChatLayout />}>
            <Route index element={<NewChat />} />
            <Route path="/chat/:id" element={<Chat />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
