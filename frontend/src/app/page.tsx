"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Client-side replace to /tales to avoid a blank page while ensuring navigation
    router.replace("/tales");
  }, [router]);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans, sans-serif)",
      color: "var(--text-light, #222)"
    }}>
      <div>
        <div style={{ fontSize: 24, marginBottom: 8 }}>Redirecting to Tales...</div>
        <div style={{ opacity: 0.7 }}>If you are not redirected automatically, <a href="/tales">click here</a>.</div>
      </div>
    </div>
  );
}