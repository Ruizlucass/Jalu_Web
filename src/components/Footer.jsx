import {
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#080808] text-white mt-20 border-t border-white/10">

      
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-10 px-5 py-12 sm:grid-cols-2 sm:gap-12 sm:px-8 sm:py-14 xl:grid-cols-4 xl:gap-12 xl:px-16 xl:py-16">

       
        <div className="flex items-start">
          <a href="#home" aria-label="Jalu inicio">
            <img
              src="/img/Logo-Jalu.png"
              alt="Jalu"
              className="h-20 w-auto transition duration-300 hover:scale-105 sm:h-24"
            />
          </a>
        </div>

     
        <div>
          <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Sobre Nosotros
          </h3>

          <ul className="space-y-3 text-sm text-[#b9b9b9] sm:space-y-4 sm:text-base">
            <li className="hover:text-[#e71921] cursor-pointer transition">
              Nuestra historia
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Quiénes Somos
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Reservas
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Contacto
            </li>
          </ul>
        </div>

      
        <div>
          <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Descubrí
          </h3>

          <ul className="space-y-3 text-sm text-[#b9b9b9] sm:space-y-4 sm:text-base">
            <li>
              <a className="hover:text-[#e71921] cursor-pointer transition" href="/menu">
                Menú
              </a>
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Promociones
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Eventos
            </li>
          </ul>
        </div>

        
        <div>
          <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Contacto
          </h3>

          <p className="text-[#b9b9b9] mb-5 leading-relaxed">
            Seguinos en nuestras redes sociales
          </p>

          
          <div className="flex gap-5 text-3xl">

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaFacebook />
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaInstagram />
            </a>

            <a
              href="https://wa.me/5493811234567"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaWhatsapp />
            </a>

          </div>

         
          <p className="mt-8 text-[#b9b9b9] text-sm leading-relaxed">
            Sabores auténticos del Medio Oriente.
          </p>
        </div>
      </div>

     
      <div className="mx-5 border-t border-white/10 sm:mx-8 xl:mx-16"></div>

     
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-5 px-5 py-7 text-center text-xs text-[#b9b9b9] sm:px-8 sm:text-sm md:flex-row md:text-left xl:px-16">

        <p>
          © 2026 Jalu. Todos los derechos reservados
        </p>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-end">
          <span className="hover:text-[#e71921] cursor-pointer transition">
            Política de privacidad
          </span>

          <span className="hover:text-[#e71921] cursor-pointer transition">
            Defensa del consumidor
          </span>
        </div>

      </div>
    </footer>
  );
}
