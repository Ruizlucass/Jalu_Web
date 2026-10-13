import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Menu from "../pages/Menu.jsx";
import Perfil from "../pages/Perfil.jsx";
import Register from "../pages/Register.jsx";
import Reservas from "../pages/Reservas.jsx";
import SobreNosotros from "../pages/SobreNosotros.jsx";
import ArabeLibre from "../pages/ArabeLibre.jsx";
import ClubJalu from "../pages/ClubJalu.jsx";

export const routes = [
  {
    path: "/",
    label: "Home",
    component: Home,
  },
  {
    path: "/menu",
    label: "Menu",
    component: Menu,
  },
  {
    path: "/arabe-libre",
    label: "Árabe Libre",
    component: ArabeLibre,
  },
  {
    path: "/club-jalu",
    label: "Club Jalu",
    component: ClubJalu,
  },
  {
    path: "/login",
    label: "Login",
    component: Login,
  },
  {
    path: "/register",
    label: "Registro",
    component: Register,
  },
  {
    path: "/perfil",
    label: "Perfil",
    component: Perfil,
  },
  {
    path: "/reservas",
    label: "Reservas",
    component: Reservas,
  },
  {
    path: "/sobre-nosotros",
    label: "Sobre nosotros",
    component: SobreNosotros,
  },
];