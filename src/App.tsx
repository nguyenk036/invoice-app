import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/Quotes";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}