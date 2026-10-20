import { useEffect } from "react";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Pedidos from "./pages/Pedidos.jsx";
import Reservas from "./pages/Reservas.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ArabeLibre from "./pages/ArabeLibre.jsx";
import MisSolicitudes from "./pages/MisSolicitudes.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import MenuProducts from "./admin/pages/MenuProducts.jsx";
import Promotions from "./admin/pages/Promotions.jsx";
import Reservations from "./admin/pages/Reservations.jsx";
import Orders from "./admin/pages/Orders.jsx";
import Completed from "./admin/pages/Completed.jsx";
import Cancelled from "./admin/pages/Cancelled.jsx";
import Users from "./admin/pages/Users.jsx";
import Roles from "./admin/pages/Roles.jsx";
import Unavailable from "./admin/pages/Unavailable.jsx";
import AdminProtected from "./admin/AdminProtected.jsx";

export default function App() {
  const actualPathname =
    window.location.pathname.replace(/\/$/, "") || "/";
  const routeBase = actualPathname.startsWith("/superadmin")
    ? "/superadmin"
    : actualPathname.startsWith("/admin")
      ? "/admin"
      : null;
  const savedPanelPath = window.history.state?.panelPath;
  const savedPathMatchesBase =
    routeBase &&
    typeof savedPanelPath === "string" &&
    (savedPanelPath === routeBase || savedPanelPath.startsWith(`${routeBase}/`));
  const pathname =
    actualPathname === routeBase && savedPathMatchesBase
      ? savedPanelPath.replace(/\/$/, "") || routeBase
      : actualPathname;

  useEffect(() => {
    if (!routeBase) return;

    if (window.location.pathname !== routeBase) {
      window.history.replaceState(
        { ...window.history.state, panelPath: pathname },
        "",
        routeBase
      );
    }
  }, [pathname, routeBase]);

  // =========================
  // SUPERADMIN
  // =========================
  if (pathname.startsWith("/superadmin")) {
    const page = getPanelPage(pathname, "superadmin");

    return (
      <AdminProtected allowedRoles={["superadmin"]}>
        <AdminLayout panelType="superadmin" currentPathname={pathname}>
          {page}
        </AdminLayout>
      </AdminProtected>
    );
  }

  // =========================
  // ADMIN
  // =========================
  if (pathname.startsWith("/admin")) {
    const page = getPanelPage(pathname, "admin");

    return (
      <AdminProtected allowedRoles={["admin", "superadmin"]}>
        <AdminLayout panelType="admin" currentPathname={pathname}>
          {page}
        </AdminLayout>
      </AdminProtected>
    );
  }

  // =========================
  // PÁGINAS PÚBLICAS
  // =========================

  if (pathname === "/menu") {
    return <Menu />;
  }

  if (pathname === "/arabe-libre") {
    return <ArabeLibre />;
  }

  if (pathname === "/pedidos") {
    return <Pedidos />;
  }

  if (pathname === "/reservas") {
    return <Reservas />;
  }

  if (pathname === "/mis-solicitudes") {
    return <MisSolicitudes />;
  }

  if (pathname === "/sobre-nosotros") {
    return <SobreNosotros />;
  }

  if (pathname === "/login") {
    return <Login />;
  }

  if (pathname === "/register") {
    return <Register />;
  }

  // HOME
  return <Home />;
}

function getPanelPage(pathname, panelType) {
  const basePath =
    panelType === "superadmin"
      ? "/superadmin"
      : "/admin";

  const section =
    pathname
      .slice(basePath.length)
      .replace(/^\//, "") || "dashboard";

  const pageProps = { panelType };

  if (section === "dashboard") {
    return <Dashboard {...pageProps} />;
  }

  if (section === "menu") {
    return <MenuProducts {...pageProps} />;
  }

  if (section === "promociones") {
    return <Promotions {...pageProps} />;
  }

  if (section === "reservas") {
    return <Reservations {...pageProps} />;
  }

  if (section === "pedidos") {
    return <Orders {...pageProps} />;
  }

  if (section === "finalizados") {
    return <Completed {...pageProps} />;
  }

  if (section === "cancelados") {
    return <Cancelled {...pageProps} />;
  }

  if (
    panelType === "superadmin" &&
    section === "usuarios"
  ) {
    return <Users panelType={panelType} />;
  }

  if (
    panelType === "superadmin" &&
    section === "roles"
  ) {
    return <Roles />;
  }

  return <Unavailable panelType={panelType} />;
}
