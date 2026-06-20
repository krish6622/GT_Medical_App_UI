import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Shell><Dashboard /></Shell>} />
      <Route path="/catalogue" element={<Shell><Catalogue /></Shell>} />
      <Route path="/cart" element={<Shell><Cart /></Shell>} />
      <Route path="/orders" element={<Shell><Orders /></Shell>} />
      <Route path="/orders/:id" element={<Shell><OrderDetail /></Shell>} />
      <Route path="/invoices" element={<Shell><Invoices /></Shell>} />
      <Route path="/customers" element={<Shell><Customers /></Shell>} />
      <Route path="/inventory" element={<Shell><Inventory /></Shell>} />
      <Route path="/payments" element={<Shell><Payments /></Shell>} />
      <Route path="/reports" element={<Shell><Reports /></Shell>} />
      <Route path="/audit" element={<Shell><Audit /></Shell>} />
      <Route path="/settings" element={<Shell><Settings /></Shell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
