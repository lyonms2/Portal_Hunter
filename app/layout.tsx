export const metadata = {
  title: "Portal Hunter: Awakening",
  description: "Bem-vindo, caçador de portais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "2rem" }}>
        {children}
      </body>
    </html>
  );
}
