import { createBrowserRouter } from "react-router";
import App from "./App";
import { Login } from "./components/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./components/DashboardHome";
import { AirlineManagement } from "./components/AirlineManagement";
import { TourPackages } from "./components/TourPackages";
import { Promotions } from "./components/Promotions";
import { UserRoles } from "./components/UserRoles";
import { UserRoleManagement } from "./components/UserRoleManagement";
import { RolePrivilegesManagement } from "./components/RolePrivilegesManagement";
import { BuildItinerary } from "./components/BuildItinerary";
import { Reports } from "./components/Reports";
import { MyBookings } from "./components/MyBookings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "airlines", Component: AirlineManagement },
      { path: "packages", Component: TourPackages },
      { path: "promotions", Component: Promotions },
      { path: "roles", Component: UserRoles },
      { path: "user-management", Component: UserRoleManagement },
      { path: "role-privileges", Component: RolePrivilegesManagement },
      { path: "itinerary", Component: BuildItinerary },
      { path: "reports", Component: Reports },
      { path: "my-bookings", Component: MyBookings },
    ],
  },
]);