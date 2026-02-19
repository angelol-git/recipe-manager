import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import ChatLayout from "./pages/chat/ChatLayout";
import Chat from "./pages/chat/Chat";
import NewChat from "./pages/chat/NewChat";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatLayout />}>
          <Route index element={<NewChat />} />
          <Route path=":id" element={<Chat />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
