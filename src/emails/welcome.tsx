import { Text, Heading } from "@react-email/components";
import { EmailLayout, EmailButton, EmailFooter } from "./components";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
}

export default function WelcomeEmail({ name = "there", dashboardUrl = "https://app.openboil.com/dashboard" }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to OpenBoil, ${name}!`}>
      <Heading style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 16px" }}>
        Welcome to OpenBoil!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#4a5568", lineHeight: "24px" }}>
        Hi {name},
      </Text>
      <Text style={{ fontSize: "16px", color: "#4a5568", lineHeight: "24px" }}>
        Thanks for signing up! Your account is all set up and ready to go. Here's what you can do next:
      </Text>
      <Text style={{ fontSize: "14px", color: "#4a5568", lineHeight: "22px", margin: "8px 0" }}>
        • Generate AI content with our built-in tools{"\n"}
        • Set up your subscription plan{"\n"}
        • Explore the dashboard
      </Text>
      <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      <EmailFooter />
    </EmailLayout>
  );
}
