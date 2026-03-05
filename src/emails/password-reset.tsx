import { Text, Heading } from "@react-email/components";
import { EmailLayout, EmailButton, EmailFooter } from "./components";

interface PasswordResetEmailProps {
  resetUrl?: string;
}

export default function PasswordResetEmail({ resetUrl = "https://app.openboil.com/auth/reset" }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 16px" }}>
        Reset your password
      </Heading>
      <Text style={{ fontSize: "16px", color: "#4a5568", lineHeight: "24px" }}>
        We received a request to reset your password. Click the button below to choose a new one.
      </Text>
      <EmailButton href={resetUrl}>Reset Password</EmailButton>
      <Text style={{ fontSize: "14px", color: "#8898aa", lineHeight: "20px" }}>
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </Text>
      <EmailFooter />
    </EmailLayout>
  );
}
