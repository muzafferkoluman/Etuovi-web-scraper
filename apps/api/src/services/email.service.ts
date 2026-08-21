import nodemailer from "nodemailer";
import { Property } from "@koti-scout/shared";

export interface EmailSendResult {
  success: boolean;
  mode: "resend" | "smtp" | "simulation";
  messageId?: string;
  recipient: string;
  previewUrl?: string;
  error?: string;
}

export class EmailDispatcherService {
  private resendApiKey?: string;
  private defaultRecipient: string;
  private senderEmail: string;
  private smtpTransporter?: nodemailer.Transporter;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY;
    this.defaultRecipient = process.env.NOTIFICATION_EMAIL_TO || "lina@kotiscout.fi";
    this.senderEmail = process.env.NOTIFICATION_EMAIL_FROM || "KotiScout Radar <radar@kotiscout.fi>";

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.smtpTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    }
  }

  public async sendEmail(to: string, subject: string, html: string): Promise<EmailSendResult> {
    const recipient = to || this.defaultRecipient;

    if (this.resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: this.senderEmail,
            to: [recipient],
            subject,
            html
          })
        });

        const data = (await response.json()) as any;
        if (response.ok) {
          console.log(`[EmailService - Resend] Sent alert to ${recipient} (ID: ${data.id})`);
          return { success: true, mode: "resend", messageId: data.id, recipient };
        } else {
          console.warn("[EmailService - Resend Error]:", data);
        }
      } catch (err: any) {
        console.warn(`[EmailService - Resend Exception]: ${err.message}`);
      }
    }

    if (this.smtpTransporter) {
      try {
        const info = await this.smtpTransporter.sendMail({
          from: this.senderEmail,
          to: recipient,
          subject,
          html
        });
        console.log(`[EmailService - SMTP] Sent alert to ${recipient} (ID: ${info.messageId})`);
        return { success: true, mode: "smtp", messageId: info.messageId, recipient };
      } catch (err: any) {
        console.warn(`[EmailService - SMTP Error]: ${err.message}`);
      }
    }

    console.log(`
================================================================================
[EmailService - Simulation Mode]
TO:      ${recipient}
FROM:    ${this.senderEmail}
SUBJECT: ${subject}
STATUS:  Delivered (Simulation / Development Mode)
================================================================================
`);
    return {
      success: true,
      mode: "simulation",
      recipient,
      messageId: `sim-${Date.now()}`
    };
  }

  public async sendPropertyAlert(
    property: Property,
    alertType: "GREAT_MATCH" | "PRICE_DROP" | "NEW",
    recipient?: string
  ): Promise<EmailSendResult> {
    const isPriceDrop = alertType === "PRICE_DROP";
    const isGreatMatch = alertType === "GREAT_MATCH";

    const subject = isPriceDrop
      ? `Price Drop Alert: ${property.address}, ${property.district || property.city} (${property.price.toLocaleString("fi-FI")} EUR)`
      : isGreatMatch
      ? `High Match (${property.score}/100): ${property.address}, ${property.district || property.city}`
      : `New Property Listing: ${property.address}, ${property.city}`;

    const feeStr = property.maintenanceFee ? `${property.maintenanceFee} EUR/mo` : "N/A";
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background: #0b0f17; color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
    <div style="background: #064e3b; padding: 20px;">
      <h2 style="color: #34d399; margin: 0;">KotiScout Radar for Lina</h2>
      <div style="display: inline-block; background: #10b981; color: #022c22; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-top: 6px;">${alertType}</div>
    </div>
    <div style="padding: 24px;">
      <div style="font-size: 26px; font-weight: 800; color: #ffffff;">${property.price.toLocaleString("fi-FI")} EUR</div>
      <h3 style="color: #ffffff; margin-top: 8px; margin-bottom: 4px;">${property.address} (${property.city})</h3>
      <p style="color: #94a3b8; margin-top: 0;">${property.title}</p>
      <div style="background: #1e293b; padding: 12px; border-radius: 8px; font-size: 13px; color: #cbd5e1; margin-top: 12px;">
        Pinta-ala: <b>${property.area} m2</b> | Huoneet: <b>${property.rooms}h</b> | Aidat: <b>${feeStr}</b>
      </div>
      <a href="${property.sourceUrl}" style="display: inline-block; background: #10b981; color: #022c22; padding: 12px 20px; font-weight: bold; border-radius: 8px; text-decoration: none; margin-top: 16px;">Avaa ilmoitus Etuovessa -></a>
    </div>
  </div>
</body>
</html>
`;

    return this.sendEmail(recipient || this.defaultRecipient, subject, html);
  }

  public async sendTestEmail(recipient?: string): Promise<EmailSendResult> {
    const target = recipient || this.defaultRecipient;
    const testProp: Property = {
      id: "test-prop-01",
      externalId: "80524411",
      provider: "EtuoviLivePropertyProvider",
      sourceUrl: "https://www.etuovi.com/myytavat-asunnot/helsinki",
      title: "Valoisa ja remontoitu koti keskeisellä sijainnilla Karhupuiston kupeessa",
      description: "Kaunis kaksio loistavalla sijainnilla Karhupuiston kupeessa.",
      address: "Fleminginkatu 12 B",
      postalCode: "00530",
      city: "Helsinki",
      district: "Kallio",
      latitude: 60.1865,
      longitude: 24.9521,
      price: 219000,
      area: 48.5,
      pricePerSquareMeter: 4515,
      rooms: 2,
      bedrooms: 1,
      propertyType: "Apartment",
      buildYear: 1938,
      maintenanceFee: 210,
      floor: 3,
      totalFloors: 5,
      hasBalcony: true,
      hasSauna: false,
      hasElevator: true,
      energyClass: "C2018",
      thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      imageUrls: [],
      publishedAt: new Date().toISOString(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      active: true,
      score: 94,
      dealIndicator: {
        isDeal: true,
        districtMedianSqmPrice: 5800,
        discountPercentage: -14.2,
        label: "14.2% below Kallio asking median"
      }
    };

    return this.sendPropertyAlert(testProp, "GREAT_MATCH", target);
  }
}

export const emailDispatcher = new EmailDispatcherService();
