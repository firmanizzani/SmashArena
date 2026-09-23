import { RouteGuard } from "../guards/RouteGuard";
import { CheckoutForm } from "./CheckoutForm";

export function CheckoutPage() {
  return (
    <RouteGuard>
      <CheckoutForm />
    </RouteGuard>
  );
}
