import Navbar from "./components/shared/navbar";
import HomePage from "./pages/home";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <Navbar />
      <HomePage />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
