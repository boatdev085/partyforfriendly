import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import GlobalStyle from "@/styles/GlobalStyle";
import LayoutShell from "@/components/layout/LayoutShell";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import dynamic from "next/dynamic";

const DevUserSwitcher = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@/components/dev/DevUserSwitcher'), { ssr: false })
  : null;

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
          <SessionProviderWrapper>
            <GlobalStyle />
            <LayoutShell>
              {children}
              <Footer />
            </LayoutShell>
            {DevUserSwitcher && <DevUserSwitcher />}
          </SessionProviderWrapper>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
