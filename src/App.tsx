import { AdminPage, AdminUnavailable } from "./components/admin";
import { ConvexArchive, StaticArchive } from "./components/archive";

export default function App() {
  const isAdminRoute =
    typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return import.meta.env.VITE_CONVEX_URL ? <AdminPage /> : <AdminUnavailable />;
  }

  return import.meta.env.VITE_CONVEX_URL ? <ConvexArchive /> : <StaticArchive />;
}
