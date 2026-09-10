import "./globals.css";

export const metadata = {
  title: "NextStep — Upload it. Know what to do.",
  description: "Turn confusing paperwork into a plain-English explanation and clear next steps."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
