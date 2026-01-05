import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import brandImg from "../resources/Hail_07-01_.png";

const navItems = [
  { href: "/oracle", label: "Oracle", id: "oracle" },
  { href: "/tales", label: "Tales", id: "tales" },
];

export default function NavBar() {
  const pathname = usePathname();
  // normalize imported image (Next can return an object with `src`)
  const brandSrc = typeof brandImg === 'string' ? brandImg : (brandImg as any)?.src;
  return (
    <nav className="app-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <Link href="/" legacyBehavior>
            <a className="brand-link" aria-label="Home">
              {brandSrc ? (
                <img src={brandSrc} alt="Hale" className="brand-image" />
              ) : (
                <div className="brand-fallback">🏰</div>
              )}
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

        {/* nav-actions removed: only Oracle and Tales remain */}
      </div>
    </nav>
  );
}