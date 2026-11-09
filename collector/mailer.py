import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr


def mask(addr):
    name, _, dom = (addr or "").partition("@")
    return (name[:1] + "***@" + dom) if dom else "***"


def send(subject, text, html, to):
    msg = EmailMessage()
    msg["Subject"] = subject
    sender = os.getenv("MAIL_FROM", "").strip() or os.environ["SMTP_USER"]
    msg["From"] = formataddr((os.getenv("MAIL_FROM_NAME") or "JH Home Curation (발신 전용)", sender))
    msg["To"] = to
    msg["Auto-Submitted"] = "auto-generated"
    copy = os.getenv("MAIL_COPY_TO", "").strip()
    if copy and copy.lower() != to.lower():
        msg["Bcc"] = copy
    msg.set_content(text or "HTML 메일입니다.")
    msg.add_alternative(html, subtype="html")
    host = os.getenv("SMTP_HOST") or "smtp.gmail.com"
    port = int(os.getenv("SMTP_PORT") or 465)
    s = smtplib.SMTP_SSL(host, port, timeout=30) if port == 465 else smtplib.SMTP(host, port, timeout=30)
    with s:
        if port != 465:
            s.starttls()
        s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        s.send_message(msg)
    print(f"[SENT] {subject} → {mask(to)}")
