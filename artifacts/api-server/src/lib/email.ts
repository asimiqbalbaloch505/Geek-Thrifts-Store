import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "kashifishangi123@gmail.com";
const STORE_EMAIL = process.env.GMAIL_USER ?? "geekthriftsstore@gmail.com";

function formatStatus(status: string) {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    delivered: "Delivered",
  };
  return map[status] ?? status;
}

function formatPKR(amount: number) {
  return `PKR ${new Intl.NumberFormat("en-US").format(amount)}`;
}

function orderItemsHtml(items: Array<{ productName: string; quantity: number; size: string; price: number }>) {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.size}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatPKR(item.price)}</td>
        </tr>`
    )
    .join("");
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;max-width:600px;">
        <tr>
          <td style="background:#0a0a0a;padding:24px 32px;">
            <h1 style="margin:0;color:#faf8f5;font-size:22px;letter-spacing:0.1em;text-transform:uppercase;font-family:Georgia,serif;">GeekThrifts</h1>
            <p style="margin:4px 0 0;color:#999;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">Premium Thrift Fashion</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 24px;font-size:20px;color:#0a0a0a;font-family:Georgia,serif;">${title}</h2>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f8f8f8;padding:20px 32px;border-top:1px solid #e0e0e0;">
            <p style="margin:0;font-size:11px;color:#999;font-family:Arial,sans-serif;text-align:center;">
              GeekThrifts &mdash; Cash on Delivery &mdash; Pakistan<br>
              <a href="https://www.instagram.com/geek.thrifts" style="color:#999;">@geek.thrifts</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

interface OrderData {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  totalAmount: number;
  status: string;
  items: Array<{ productName: string; quantity: number; size: string; price: number }>;
}

export async function sendOrderConfirmationEmails(order: OrderData) {
  const orderRef = `#${order.id.toString().padStart(6, "0")}`;

  const customerBody = `
    <p style="color:#444;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;">
      Thank you for your order, <strong>${order.customerName}</strong>! We have received your order and our team will call you within 24 hours to confirm delivery.
    </p>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Order Reference</p>
      <p style="margin:0;font-size:24px;font-weight:bold;color:#0a0a0a;font-family:Georgia,serif;">${orderRef}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e0e0e0;">
      <thead>
        <tr style="background:#0a0a0a;">
          <th style="padding:8px 12px;text-align:left;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Item</th>
          <th style="padding:8px 12px;text-align:center;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Size</th>
          <th style="padding:8px 12px;text-align:center;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Qty</th>
          <th style="padding:8px 12px;text-align:right;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Price</th>
        </tr>
      </thead>
      <tbody>${orderItemsHtml(order.items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-family:Arial,sans-serif;font-size:13px;">Total (COD)</td>
          <td style="padding:12px;text-align:right;font-weight:bold;font-family:Georgia,serif;font-size:15px;">${formatPKR(order.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Delivery Details</p>
      <p style="margin:0;font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;">
        ${order.customerAddress}, ${order.customerCity}<br>
        Phone: ${order.customerPhone}
      </p>
    </div>
    <p style="color:#666;font-size:13px;font-family:Arial,sans-serif;line-height:1.6;margin-top:20px;">
      Payment is <strong>Cash on Delivery</strong>. You will be contacted shortly to confirm your order.
    </p>
  `;

  const adminBody = `
    <p style="color:#444;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;">
      A new order has been placed on GeekThrifts.
    </p>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Order Reference</p>
      <p style="margin:0;font-size:24px;font-weight:bold;color:#0a0a0a;font-family:Georgia,serif;">${orderRef}</p>
    </div>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Customer</p>
      <p style="margin:0;font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;">
        <strong>${order.customerName}</strong><br>
        Phone: ${order.customerPhone}<br>
        ${order.customerEmail ? `Email: ${order.customerEmail}<br>` : ""}
        Address: ${order.customerAddress}, ${order.customerCity}
      </p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e0e0e0;">
      <thead>
        <tr style="background:#0a0a0a;">
          <th style="padding:8px 12px;text-align:left;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Item</th>
          <th style="padding:8px 12px;text-align:center;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Size</th>
          <th style="padding:8px 12px;text-align:center;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Qty</th>
          <th style="padding:8px 12px;text-align:right;color:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Price</th>
        </tr>
      </thead>
      <tbody>${orderItemsHtml(order.items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-family:Arial,sans-serif;font-size:13px;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:bold;font-family:Georgia,serif;font-size:15px;">${formatPKR(order.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const promises: Promise<unknown>[] = [];

  if (order.customerEmail) {
    promises.push(
      transporter.sendMail({
        from: `"GeekThrifts" <${STORE_EMAIL}>`,
        to: order.customerEmail,
        subject: `Order Confirmed ${orderRef} — GeekThrifts`,
        html: baseTemplate("Your Order is Confirmed", customerBody),
      })
    );
  }

  promises.push(
    transporter.sendMail({
      from: `"GeekThrifts" <${STORE_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Order ${orderRef} — ${order.customerName}`,
      html: baseTemplate(`New Order: ${orderRef}`, adminBody),
    })
  );

  await Promise.allSettled(promises);
}

export async function sendStatusUpdateEmails(order: OrderData) {
  const orderRef = `#${order.id.toString().padStart(6, "0")}`;
  const statusLabel = formatStatus(order.status);

  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared for dispatch. Our team will contact you before delivery.",
    delivered: "Your order has been delivered. Thank you for shopping with GeekThrifts! We hope you love your purchase.",
    cancelled: "Your order has been cancelled. If you have any questions, please contact us via Instagram @geek.thrifts or email geekthriftsstore@gmail.com.",
    pending: "Your order status has been updated to Pending.",
  };

  const statusColor: Record<string, string> = {
    confirmed: "#1a7f37",
    delivered: "#0a0a0a",
    cancelled: "#cf222e",
    pending: "#9a6700",
  };

  const color = statusColor[order.status] ?? "#0a0a0a";
  const message = statusMessages[order.status] ?? `Your order status is now: ${statusLabel}`;

  const customerBody = `
    <p style="color:#444;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;">Hello <strong>${order.customerName}</strong>,</p>
    <p style="color:#444;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;">Your order status has been updated.</p>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Order Reference</p>
      <p style="margin:0;font-size:24px;font-weight:bold;color:#0a0a0a;font-family:Georgia,serif;">${orderRef}</p>
    </div>
    <div style="background:${color}14;border:2px solid ${color};padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">Status</p>
      <p style="margin:0;font-size:22px;font-weight:bold;color:${color};font-family:Georgia,serif;">${statusLabel}</p>
    </div>
    <p style="color:#666;font-size:13px;font-family:Arial,sans-serif;line-height:1.6;">${message}</p>
  `;

  const adminBody = `
    <p style="color:#444;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;">Order ${orderRef} status was updated.</p>
    <div style="background:${color}14;border:2px solid ${color};padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.15em;font-family:Arial,sans-serif;">New Status</p>
      <p style="margin:0;font-size:22px;font-weight:bold;color:${color};font-family:Georgia,serif;">${statusLabel}</p>
    </div>
    <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;">
        <strong>${order.customerName}</strong> &mdash; ${order.customerPhone}<br>
        ${order.customerAddress}, ${order.customerCity}
      </p>
    </div>
  `;

  const promises: Promise<unknown>[] = [];

  if (order.customerEmail) {
    promises.push(
      transporter.sendMail({
        from: `"GeekThrifts" <${STORE_EMAIL}>`,
        to: order.customerEmail,
        subject: `Order ${orderRef} is ${statusLabel} — GeekThrifts`,
        html: baseTemplate(`Order Status: ${statusLabel}`, customerBody),
      })
    );
  }

  promises.push(
    transporter.sendMail({
      from: `"GeekThrifts" <${STORE_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Order ${orderRef} → ${statusLabel}`,
      html: baseTemplate(`Order Updated: ${orderRef}`, adminBody),
    })
  );

  await Promise.allSettled(promises);
}
