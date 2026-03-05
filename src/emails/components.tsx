import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', margin: 0, padding: 0 }}>
        {preview && <Text style={{ display: "none" }}>{preview}</Text>}
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          {children}
        </Container>
        <Container style={{ textAlign: "center" as const, margin: "20px auto", maxWidth: "560px" }}>
          <Text style={{ color: "#8898aa", fontSize: "12px" }}>
            OpenBoil Inc. · 123 SaaS Street · San Francisco, CA 94105
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: "#6366f1",
        borderRadius: "6px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "block",
        padding: "12px 24px",
        margin: "24px 0",
      }}
    >
      {children}
    </Button>
  );
}

export function EmailFooter() {
  return (
    <>
      <Hr style={{ borderColor: "#e6ebf1", margin: "24px 0" }} />
      <Text style={{ color: "#8898aa", fontSize: "13px", lineHeight: "20px" }}>
        If you didn't request this email, you can safely ignore it.
      </Text>
    </>
  );
}
