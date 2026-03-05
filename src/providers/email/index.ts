import type { EmailProvider } from "./types";

let _instance: EmailProvider | null = null;

export async function getEmailProvider(): Promise<EmailProvider> {
  if (_instance) return _instance;

  const { ResendEmailProvider } = await import("./resend");
  _instance = new ResendEmailProvider();
  return _instance;
}

export type { EmailProvider, EmailOptions } from "./types";
