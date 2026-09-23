import { RouteGuard } from "../guards/RouteGuard";
import { ProfileView } from "./ProfileView";

export function ProfileRoute() {
  return (
    <RouteGuard>
      <ProfileView />
    </RouteGuard>
  );
}
