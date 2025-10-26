import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const navItems = [
  { href: "/", label: "Chat", id: "chat" },
  { href: "/library", label: "Library", id: "library" },
  { href: "/versions", label: "Versions", id: "versions" },
  { href: "/settings", label: "Settings", id: "settings" },
];

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="app-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <Link href="/" legacyBehavior>
            <a className="brand-link" aria-label="Home">
              <span className="brand-logo" aria-hidden>
                📚
              </span>
              <span className="brand-text">Book Agent</span>
            </a>
          </Link>
        </div>

        <div className="nav-items" role="menubar">
          {navItems.map((item) => {
            const active = router.pathname === item.href;
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
          <button
            type="button"
            className="nav-btn"
            title="New conversation"
            onClick={() => {
              router.push("/");
            }}
          >
            New
          </button>
        </div>
      </div>
    </nav>
  );
}