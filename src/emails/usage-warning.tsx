import { Text, Heading, Section } from "@react-email/components";
import { EmailLayout, EmailButton, EmailFooter } from "./components";

interface UsageWarningProps {
  currentUsage?: number;
  limit?: number;
  upgradeUrl?: string;
}

export default function UsageWarningEmail({
  currentUsage = 4500,
  limit = 5000,
  upgradeUrl = "https://app.openboil.com/pricing",
}: UsageWarningProps) {
  const percentage = Math.round((currentUsage / limit) * 100);
  const barColor = percentage >= 90 ? "#ef4444" : "#f59e0b";

  return (
    <EmailLayout preview={`You've used ${percentage}% of your credits`}>
      <Heading style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 16px" }}>
        Credit usage warning
      </Heading>
      <Text style={{ fontSize: "16px", color: "#4a5568", lineHeight: "24px" }}>
        You've used <strong>{percentage}%</strong> of your monthly credits ({currentUsage.toLocaleString()} / {limit.toLocaleString()}).
      </Text>
      <Section style={{ margin: "16px 0" }}>
        <div style={{ backgroundColor: "#e5e7eb", borderRadius: "8px", height: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: barColor, width: `${percentage}%`, height: "12px", borderRadius: "8px" }} />
        </div>
      </Section>
      <Text style={{ fontSize: "14px", color: "#4a5568", lineHeight: "22px" }}>
        To avoid running out of credits, consider upgrading your plan for more capacity.
      </Text>
      <EmailButton href={upgradeUrl}>Upgrade Plan</EmailButton>
      <EmailFooter />
    </EmailLayout>
  );
}
