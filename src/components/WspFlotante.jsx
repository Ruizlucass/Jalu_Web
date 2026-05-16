import { whatsappBase } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export default function WspFlotante() {
  return (
    <a
      className="whatsapp-float"
      href={whatsappBase}
      aria-label="WhatsApp"
      onClick={() => trackEvent("click_whatsapp_float")}
    >
      W
    </a>
  );
}
