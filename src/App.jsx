import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Reservas from "./pages/Reservas.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  if (window.location.pathname === "/menu") {
    return <Menu />;
  }

  if (window.location.pathname === "/sobre-nosotros") {
    return <SobreNosotros />;
  }

  if (window.location.pathname === "/reservas") {
    return <Reservas />;
  }

  if (window.location.pathname === "/login") {
    return <Login />;
  }

  if (window.location.pathname === "/register") {
    return <Register />;
  }

  return <Home />;
}