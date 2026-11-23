import { MobileShell } from "@/components/mobile-shell";
import { ContactPageClient } from "@/components/contact-page-client";
import { getActiveContacts } from "@/lib/db";

export default async function ContactPage() {
  const contacts = await getActiveContacts();

  return (
    <MobileShell>
      <ContactPageClient contacts={contacts} />
    </MobileShell>
  );
}