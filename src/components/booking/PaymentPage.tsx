import { RouteGuard } from "../guards/RouteGuard";
import { PaymentPanel } from "./PaymentPanel";

export function PaymentPage() {
  return (
    <RouteGuard>
      <PaymentPanel />
    </RouteGuard>
  );
}
