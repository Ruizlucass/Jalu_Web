import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";

export default function App() {
  if (window.location.pathname === "/menu") {
    return <Menu />;
  }

  if (window.location.pathname === "/sobre-nosotros") {
    return <SobreNosotros />;
  }

  return <Home />;
}
