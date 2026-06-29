import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import NewRecipePage from "./pages/kitchen/NewRecipePage";
import RecipePage from "./pages/kitchen/RecipePage";
import Toast from "./components/Toast";
import { ToastProvider } from "./context/ToastProvider";
import { useToast } from "./hooks/useToast";

const queryClient = new QueryClient();

function ToastContainer() {
  const { toast, setToast } = useToast();

  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kitchen" element={<NewRecipePage />} />
          <Route path="/kitchen/:id" element={<RecipePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
