/* Mutual UI kit — shared primitives.
   Exposed on window for the other babel scripts. */
const { useState, useEffect, useRef } = React;

// Lucide icon wrapper — renders an <i data-lucide> then hydrates it.
function Icon({ name, size = 20, stroke = 1.75, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = `<i data-lucide="${name}"></i>`;
      window.lucide.createIcons({
        attrs: { 'stroke-width': stroke, width: size, height: size },
        nameAttr: 'data-lucide',
      });
    }
  }, [name, size, stroke]);
  return <span ref={ref} className="icon" style={{ display: 'inline-flex', color: color || 'currentColor' }} />;
}

function Button({ variant = 'primary', children, icon, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

function IconButton({ icon, onClick, label }) {
  return (
    <button className="iconbtn" onClick={onClick} aria-label={label}>
      <Icon name={icon} size={20} />
    </button>
  );
}

function Avatar({ who = 'you', initial, size = 38 }) {
  return (
    <span className={`avatar ${who}`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initial}
    </span>
  );
}

function PairAvatars({ you = 'J', them = 'A', size = 34 }) {
  return (
    <span className="pair">
      <Avatar who="you" initial={you} size={size} />
      <Avatar who="them" initial={them} size={size} />
    </span>
  );
}

function Badge({ kind = 'new', children }) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

function Chip({ active, children, onClick }) {
  return <button className={`chip ${active ? 'on' : ''}`} onClick={onClick}>{children}</button>;
}

Object.assign(window, { Icon, Button, IconButton, Avatar, PairAvatars, Badge, Chip });
