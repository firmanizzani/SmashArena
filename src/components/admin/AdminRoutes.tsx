import { RouteGuard } from "../guards/RouteGuard";
import { AdminBookings } from "./AdminBookings";
import { AdminCourts } from "./AdminCourts";
import { AdminCustomers } from "./AdminCustomers";
import { AdminDashboard } from "./AdminDashboard";
import { AdminPayments } from "./AdminPayments";

export function AdminDashboardRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminDashboard />
    </RouteGuard>
  );
}

export function AdminBookingsRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminBookings />
    </RouteGuard>
  );
}

export function AdminCustomersRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminCustomers />
    </RouteGuard>
  );
}

export function AdminCourtsRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminCourts />
    </RouteGuard>
  );
}

export function AdminPaymentsRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminPayments />
    </RouteGuard>
  );
}
