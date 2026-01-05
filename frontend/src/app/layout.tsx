import React from "react";
import "../../styles/globals.scss";
import ResponsiveSizesSetter from "../components/ResponsiveSizesSetter";

export const metadata = {
  title: "Hale: The Last Descendant",
  description: "An interactive story experience exploring Hale's world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
        <ResponsiveSizesSetter />
        {children}
      </body>
    </html>
  );
}