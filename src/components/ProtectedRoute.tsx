import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Spinner } from "./ui";

/**
 * Route guard. `need` enforces the two-portal separation:
 *   - "staff"    → GT Medical admin/staff only (no customer_id)
 *   - "customer" → retail pharmacy users only (has customer_id)
 * A role mismatch bounces to "/" so customers can never deep-link into
 * admin ERP screens (and vice-versa).
 */
export function ProtectedRoute({ children, need }: { children: ReactNode; need?: "staff" | "customer" }) {
  const { me, loading, isStaff, isCustomer } = useAuth();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/login" replace />;
  if (need === "staff" && !isStaff) return <Navigate to="/" replace />;
  if (need === "customer" && !isCustomer) return <Navigate to="/" replace />;
  return <>{children}</>;
}
