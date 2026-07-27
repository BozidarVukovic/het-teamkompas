import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KompasDot from "./KompasDot";
import { knowledgeNavigation, serviceLinks } from "./navigationData";

const NAVY = "#0D1B2A";

function isStaticPage(path) {
  return path === "/sprekers" || path.startsWith("/sprekers/");
}

function NavLink({ item, onNavigate, className = "" }) {
  const { pathname } = useLocation();
  const active = pathname === item.href || (item.href === "/inspiratie" && pathname.startsWith("/blog/"));
  return (
    <a className={className} href={item.href} aria-current={active ? "page" : undefined} onClick={(event) => {
      event.preventDefault();
      onNavigate(item.href);
    }}>{item.label}</a>
  );
}

function SimpleDropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
      } else if (event.type === "pointerdown" && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, []);

  return <div className="site-nav__dropdown" ref={rootRef}>
    <button className="site-nav__trigger" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{label}<span aria-hidden="true">⌄</span></button>
    {open && <div className="site-nav__small-menu" id={id}>{items.map((item) => <NavLink key={item.href} item={item} onNavigate={(path) => { setOpen(false); onNavigate(path); }} />)}</div>}
  </div>;
}

function KnowledgeMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const closeTimer = useRef();
  const id = useId();

  const show = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const hide = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpen(false), 260); };

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
      } else if (event.type === "pointerdown" && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => { clearTimeout(closeTimer.current); document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); };
  }, [open]);

  const go = (path) => { setOpen(false); onNavigate(path); };
  return <div className="site-nav__dropdown site-nav__knowledge" ref={rootRef} onMouseEnter={show} onMouseLeave={hide}>
    <button className="site-nav__trigger" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} onFocus={show}>Kennis <span aria-hidden="true">⌄</span></button>
    {open && <section className="knowledge-menu" id={id} aria-label="Kennis">
      <div className="knowledge-menu__featured">
        <p className="knowledge-menu__eyebrow">Hoofdthema’s</p>
        <NavLink item={knowledgeNavigation.overview} onNavigate={go} className="knowledge-menu__overview" />
        {knowledgeNavigation.featured.map((item) => <NavLink key={item.href} item={item} onNavigate={go} />)}
      </div>
      <div className="knowledge-menu__groups">
        {knowledgeNavigation.groups.map((group) => <div key={group.label} className="knowledge-menu__group">
          <h2>{group.label}</h2>
          {group.links.map((item) => <NavLink key={item.href} item={item} onNavigate={go} />)}
        </div>)}
      </div>
      <NavLink item={{ label: "Naar alle artikelen en blogs →", href: "/inspiratie" }} onNavigate={go} className="knowledge-menu__all" />
    </section>}
  </div>;
}

function MobileKnowledge({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const id = useId();
  return <div className="mobile-nav__section">
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>Kennis <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    {open && <div id={id} className="mobile-nav__knowledge">
      <NavLink item={knowledgeNavigation.overview} onNavigate={onNavigate} className="mobile-nav__overview" />
      <p>Hoofdthema’s</p>
      {knowledgeNavigation.featured.map((item) => <NavLink key={item.href} item={item} onNavigate={onNavigate} />)}
      {knowledgeNavigation.groups.map((group, index) => {
        const groupId = `${id}-group-${index}`;
        const groupOpen = Boolean(openGroups[index]);
        return <div className="mobile-nav__group" key={group.label}>
          <button type="button" aria-expanded={groupOpen} aria-controls={groupId} onClick={() => setOpenGroups((current) => ({ ...current, [index]: !current[index] }))}>{group.label}<span aria-hidden="true">{groupOpen ? "−" : "+"}</span></button>
          {groupOpen && <div id={groupId}>{group.links.map((item) => <NavLink key={item.href} item={item} onNavigate={onNavigate} />)}</div>}
        </div>;
      })}
      <NavLink item={{ label: "Naar alle artikelen en blogs →", href: "/inspiratie" }} onNavigate={onNavigate} className="mobile-nav__all" />
    </div>}
  </div>;
}

export default function OrganizedNavigation() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 960);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileMenuRef.current?.querySelector("a, button")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [menuOpen]);

  const go = (path) => {
    setMenuOpen(false);
    if (isStaticPage(path)) window.location.assign(path); else navigate(path);
  };
  const goAnker = (event, path) => { event.preventDefault(); setMenuOpen(false); navigate(path); };

  return <>
    <header className="site-header">
      <nav className="site-nav" aria-label="Hoofdnavigatie">
        <a href="/" onClick={(event) => { event.preventDefault(); go("/"); }} className="site-nav__brand"><KompasDot size={22} />Mijn Teamkompas</a>
        {mobile ? <div className="site-nav__mobile-actions">
          <a href="/verkennen" onClick={(event) => { event.preventDefault(); go("/verkennen"); }} className="site-nav__cta site-nav__cta--small">Vrijblijvend kennismaken</a>
          <button ref={menuButtonRef} type="button" className="site-nav__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-main-menu" aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}>{menuOpen ? "✕" : "☰"}</button>
        </div> : <div className="site-nav__links">
          <SimpleDropdown label="Diensten" items={serviceLinks} onNavigate={go} />
          <a href="/onze-aanpak" onClick={(e) => { e.preventDefault(); go("/onze-aanpak"); }}>Onze aanpak</a>
          <KnowledgeMenu onNavigate={go} />
          <NavLink item={{ label: "Inspiratie", href: "/inspiratie" }} onNavigate={go} />
          <a href="/#over-ons" onClick={(e) => goAnker(e, "/#over-ons")}>Over ons</a>
          <a href="/verkennen" onClick={(e) => { e.preventDefault(); go("/verkennen"); }} className="site-nav__cta">Plan vrijblijvend gesprek</a>
          <a href="/beheer" onClick={(e) => { e.preventDefault(); go("/beheer"); }} className="site-nav__login">Inloggen</a>
        </div>}
      </nav>
    </header>
    {mobile && menuOpen && <div className="mobile-nav" id="mobile-main-menu" ref={mobileMenuRef}>
      <div className="mobile-nav__section"><SimpleDropdown label="Diensten" items={serviceLinks} onNavigate={go} /></div>
      <a href="/onze-aanpak" onClick={(e) => { e.preventDefault(); go("/onze-aanpak"); }}>Onze aanpak</a>
      <MobileKnowledge onNavigate={go} />
      <NavLink item={{ label: "Inspiratie", href: "/inspiratie" }} onNavigate={go} />
      <a href="/#over-ons" onClick={(e) => goAnker(e, "/#over-ons")}>Over ons</a>
      <a href="/verkennen" onClick={(e) => { e.preventDefault(); go("/verkennen"); }} className="mobile-nav__cta">Plan vrijblijvend gesprek</a>
      <a href="/beheer" onClick={(e) => { e.preventDefault(); go("/beheer"); }} className="mobile-nav__login">Inloggen →</a>
    </div>}
  </>;
}
