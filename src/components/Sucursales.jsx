import Button from "./Button.jsx";
import { branches } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export default function Sucursales() {
  return (
    <section id="sucursales" className="section py-14">
      <div className="section-header branch-header mb-10 text-center">
        <div>
          <span className="eyebrow text-orange-500 font-semibold uppercase tracking-widest">
            Sucursales
          </span>

          <h2 className="section-title text-5xl font-extrabold mt-3">
            Siempre cerca
          </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="flex flex-wrap justify-center gap-8">
        {branches.map((branch) => (
          <article
            key={branch.name}
            className="w-full max-w-[450px] bg-[#111] rounded-3xl overflow-hidden shadow-xl border border-[#222]"
          >
            {/* MAPA */}
            <div className="w-full h-52">
              <iframe
                title={branch.name}
                src={branch.map}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* INFO */}
            <div className="p-5">
              <span className="text-sm text-orange-400 font-semibold uppercase">
                {branch.zone}
              </span>

              <h3 className="text-2xl font-bold mt-2 mb-3 text-white">
                {branch.name}
              </h3>

              <p className="text-gray-300 leading-relaxed mb-5">
                {branch.address}
                <br />
                Todos los días 12:00 a 00:00
              </p>

              {/* BOTONES */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outline"
                  href={branch.googleMaps}
                >
                  Cómo llegar
                </Button>

                <Button
                  href="#pedidos"
                  onClick={() =>
                    trackEvent(`click_pedir_${branch.name}`)
                  }
                >
                  Pedir
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}