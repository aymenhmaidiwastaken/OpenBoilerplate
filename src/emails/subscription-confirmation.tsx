import { Text, Heading } from "@react-email/components";
import { EmailLayout, EmailButton, EmailFooter } from "./components";

interface SubscriptionConfirmationProps {
  planName?: string;
  dashboardUrl?: string;
}

export default function SubscriptionConfirmationEmail({
  planName = "Pro",
  dashboardUrl = "https://app.openboil.com/dashboard/billing",
}: SubscriptionConfirmationProps) {
  return (
    <EmailLayout preview={`You're now on the ${planName} plan!`}>
      <Heading style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 16px" }}>
        Subscription confirmed!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#4a5568", lineHeight: "24px" }}>
        You've successfully subscribed to the <strong>{planName}</strong> plan. Your new features and credits are now available.
      </Text>
      <EmailButton href={dashboardUrl}>View Your Plan</EmailButton>
      <Text style={{ fontSize: "14px", color: "#8898aa", lineHeight: "20px" }}>
        You can manage your subscription anytime from the billing settings in your dashboard.
      </Text>
      <EmailFooter />
    </EmailLayout>
  );
}
