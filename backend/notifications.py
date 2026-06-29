# -*- coding: utf-8 -*-
"""Email (SMTP) + WhatsApp (Twilio Business API) notifications.

Everything is gated on configuration: if the relevant env vars aren't set,
the send functions no-op and log a warning instead of raising — so the app
works fine before credentials are added.
"""
import os
import ssl
import smtplib
import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

import httpx
from pathlib import Path
from dotenv import load_dotenv

# Load .env here too, so config is correct regardless of import order in the host app.
load_dotenv(Path(__file__).parent / ".env")

logger = logging.getLogger(__name__)

# --- Email (SMTP) config ---
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM") or SMTP_USER
STORE_NAME = os.getenv("STORE_NAME", "The Aarsha Label")

# --- Email (Mailgun HTTP API) config — used in preference to SMTP when set ---
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
MAILGUN_BASE_URL = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net").rstrip("/")
MAILGUN_FROM = os.getenv("MAILGUN_FROM") or (
    f"{STORE_NAME} <postmaster@{MAILGUN_DOMAIN}>" if MAILGUN_DOMAIN else None
)

# --- WhatsApp (Twilio) config ---
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")  # e.g. "whatsapp:+14155238886"

# --- WhatsApp (AiSensy WhatsApp Business API) config ---
AISENSY_API_KEY = os.getenv("AISENSY_API_KEY")
AISENSY_API_URL = os.getenv("AISENSY_API_URL", "https://backend.aisensy.com/campaign/t1/api/v2")
aisensy_enabled = bool(AISENSY_API_KEY)

smtp_enabled = bool(SMTP_USER and SMTP_PASSWORD)
mailgun_enabled = bool(MAILGUN_API_KEY and MAILGUN_DOMAIN)
email_enabled = smtp_enabled or mailgun_enabled
whatsapp_enabled = bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM)


def format_inr(paise: Optional[int]) -> str:
    if paise is None:
        return "Price on Request"
    rupees = paise / 100
    # Indian-style grouping for whole rupees.
    return "Rs " + f"{rupees:,.0f}"


# ----------------------------- Email -----------------------------
def _send_email_sync(to: List[str], subject: str, html: str, text: str) -> bool:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{STORE_NAME} <{SMTP_FROM}>"
    msg["To"] = ", ".join(to)
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to, msg.as_string())
    return True


async def _send_email_mailgun(recipients, subject, html, text) -> bool:
    url = f"{MAILGUN_BASE_URL}/v3/{MAILGUN_DOMAIN}/messages"
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            url,
            auth=("api", MAILGUN_API_KEY),
            data={
                "from": MAILGUN_FROM,
                "to": ", ".join(recipients),
                "subject": subject,
                "text": text,
                "html": html,
            },
        )
    if resp.status_code >= 400:
        raise RuntimeError(f"Mailgun {resp.status_code}: {resp.text[:300]}")
    return True


async def send_email(to, subject: str, html: str, text: str = "") -> bool:
    recipients = [r for r in ([to] if isinstance(to, str) else list(to)) if r]
    if not recipients:
        return False
    body_text = text or _strip_html(html)
    try:
        if mailgun_enabled:
            await _send_email_mailgun(recipients, subject, html, body_text)
        elif smtp_enabled:
            await asyncio.to_thread(_send_email_sync, recipients, subject, html, body_text)
        else:
            logger.warning("Email not configured — skipping: %s", subject)
            return False
        logger.info("Email sent: '%s' -> %s", subject, recipients)
        return True
    except Exception as e:
        logger.error("Email send failed (%s): %s", subject, e)
        return False


def _strip_html(html: str) -> str:
    import re
    return re.sub(r"<[^>]+>", "", html).strip()


# ----------------------------- WhatsApp (Twilio) -----------------------------
async def send_whatsapp(to_number: str, body: str) -> bool:
    """Send a WhatsApp message via Twilio. `to_number` is a plain phone number
    in international format (e.g. +919876543210)."""
    if not to_number:
        return False
    if not whatsapp_enabled:
        logger.warning("WhatsApp not configured (Twilio env missing) — skipping message to %s", to_number)
        return False
    to = to_number if to_number.startswith("whatsapp:") else f"whatsapp:{to_number}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                data={"From": TWILIO_WHATSAPP_FROM, "To": to, "Body": body},
            )
        if resp.status_code >= 400:
            logger.error("WhatsApp send failed (%s): %s", resp.status_code, resp.text[:300])
            return False
        logger.info("WhatsApp sent -> %s", to_number)
        return True
    except Exception as e:
        logger.error("WhatsApp send error: %s", e)
        return False


