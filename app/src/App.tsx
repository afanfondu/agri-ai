import Navbar from "./components/shared/navbar";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/home";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <Navbar />
      <HomePage />
      <Toaster position="bottom-center" richColors />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
