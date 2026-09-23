import { RouteGuard } from "../guards/RouteGuard";
import { MyBookingsPage } from "./MyBookings";

export function MyBookingsRoute() {
  return (
    <RouteGuard>
      <MyBookingsPage />
    </RouteGuard>
  );
}
