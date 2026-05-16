import Home from "./pages/Home.jsx";
import SobreNosotros from "./pages/SobreNosotros.jsx";

export default function App() {
  if (window.location.pathname === "/sobre-nosotros") {
    return <SobreNosotros />;
  }

  return <Home />;
}
