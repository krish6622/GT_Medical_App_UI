import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Invoices from "./pages/Invoices";
import Outstanding from "./pages/Outstanding";
import Profile from "./pages/Profile";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Purchase from "./pages/Purchase";

function Shell({ children, need }: { children: React.ReactNode; need?: "staff" | "customer" }) {
  return (
    <ProtectedRoute need={need}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared (role-branched inside the page) */}
      <Route path="/" element={<Shell><Dashboard /></Shell>} />
      <Route path="/catalogue" element={<Shell><Catalogue /></Shell>} />
      <Route path="/orders" element={<Shell><Orders /></Shell>} />
      <Route path="/orders/:id" element={<Shell><OrderDetail /></Shell>} />
      <Route path="/invoices" element={<Shell><Invoices /></Shell>} />
      <Route path="/payments" element={<Shell><Payments /></Shell>} />

      {/* Retail-pharmacy portal only */}
      <Route path="/cart" element={<Shell need="customer"><Cart /></Shell>} />
      <Route path="/checkout" element={<Shell need="customer"><Checkout /></Shell>} />
      <Route path="/outstanding" element={<Shell need="customer"><Outstanding /></Shell>} />
      <Route path="/profile" element={<Shell need="customer"><Profile /></Shell>} />

      {/* GT Medical admin/ERP only */}
      <Route path="/customers" element={<Shell need="staff"><Customers /></Shell>} />
      <Route path="/inventory" element={<Shell need="staff"><Inventory /></Shell>} />
      <Route path="/purchase" element={<Shell need="staff"><Purchase /></Shell>} />
      <Route path="/users" element={<Shell need="staff"><Users /></Shell>} />
      <Route path="/reports" element={<Shell need="staff"><Reports /></Shell>} />
      <Route path="/audit" element={<Shell need="staff"><Audit /></Shell>} />
      <Route path="/settings" element={<Shell need="staff"><Settings /></Shell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
