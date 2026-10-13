export default function Button({ children, variant = "primary", href = "#", onClick }) {
  return (
    <a className={`btn btn-${variant}`} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
