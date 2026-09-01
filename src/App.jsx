import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Reservas from "./pages/Reservas.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ArabeLibre from "./pages/ArabeLibre.jsx";
import ClubJalu from "./pages/ClubJalu.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import MenuProducts from "./admin/pages/MenuProducts.jsx";
import Promotions from "./admin/pages/Promotions.jsx";
import Reservations from "./admin/pages/Reservations.jsx";
import Orders from "./admin/pages/Orders.jsx";
import Users from "./admin/pages/Users.jsx";
import Roles from "./admin/pages/Roles.jsx";
import Unavailable from "./admin/pages/Unavailable.jsx";
import AdminProtected from "./admin/AdminProtected.jsx";

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

if (pathname.startsWith("/superadmin")) {
  const page = getPanelPage(pathname, "superadmin");

  return (
    <AdminProtected allowedRoles={["superadmin"]}>
      <AdminLayout panelType="superadmin">
        {page}
      </AdminLayout>
    </AdminProtected>
  );
}

if (pathname.startsWith("/admin")) {
  const page = getPanelPage(pathname, "admin");

  return (
    <AdminProtected allowedRoles={["admin", "superadmin"]}>
      <AdminLayout panelType="admin">
        {page}
      </AdminLayout>
    </AdminProtected>
  );
}
  if (pathname === "/menu") {
    return <Menu />;
  }

  if (pathname === "/arabe-libre") {
    return <ArabeLibre />;
  }

  if (pathname === "/club-jalu") {
    return <ClubJalu />;
  }

  if (pathname === "/sobre-nosotros") {
    return <SobreNosotros />;
  }

  if (pathname === "/reservas") {
    return <Reservas />;
  }

  if (pathname === "/login") {
    return <Login />;
  }

  if (pathname === "/register") {
    return <Register />;
  }

  return <Home />;
}

function getPanelPage(pathname, panelType) {
  const basePath = panelType === "superadmin" ? "/superadmin" : "/admin";
  const section = pathname.slice(basePath.length).replace(/^\//, "") || "dashboard";
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

  if (panelType === "superadmin" && section === "usuarios") {
    return <Users />;
  }

  if (panelType === "superadmin" && section === "roles") {
    return <Roles />;
  }

  return <Unavailable panelType={panelType} />;
}
