import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DealsPage } from "./pages/DealsPage";
import { DealDetailPage } from "./pages/DealDetailPage";
import { ContactsPage } from "./pages/ContactsPage";
import { CompaniesPage } from "./pages/CompaniesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DealsPage />} />
          <Route path="deals/:id" element={<DealDetailPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
