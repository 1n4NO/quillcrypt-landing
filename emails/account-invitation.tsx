import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type AccountInvitationEmailProps = {
  accountName: string;
  inviterName: string;
  invitationUrl: string;
  role: "admin" | "member";
  expiresAt: string;
};

export function AccountInvitationEmail({
  accountName,
  inviterName,
  invitationUrl,
  role,
  expiresAt,
}: AccountInvitationEmailProps) {
  const expiry = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(expiresAt));

  return (
    <Html lang="en">
      <Head />
      <Preview>{inviterName} invited you to {accountName} on Quillcrypt</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={wordmark}>quill<span style={accent}>crypt</span></Text>
          <Heading style={heading}>Join a shared margin.</Heading>
          <Text style={copy}>
            {inviterName} invited you to <strong>{accountName}</strong> as a {role}.
          </Text>
          <Section style={buttonSection}>
            <Button href={invitationUrl} style={button}>Accept invitation</Button>
          </Section>
          <Text style={finePrint}>Sign in with this email address. The invitation expires {expiry} UTC.</Text>
          <Hr style={rule} />
          <Text style={privacy}>
            Quillcrypt account metadata is separate from encrypted annotations and workspace keys.
            If you were not expecting this invitation, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AccountInvitationEmail;

const body = { backgroundColor: "#f2eee6", color: "#17211f", fontFamily: "Arial, sans-serif", margin: 0 };
const container = { backgroundColor: "#fffdf8", border: "1px solid #d8d0c2", margin: "36px auto", maxWidth: "560px", padding: "42px" };
const wordmark = { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.04em", margin: "0 0 46px" };
const accent = { color: "#a47824" };
const heading = { fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: "400", letterSpacing: "-0.04em", lineHeight: "1.08", margin: "0 0 22px" };
const copy = { fontSize: "17px", lineHeight: "1.65", margin: "0 0 28px" };
const buttonSection = { margin: "32px 0" };
const button = { backgroundColor: "#17211f", borderRadius: "2px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "14px 22px", textDecoration: "none" };
const finePrint = { color: "#5e6561", fontSize: "13px", lineHeight: "1.6" };
const rule = { borderColor: "#d8d0c2", margin: "34px 0 24px" };
const privacy = { color: "#777d79", fontSize: "12px", lineHeight: "1.6" };
