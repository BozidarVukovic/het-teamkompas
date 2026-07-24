import KompasDot from "../shared/KompasDot";

export function PageShell({ children, tone = "light" }) {
  return <main className="tk-page" data-tone={tone}>{children}</main>;
}

export function Section({ children, className = "", style, id }) {
  return <section id={id} className={`tk-section ${className}`.trim()} style={style}><div className="tk-container">{children}</div></section>;
}

export function Eyebrow({ children, withDot = false }) {
  return <div className="tk-eyebrow">{withDot && <KompasDot size={22} />}{children}</div>;
}

export function ButtonLink({ children, href, variant = "primary", onClick }) {
  return <a href={href} onClick={onClick} className={`tk-button tk-button-${variant}`}>{children}</a>;
}

export function Card({ children, accent }) {
  return <article className="tk-card" style={accent ? { "--tk-accent": accent } : undefined}>{children}</article>;
}

export function Field({ as: Component = "input", ...props }) {
  return <Component className="tk-input" {...props} />;
}
