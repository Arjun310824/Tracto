import os
import urllib.request
import urllib.parse
import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def send_sms_otp(phone_number, otp_code, purpose="Work Completion"):
    """
    Sends real SMS with 4-digit OTP to farmer / user mobile phone.
    Supports Fast2SMS (Indian SMS Gateway) & Twilio with intelligent local fallback.
    """
    if not phone_number:
        return {"status": "failed", "error": "Phone number missing"}

    fast2sms_key = getattr(settings, "FAST2SMS_API_KEY", "") or os.getenv("FAST2SMS_API_KEY", "")
    twilio_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "") or os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_token = getattr(settings, "TWILIO_AUTH_TOKEN", "") or os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_from = getattr(settings, "TWILIO_PHONE_NUMBER", "") or os.getenv("TWILIO_PHONE_NUMBER", "")

    # Format 10-digit Indian Mobile number
    clean_phone = "".join(filter(str.isdigit, str(phone_number)))
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]

    message_text = f"Your TRACTO {purpose} OTP is {otp_code}. Share this with the tractor driver ONLY after your farming work is completed. - TRACTO Gujarat"

    # 1. Try Fast2SMS if API key is provided in .env
    if fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "route": "q",
                "message": message_text,
                "language": "english",
                "flash": 0,
                "numbers": clean_phone,
            }
            headers = {
                "authorization": fast2sms_key,
                "Content-Type": "application/json",
                "User-Agent": "TractoApp/1.0"
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=6) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                logger.info(f"Fast2SMS Sent to {clean_phone}: {res_data}")
                return {"status": "sent", "gateway": "Fast2SMS", "response": res_data}
        except urllib.error.HTTPError as he:
            try:
                err_msg = json.loads(he.read().decode("utf-8"))
            except Exception:
                err_msg = str(he)
            logger.warning(f"Fast2SMS HTTP notice for {clean_phone}: {err_msg}")
            print(f"[Fast2SMS Gateway Status] {err_msg}")
        except Exception as e:
            logger.error(f"Fast2SMS failed for {clean_phone}: {e}")

    # 2. Try Twilio if configured in .env
    if twilio_sid and twilio_token and twilio_from:
        try:
            import base64
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            data = urllib.parse.urlencode({
                "To": f"+91{clean_phone}",
                "From": TWILIO_PHONE_NUMBER,
                "Body": message_text,
            }).encode("utf-8")

            auth_str = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            headers = {
                "Authorization": f"Basic {auth_b64}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            req = urllib.request.Request(twilio_url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=6) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return {"status": "sent", "gateway": "Twilio", "response": res_data}
        except Exception as e:
            logger.error(f"Twilio SMS failed for {clean_phone}: {e}")

    # 3. Development / Sandbox Console output
    print("\n" + "=" * 55)
    print(f"[TRACTO SMS GATEWAY] To: +91 {clean_phone}")
    print(f"Message: {message_text}")
    print(f"OTP Code: {otp_code}")
    print("=" * 55 + "\n")
    return {"status": "simulated", "phone": clean_phone, "otp": otp_code, "message": message_text}
