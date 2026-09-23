import { RouteGuard } from "../guards/RouteGuard";
import { SuccessView } from "./SuccessView";

export function SuccessPage() {
  return (
    <RouteGuard>
      <SuccessView />
    </RouteGuard>
  );
}
