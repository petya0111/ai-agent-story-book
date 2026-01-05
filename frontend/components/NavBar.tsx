import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/", label: "Home", id: "home" },
  { href: "/chronicles", label: "Chronicles", id: "chronicles" },
  { href: "/oracle", label: "Oracle", id: "oracle" },
  { href: "/tales", label: "Tales", id: "tales" },
  { href: "/settings", label: "Settings", id: "settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <Link href="/" legacyBehavior>
            <a className="brand-link" aria-label="Home">
              <img src="/assets/base/base_sillhouette.png" alt="Hale" className="brand-image" />
              <span className="brand-text">Hale: The Last Descendant</span>
            </a>
          </Link>
        </div>

        <div className="nav-items" role="menubar">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.id} href={item.href} legacyBehavior>
                <a
                  role="menuitem"
                  className={`nav-item ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </a>
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          <Link href="/">
            <button
              type="button"
              className="nav-btn"
              title="New quest"
            >
              New Quest
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}