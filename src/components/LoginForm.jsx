import Button from "./Button.jsx";

export default function LoginForm() {
  return (
    <form className="form-grid">
      <input className="field" type="email" placeholder="Email" />
      <input className="field" type="password" placeholder="Contraseña" />
      <Button href="#">Ingresar</Button>
    </form>
  );
}