async def send_whatsapp_template(campaign_name: str, destination: str, user_name: str, params: list) -> bool:
    """Send an approved WhatsApp template via AiSensy's Campaign API.
    `destination` is a phone number (any format); `params` fill the template {{1}}, {{2}}..."""
    if not aisensy_enabled or not campaign_name or not destination:
        if not aisensy_enabled:
            logger.warning("AiSensy not configured — skipping WhatsApp template '%s'", campaign_name)
        return False
    dest = "".join(ch for ch in str(destination) if ch.isdigit())  # digits incl. country code
    payload = {
        "apiKey": AISENSY_API_KEY,
        "campaignName": campaign_name,
        "destination": dest,
        "userName": user_name or STORE_NAME,
        "templateParams": [str(p) for p in params],
        "source": "theaarshalabel.com",
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(AISENSY_API_URL, json=payload)
        if resp.status_code >= 400:
            logger.error("AiSensy send failed (%s): %s", resp.status_code, resp.text[:300])
            return False
        logger.info("AiSensy WhatsApp sent via '%s' -> %s", campaign_name, dest)
        return True
    except Exception as e:
        logger.error("AiSensy send error: %s", e)
        return False


# ----------------------------- Message builders -----------------------------
def _items_html(order: dict) -> str:
    rows = ""
    for it in order.get("items", []):
        rows += (
            f"<tr><td style='padding:6px 10px;border-bottom:1px solid #eee'>{it.get('name','')}</td>"
            f"<td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:center'>{it.get('quantity',1)}</td>"
            f"<td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>{format_inr(it.get('price'))}</td></tr>"
        )
    return rows


def _items_text(order: dict) -> str:
    return "\n".join(
        f"  - {it.get('quantity',1)}x {it.get('name','')} ({format_inr(it.get('price'))})"
        for it in order.get("items", [])
    )


def _address_text(addr: dict) -> str:
    if not addr:
        return ""
    parts = [addr.get("name"), addr.get("line1"), addr.get("line2"),
             f"{addr.get('city','')}, {addr.get('state','')} {addr.get('postal_code','')}",
             addr.get("country"), f"Phone: {addr.get('phone','')}"]
    return "\n".join(p for p in parts if p and p.strip(", "))


def order_confirmation_for_customer(order: dict):
    oid = order.get("order_id", "")
    total = format_inr(order.get("total"))
    subject = f"Your {STORE_NAME} order is confirmed ({oid})"
    html = f"""
    <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1A1A1A">
      <h2 style="color:#7A1F3D">Thank you for your order!</h2>
      <p>We've received your payment and your order <b>{oid}</b> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead><tr>
          <th style="text-align:left;padding:6px 10px;border-bottom:2px solid #7A1F3D">Item</th>
          <th style="text-align:center;padding:6px 10px;border-bottom:2px solid #7A1F3D">Qty</th>
          <th style="text-align:right;padding:6px 10px;border-bottom:2px solid #7A1F3D">Price</th>
        </tr></thead>
        <tbody>{_items_html(order)}</tbody>
      </table>
      <p style="text-align:right;font-size:18px"><b>Total: {total}</b></p>
      <p style="color:#666">We'll be in touch as your order is prepared.<br/>— {STORE_NAME}</p>
    </div>"""
    text = (f"Thank you for your order!\n\nOrder {oid} is confirmed.\n\n"
            f"{_items_text(order)}\n\nTotal: {total}\n\n— {STORE_NAME}")
    return subject, html, text


def order_alert_for_owner(order: dict):
    oid = order.get("order_id", "")
    total = format_inr(order.get("total"))
    addr = order.get("shipping_address", {}) or {}
    subject = f"New order {oid} — {total}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A1A1A">
      <h2 style="color:#7A1F3D">New order received</h2>
      <p><b>Order:</b> {oid}<br/><b>Customer:</b> {order.get('email','')}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">
        <tbody>{_items_html(order)}</tbody>
      </table>
      <p style="text-align:right;font-size:18px"><b>Total: {total}</b></p>
      <h3>Ship to</h3>
      <pre style="font-family:Arial,sans-serif;white-space:pre-wrap;background:#F5F0E6;padding:12px">{_address_text(addr)}</pre>
    </div>"""
    text = (f"New order received\n\nOrder: {oid}\nCustomer: {order.get('email','')}\n\n"
            f"{_items_text(order)}\n\nTotal: {total}\n\nShip to:\n{_address_text(addr)}")
    return subject, html, text


FULFILLMENT_LABELS = {
    "processing": "Order Confirmed & Processing",
    "dispatched": "Dispatched",
    "in_transit": "In Transit",
    "out_for_delivery": "Out for Delivery",
    "delivered": "Delivered",
}


def order_status_update_for_customer(order: dict):
    oid = order.get("order_id", "")
    status = order.get("fulfillment_status", "processing")
    label = FULFILLMENT_LABELS.get(status, status.replace("_", " ").title())
    tracking = order.get("tracking_number")
    courier = order.get("courier")

    track_html = track_text = ""
    if tracking:
        prefix = f"{courier} — " if courier else ""
        track_html = f"<p style='font-size:15px'><b>Tracking:</b> {prefix}{tracking}</p>"
        track_text = f"Tracking: {prefix}{tracking}\n"

    note = ""
    if status == "delivered":
        note = "We hope you love your purchase! 🪔"
    elif status == "out_for_delivery":
        note = "Your order will reach you today."

    subject = f"Order {oid} update: {label}"
    html = f"""
    <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1A1A1A">
      <h2 style="color:#7A1F3D">Your order is now: {label}</h2>
      <p>The status of your order <b>{oid}</b> has been updated.</p>
      {track_html}
      <p style="color:#444">{note}</p>
      <p style="color:#666">Thank you for shopping with {STORE_NAME}.</p>
    </div>"""
    text = (f"Your order {oid} is now: {label}\n{track_text}"
            f"{note}\n\n— {STORE_NAME}")
    return subject, html, text


def whatsapp_order_text(order: dict, for_owner: bool) -> str:
    oid = order.get("order_id", "")
    total = format_inr(order.get("total"))
    items = "\n".join(f"• {it.get('quantity',1)}x {it.get('name','')}" for it in order.get("items", []))
    if for_owner:
        return (f"🛍️ *New order* {oid}\nCustomer: {order.get('email','')}\n{items}\n*Total: {total}*")
    return (f"Thank you for shopping with {STORE_NAME}! 🪔\n\nYour order *{oid}* is confirmed.\n{items}\n"
            f"*Total: {total}*\n\nWe'll update you as it's prepared.")
