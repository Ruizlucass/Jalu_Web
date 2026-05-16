import Button from "./Button.jsx";

export default function RegisterForm() {
  return (
    <form className="form-grid">
      <input className="field" placeholder="Nombre" />
      <input className="field" type="email" placeholder="Email" />
      <input className="field" placeholder="WhatsApp" />
      <Button href="#">Crear cuenta</Button>
    </form>
  );
}
