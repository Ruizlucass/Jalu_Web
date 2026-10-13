import { whatsappBase } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";
import { FaWhatsapp } from "react-icons/fa";

export default function WspFlotante() {
  return (
    <a
      className="whatsapp-float"
      href={whatsappBase}
      aria-label="WhatsApp"
      onClick={() => trackEvent("click_whatsapp_float")}
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}
