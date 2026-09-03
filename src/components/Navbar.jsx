import { useEffect, useState } from "react";
import { trackEvent } from "../helpers/tracking.js";
import AuthModal from "./AuthModal.jsx";
import { supabase } from "../supabase.js";
import {
  getAdminPathForRole,
  getUserInitials,
  getUserRole,
} from "../utils/authProfile.js";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const aplicarUsuario = async (sessionUser) => {
      if (!mounted) {
        return;
      }

      setUser(sessionUser ?? null);

      if (!sessionUser) {
        setUserRole(null);
        return;
      }

      const role = await getUserRole(sessionUser.id);

      if (mounted) {
        setUserRole(role);
      }
    };

    const obtenerSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      aplicarUsuario(session?.user ?? null);
    };

    obtenerSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        aplicarUsuario(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const openLogin = () => {
    closeMenu();
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    closeMenu();
    setAuthMode("register");
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
  };

  const handleAuthSuccess = async (loggedUser) => {
    setUser(loggedUser);
    setUserRole(await getUserRole(loggedUser?.id));
    setAuthOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }

    setUser(null);
    setUserRole(null);
    closeMenu();
  };

  const isHome = window.location.pathname === "/";
  const userInitials = getUserInitials(user);
  const adminPath = getAdminPathForRole(userRole);

  const authButtonBase =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[0.9rem] font-extrabold tracking-normal transition duration-200 hover:-translate-y-px";

  const loginButton =
    `${authButtonBase} border border-white/15 bg-white/[0.04] text-[#b9b9b9] hover:border-white/30 hover:bg-white/10 hover:text-white`;

  const registerButton =
    `${authButtonBase} border border-[#e71921] bg-[#e71921] text-white shadow-[0_14px_32px_rgba(231,25,33,0.28)] hover:border-[#ff2a33] hover:bg-[#ff2a33]`;

  const adminButton =
    `${authButtonBase} border border-[#e71921]/70 bg-[#e71921]/10 text-white hover:border-[#ff2a33] hover:bg-[#e71921]`;

  const initialsBadge =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e71921]/60 bg-[#e71921] text-sm font-black text-white shadow-[0_12px_28px_rgba(231,25,33,0.28)]";

  const navLink =
    "transition-colors duration-200 hover:text-white";

  const homeLink =
    "inline-flex min-h-10 items-center justify-center rounded-full border border-[#e71921]/60 px-4 text-[#e71921] transition duration-200 hover:border-[#ff2a33] hover:bg-[#e71921] hover:text-white";

  const LoginIcon = () => (
    <svg
      className="h-4 w-4"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-[#080808]/85 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 min-[960px]:px-[52px]">

          {/* LOGO */}
          <a
            className="flex items-center"
            href="/"
            aria-label="Jalu inicio"
            onClick={closeMenu}
          >
            <img
              className="block h-auto w-[104px]"
              src="/img/Logo-Jalu.png"
              alt="Jalu"
            />
          </a>

          
          <nav
            className="hidden items-center gap-5 text-[0.9rem] font-extrabold text-[#b9b9b9] min-[960px]:flex"
            aria-label="Principal"
          >
            {!isHome && (
              <a
                className={homeLink}
                href="/"
                onClick={closeMenu}
              >
                Inicio
              </a>
            )}

            <a className={navLink} href="/menu">
              Menú
            </a>

            <a className={navLink} href="/arabe-libre">
              Árabe libre
            </a>

           <a
          href="/pedidos"
           className="transition hover:text-[#e71921]"
           >    
           Pedidos
           </a>

           <a
             href="/reservas"
             className="transition hover:text-[#e71921]"
           >
             Reservas
           </a>

            <a className={navLink} href="/club-jalu">
              Club Jalu
            </a>

            <a className={navLink} href="/sobre-nosotros">
              Sobre nosotros
            </a>
          </nav>

          
          <div className="hidden gap-2 min-[960px]:flex">

            {user ? (
              <>
                <span
                  className={initialsBadge}
                  aria-label="Usuario activo"
                  title={user.email}
                >
                  {userInitials}
                </span>

                {adminPath && (
                  <a
                    className={adminButton}
                    href={adminPath}
                    onClick={closeMenu}
                  >
                    Panel
                  </a>
                )}

                <button
                  type="button"
                  className={loginButton}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={loginButton}
                  onClick={() => {
                    trackEvent("click_login_nav");
                    openLogin();
                  }}
                >
                  <LoginIcon />
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  className={registerButton}
                  onClick={() => {
                    trackEvent("click_register_nav");
                    openRegister();
                  }}
                >
                  Registrarse
                </button>
              </>
            )}

          </div>

          <div className="ml-auto flex items-center gap-3 min-[960px]:hidden">
            {user && (
              <span
                className={initialsBadge}
                aria-label="Usuario activo"
                title={user.email}
              >
                {userInitials}
              </span>
            )}

            <button
              className="relative top-1 z-30 grid h-10 w-10 place-items-center rounded-md border border-white/10 text-white transition hover:border-white/25 hover:bg-white/10"
              type="button"
              aria-label={
                isMenuOpen ? "Cerrar menu" : "Abrir menu"
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() =>
                setIsMenuOpen((current) => !current)
              }
            >
              <span className="relative h-5 w-6">

                <span
                  className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                    isMenuOpen
                      ? "translate-y-[9px] rotate-45"
                      : ""
                  }`}
                />

                <span
                  className={`absolute left-0 top-[9px] h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />

                <span
                  className={`absolute left-0 top-[18px] h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                    isMenuOpen
                      ? "-translate-y-[9px] -rotate-45"
                      : ""
                  }`}
                />

              </span>
            </button>
          </div>

        </div>

        
        <div
          id="mobile-menu"
          className={`overflow-hidden border-t border-white/10 bg-[#080808]/95 px-4 transition-all duration-300 min-[960px]:hidden ${
            isMenuOpen
              ? "max-h-[560px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >

          <nav
            className="flex flex-col gap-5 py-5 text-lg font-extrabold text-[#b9b9b9]"
            aria-label="Principal mobile"
          >
            {!isHome && (
              <a
                className={`${homeLink} w-full`}
                href="/"
                onClick={closeMenu}
              >
                Inicio
              </a>
            )}

            <a
              className={navLink}
              href="/menu"
              onClick={closeMenu}
            >
              Menú
            </a>

            <a
              className={navLink}
              href="/arabe-libre"
              onClick={closeMenu}
            >
              Árabe libre
            </a>

            <a
              className={navLink}
              href="/pedidos"
              onClick={closeMenu}
            >
              Pedidos
            </a>

            <a
              className={navLink}
              href="/reservas"
              onClick={closeMenu}
            >
              Reservas
            </a>

            <a
              className={navLink}
              href="/club-jalu"
              onClick={closeMenu}
            >
              Club Jalu
            </a>

            <a
              className={`${navLink} pt-1`}
              href="/sobre-nosotros"
              onClick={closeMenu}
            >
              Sobre nosotros
            </a>
          </nav>

          <div className="grid gap-2 pb-6">

            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <span
                    className={initialsBadge}
                    aria-label="Usuario activo"
                    title={user.email}
                  >
                    {userInitials}
                  </span>

                  <span className="min-w-0 truncate text-sm font-extrabold text-[#b9b9b9]">
                    {user.email}
                  </span>
                </div>

                {adminPath && (
                  <a
                    className={`${adminButton} w-full`}
                    href={adminPath}
                    onClick={closeMenu}
                  >
                    Ir al panel
                  </a>
                )}

                <button
                  type="button"
                  className={`${loginButton} w-full`}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${loginButton} w-full`}
                  onClick={() => {
                    trackEvent("click_login_nav");
                    openLogin();
                  }}
                >
                  <LoginIcon />
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  className={`${registerButton} w-full`}
                  onClick={() => {
                    trackEvent("click_register_nav");
                    openRegister();
                  }}
                >
                  Registrarse
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      
      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
