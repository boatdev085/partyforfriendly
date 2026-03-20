import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import GlobalStyle from "@/styles/GlobalStyle";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PartyForFriendly",
  description: "Find your gaming party and play together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <Navbar />
          {children}
          <Footer />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
