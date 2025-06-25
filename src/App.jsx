// ✅ DO NOT put BrowserRouter here if it's already in main.jsx

import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Home from "./pages/Home";
import LoginWithOTP from "./Login";

const App = () => (
  <MainLayout>
    <Routes>
      <Route path="/" element={<LoginWithOTP />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  </MainLayout>
);

export default App;
