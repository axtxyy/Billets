import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import ResultsDashboard from "../pages/ResultsDashboard";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/results/:id" element={<ResultsDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;