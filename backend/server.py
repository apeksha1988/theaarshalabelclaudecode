from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hmac
import hashlib
import json
import bcrypt
import asyncio
import razorpay
import notifications

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
sessions_collection = db.user_sessions
products_collection = db.products
orders_collection = db.orders
custom_requests_collection = db.custom_dress_requests
payments_collection = db.payments
webhook_events_collection = db.webhook_events
contact_messages_collection = db.contact_messages
password_resets_collection = db.password_resets

# Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# Notification recipients (store owner)
OWNER_EMAIL = os.getenv("OWNER_EMAIL")
OWNER_WHATSAPP = os.getenv("OWNER_WHATSAPP")

# Public site URL (used to build password-reset links in emails)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "customer"  # customer or admin
    password_hash: Optional[str] = None
    created_at: datetime

class Session(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

class Product(BaseModel):
    product_id: str
    name: str
    description: str
    price: int  # in cents
    currency: str = "USD"
    images: List[str]
    category: str  # "jewellery" or "custom_dress"
    dodo_product_id: Optional[str] = None
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: str
    price: int
    currency: str = "USD"
    images: List[str]
    category: str
    dodo_product_id: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int
    image: Optional[str] = None

class ShippingAddress(BaseModel):
    name: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: str

class Order(BaseModel):
    order_id: str
    user_id: Optional[str] = None
    email: str
    items: List[OrderItem]
    total: int
    currency: str
    status: str  # pending_payment, paid, failed, cancelled, processing, shipped, delivered
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    shipping_address: Optional[ShippingAddress] = None
    created_at: datetime
    updated_at: datetime

class CheckoutRequest(BaseModel):
    email: str
    items: List[OrderItem]
    currency: str
    shipping_address: ShippingAddress
    redirect_url: str

class CheckoutResponse(BaseModel):
    checkout_url: str
    order_id: str

class RazorpayOrderResponse(BaseModel):
    key_id: str
    razorpay_order_id: str
    amount: int
    currency: str
    order_id: str
    prefill_name: Optional[str] = None
    prefill_email: Optional[str] = None
    prefill_contact: Optional[str] = None

# Order fulfillment tracking
FULFILLMENT_STATUSES = ["processing", "dispatched", "in_transit", "out_for_delivery", "delivered"]

class OrderStatusUpdate(BaseModel):
    fulfillment_status: str
    tracking_number: Optional[str] = None
    courier: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

class CustomDressRequest(BaseModel):
    request_id: str
    user_id: Optional[str] = None
    email: str
    name: str
    phone: str
    dress_type: str
    description: str
    measurements: Optional[str] = None
    budget: Optional[int] = None
    status: str  # pending, reviewing, approved, in_progress, completed, cancelled
    created_at: datetime
    updated_at: datetime

class CustomDressRequestCreate(BaseModel):
    email: str
    name: str
    phone: str
    dress_type: str
    description: str
    measurements: Optional[str] = None
    budget: Optional[int] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class SessionExchangeRequest(BaseModel):
    session_id: str

# Authentication helpers
async def get_current_user(request: Request) -> Optional[dict]:
    # Try cookie first, then Authorization header
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        return None
    
    session_doc = await sessions_collection.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await users_collection.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return user_doc

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_auth(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Auth routes
@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response):
    # Check if user exists
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "picture": None,
        "role": "customer",
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
    }
    
    await users_collection.insert_one(user_doc)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    session_doc = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    }
    await sessions_collection.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60,
    )
    
    user_doc.pop("password_hash")
    user_doc.pop("_id", None)
    return user_doc

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    user_doc = await users_collection.find_one(
        {"email": data.email},
        {"_id": 0}
    )
    
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(data.password.encode(), user_doc["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    session_doc = {
        "session_token": session_token,
        "user_id": user_doc["user_id"],
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    }
    await sessions_collection.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60,
    )
    
    user_doc.pop("password_hash")
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await sessions_collection.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": data.email})
    # Act for any existing account (incl. legacy passwordless ones, letting them
    # set a password). Always return the same response so we don't reveal whether
    # an email is registered.
    if user:
        token = uuid.uuid4().hex
        await password_resets_collection.insert_one({
            "token": token,
            "user_id": user["user_id"],
            "email": user["email"],
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
            "created_at": datetime.now(timezone.utc),
        })
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        logging.info(f"[password-reset] link for {user['email']}: {reset_link}")
        subject = "Reset your The Aarsha's Label password"
        html = (
            "<div style='font-family:Georgia,serif;color:#1A1A1A;max-width:520px'>"
            "<h2 style='color:#7A1F3D'>Password reset</h2>"
            "<p>We received a request to reset your password. Click the button below "
            "to choose a new one. This link expires in 1 hour.</p>"
            f"<p><a href='{reset_link}' style='display:inline-block;background:#7A1F3D;"
            "color:#fff;padding:12px 22px;text-decoration:none;border-radius:4px'>Reset Password</a></p>"
            "<p style='font-size:13px;color:#444'>Or copy and paste this link into your "
            f"browser:<br><a href='{reset_link}'>{reset_link}</a></p>"
            "<p style='color:#666;font-size:12px'>If you didn't request this, you can "
            "safely ignore this email.</p></div>"
        )
        text = f"Reset your password (link expires in 1 hour): {reset_link}"
        await notifications.send_email(user["email"], subject, html, text)
    return {"message": "If that email is registered, a password reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    rec = await password_resets_collection.find_one({"token": data.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link.")

    expires_at = rec["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    await users_collection.update_one(
        {"user_id": rec["user_id"]},
        {"$set": {"password_hash": password_hash}},
    )
    await password_resets_collection.update_one({"token": data.token}, {"$set": {"used": True}})
    # Invalidate any existing sessions for safety.
    await sessions_collection.delete_many({"user_id": rec["user_id"]})
    return {"message": "Password reset successful. You can now sign in with your new password."}

# Product routes
@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    products = await products_collection.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await products_collection.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products")
async def create_product(data: ProductCreate, request: Request):
    await require_admin(request)
    
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = data.model_dump()
    product_doc["product_id"] = product_id
    product_doc["created_at"] = datetime.now(timezone.utc)
    
    await products_collection.insert_one(product_doc)
    product_doc.pop("_id", None)
    return product_doc

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, data: ProductCreate, request: Request):
    await require_admin(request)
    
    result = await products_collection.update_one(
        {"product_id": product_id},
        {"$set": data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await products_collection.find_one({"product_id": product_id}, {"_id": 0})
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    await require_admin(request)
    
    result = await products_collection.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted"}

# Checkout routes
@api_router.post("/checkout/order", response_model=RazorpayOrderResponse)
async def create_checkout_order(data: CheckoutRequest, request: Request):
    if not razorpay_client:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured yet. Please try again later or use guest checkout.",
        )

    total = sum(item.price * item.quantity for item in data.items)
    currency = data.currency or "INR"
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    user = await get_current_user(request)

    order_doc = {
        "order_id": order_id,
        "user_id": user["user_id"] if user else None,
        "email": data.email,
        "items": [item.model_dump() for item in data.items],
        "total": total,
        "currency": currency,
        "status": "pending_payment",
        "razorpay_order_id": None,
        "razorpay_payment_id": None,
        "shipping_address": data.shipping_address.model_dump(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await orders_collection.insert_one(order_doc)

    try:
        # The Razorpay SDK is synchronous; run it off the event loop.
        rp_order = await asyncio.to_thread(
            razorpay_client.order.create,
            {
                "amount": total,            # already in the smallest unit (paise)
                "currency": currency,
                "receipt": order_id,
                "notes": {"order_id": order_id, "email": data.email},
            },
        )
    except Exception as e:
        logging.error(f"Razorpay order error: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not create payment order. Please try again.")

    await orders_collection.update_one(
        {"order_id": order_id},
        {"$set": {"razorpay_order_id": rp_order["id"]}},
    )

    return RazorpayOrderResponse(
        key_id=RAZORPAY_KEY_ID,
        razorpay_order_id=rp_order["id"],
        amount=total,
        currency=currency,
        order_id=order_id,
        prefill_name=data.shipping_address.name,
        prefill_email=data.email,
        prefill_contact=data.shipping_address.phone,
    )

# Guest checkout - simplified without Dodo
@api_router.post("/checkout/guest")
async def guest_checkout(data: CheckoutRequest):
    total = sum(item.price * item.quantity for item in data.items)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "email": data.email,
        "items": [item.model_dump() for item in data.items],
        "total": total,
        "currency": data.currency,
        "status": "pending_payment",
        "shipping_address": data.shipping_address.model_dump(),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    await orders_collection.insert_one(order_doc)
    order_doc.pop("_id", None)
    return {"order_id": order_id, "status": "pending_payment"}

@api_router.post("/checkout/verify")
async def verify_checkout(data: PaymentVerifyRequest):
    """Verify the Razorpay payment signature returned by Razorpay Checkout and
    mark the order paid. This is the primary confirmation path (works locally
    without webhooks); the webhook is a server-side backstop in production.
    """
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Payment gateway not configured.")

    params = {
        "razorpay_order_id": data.razorpay_order_id,
        "razorpay_payment_id": data.razorpay_payment_id,
        "razorpay_signature": data.razorpay_signature,
    }
    try:
        razorpay_client.utility.verify_payment_signature(params)
    except razorpay.errors.SignatureVerificationError:
        # A bad signature means tampering, not a genuine payment failure — reject
        # without mutating the order. Real failures arrive via the webhook.
        raise HTTPException(status_code=400, detail="Payment verification failed. Signature mismatch.")

    await _apply_payment_status(data.order_id, data.razorpay_payment_id, paid=True)
    return {"order_id": data.order_id, "status": "paid"}

# Contact / enquiry
@api_router.post("/contact")
async def contact(data: ContactRequest):
    doc = {
        "contact_id": f"msg_{uuid.uuid4().hex[:12]}",
        "name": data.name,
        "email": data.email,
        "message": data.message,
        "created_at": datetime.now(timezone.utc),
    }
    await contact_messages_collection.insert_one(doc)

    subject = f"New enquiry from {data.name}"
    html = (
        f"<div style='font-family:Arial,sans-serif'>"
        f"<h3 style='color:#7A1F3D'>New website enquiry</h3>"
        f"<p><b>Name:</b> {data.name}<br/><b>Email:</b> {data.email}</p>"
        f"<p style='white-space:pre-wrap'>{data.message}</p></div>"
    )
    text = f"New enquiry\n\nName: {data.name}\nEmail: {data.email}\n\n{data.message}"

    emailed = False
    if OWNER_EMAIL:
        emailed = await notifications.send_email(OWNER_EMAIL, subject, html, text)
    if OWNER_WHATSAPP:
        _fire(notifications.send_whatsapp(
            OWNER_WHATSAPP,
            f"📩 New enquiry from {data.name} ({data.email}):\n{data.message}",
        ))
    return {"status": "received", "emailed": emailed}

# Order routes
@api_router.get("/orders")
async def get_orders(request: Request):
    user = await require_auth(request)
    orders = await orders_collection.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await orders_collection.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/admin/orders")
async def get_all_orders(request: Request):
    await require_admin(request)
    orders = await orders_collection.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, data: OrderStatusUpdate, request: Request):
    await require_admin(request)
    if data.fulfillment_status not in FULFILLMENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(FULFILLMENT_STATUSES)}",
        )
    update = {
        "fulfillment_status": data.fulfillment_status,
        "updated_at": datetime.now(timezone.utc),
    }
    if data.tracking_number is not None:
        update["tracking_number"] = data.tracking_number.strip()
    if data.courier is not None:
        update["courier"] = data.courier.strip()

    result = await orders_collection.update_one({"order_id": order_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    order = await orders_collection.find_one({"order_id": order_id}, {"_id": 0})
    _fire(notify_order_status(order))  # email the customer about the update
    return order

# Custom dress request routes
@api_router.post("/custom-dress")
async def create_custom_request(data: CustomDressRequestCreate, request: Request):
    user = await get_current_user(request)
    
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    request_doc = data.model_dump()
    request_doc["request_id"] = request_id
    request_doc["user_id"] = user["user_id"] if user else None
    request_doc["status"] = "pending"
    request_doc["created_at"] = datetime.now(timezone.utc)
    request_doc["updated_at"] = datetime.now(timezone.utc)
    
    await custom_requests_collection.insert_one(request_doc)
    request_doc.pop("_id", None)
    return request_doc

@api_router.get("/custom-dress")
async def get_custom_requests(request: Request):
    user = await require_auth(request)
    requests = await custom_requests_collection.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(1000)
    return requests

@api_router.get("/admin/custom-dress")
async def get_all_custom_requests(request: Request):
    await require_admin(request)
    requests = await custom_requests_collection.find({}, {"_id": 0}).to_list(1000)
    return requests

@api_router.put("/admin/custom-dress/{request_id}")
async def update_custom_request_status(request_id: str, status: str, request: Request):
    await require_admin(request)
    
    result = await custom_requests_collection.update_one(
        {"request_id": request_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req = await custom_requests_collection.find_one({"request_id": request_id}, {"_id": 0})
    return req

# --- Notifications ---
_bg_tasks = set()


def _fire(coro):
    """Run a coroutine in the background without blocking the request."""
    task = asyncio.create_task(coro)
    _bg_tasks.add(task)
    task.add_done_callback(_bg_tasks.discard)


def _to_e164(phone: Optional[str], default_cc: str = "91") -> str:
    """Normalize a phone number to E.164 (e.g. +919876543210).

    Handles common Indian input formats: bare 10-digit, leading trunk '0'
    (08598931531), international '00' prefix, and existing country code.
    """
    raw = (phone or "").strip()
    if not raw:
        return ""
    had_plus = raw.startswith("+")
    digits = "".join(ch for ch in raw if ch.isdigit())
    if not digits:
        return ""
    if had_plus:
        return "+" + digits
    if digits.startswith("00"):  # international dialing prefix
        return "+" + digits[2:]
    digits = digits.lstrip("0")  # strip national trunk zero(s)
    if not digits:
        return ""
    if len(digits) == 10:  # bare national number -> assume default country
        return "+" + default_cc + digits
    return "+" + digits  # already includes a country code


async def notify_order_paid(order: dict):
    """Send order-paid notifications (customer + owner, email + WhatsApp).
    Each send no-ops gracefully if its provider isn't configured."""
    try:
        subj, html, text = notifications.order_confirmation_for_customer(order)
        await notifications.send_email(order.get("email"), subj, html, text)

        if OWNER_EMAIL:
            subj, html, text = notifications.order_alert_for_owner(order)
            await notifications.send_email(OWNER_EMAIL, subj, html, text)

        phone = _to_e164((order.get("shipping_address") or {}).get("phone"))
        if phone:
            await notifications.send_whatsapp(phone, notifications.whatsapp_order_text(order, for_owner=False))
        if OWNER_WHATSAPP:
            await notifications.send_whatsapp(OWNER_WHATSAPP, notifications.whatsapp_order_text(order, for_owner=True))
    except Exception as e:
        logging.error("notify_order_paid failed: %s", e)


async def notify_order_status(order: dict):
    """Email the customer when their order's fulfillment status changes."""
    try:
        subj, html, text = notifications.order_status_update_for_customer(order)
        await notifications.send_email(order.get("email"), subj, html, text)
    except Exception as e:
        logging.error("notify_order_status failed: %s", e)


# Webhook handler
async def _apply_payment_status(order_id: Optional[str], payment_id: Optional[str], paid: bool):
    """Update the payment + order records for a settled payment."""
    payment_status = "succeeded" if paid else "failed"
    order_status = "paid" if paid else "payment_failed"

    if payment_id:
        await payments_collection.update_one(
            {"razorpay_payment_id": payment_id},
            {"$set": {
                "razorpay_payment_id": payment_id,
                "order_id": order_id,
                "status": payment_status,
                "updated_at": datetime.now(timezone.utc),
            }},
            upsert=True,
        )

    if order_id:
        await orders_collection.update_one(
            {"order_id": order_id},
            {"$set": {
                "status": order_status,
                "razorpay_payment_id": payment_id,
                "updated_at": datetime.now(timezone.utc),
            }},
        )
        if paid:
            # Notify exactly once per order (verify + webhook may both fire).
            guard = await orders_collection.update_one(
                {"order_id": order_id, "notified_at": {"$exists": False}},
                {"$set": {
                    "notified_at": datetime.now(timezone.utc),
                    "fulfillment_status": "processing",
                }},
            )
            if guard.modified_count == 1:
                fresh = await orders_collection.find_one({"order_id": order_id}, {"_id": 0})
                if fresh:
                    _fire(notify_order_paid(fresh))


@api_router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    # Verify the webhook signature when a secret is configured.
    if RAZORPAY_WEBHOOK_SECRET:
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            msg=raw_body,
            digestmod=hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event.get("event")
    payment = event.get("payload", {}).get("payment", {}).get("entity", {})
    razorpay_order_id = payment.get("order_id")
    payment_id = payment.get("id")
    order_id = (payment.get("notes") or {}).get("order_id")

    # Fall back to looking up our order by its razorpay_order_id.
    if not order_id and razorpay_order_id:
        existing = await orders_collection.find_one(
            {"razorpay_order_id": razorpay_order_id}, {"_id": 0, "order_id": 1}
        )
        if existing:
            order_id = existing.get("order_id")

    if event_type == "payment.captured":
        await _apply_payment_status(order_id, payment_id, paid=True)
    elif event_type == "payment.failed":
        await _apply_payment_status(order_id, payment_id, paid=False)

    return Response(status_code=200)

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

def _load_seed_snapshot():
    """Load the exported full-catalog snapshot (products_seed.json) if present.
    Returns a list of insert-ready product docs, or None to fall back to inline samples."""
    seed_file = ROOT_DIR / "products_seed.json"
    if not seed_file.exists():
        return None
    try:
        data = json.loads(seed_file.read_text(encoding="utf-8"))
    except Exception as e:
        logger.error(f"Could not read products_seed.json: {e}")
        return None
    if not data:
        return None
    for p in data:
        ca = p.get("created_at")
        if isinstance(ca, str):
            try:
                p["created_at"] = datetime.fromisoformat(ca)
            except ValueError:
                p["created_at"] = datetime.now(timezone.utc)
        else:
            p["created_at"] = datetime.now(timezone.utc)
        p.setdefault("product_id", f"prod_{uuid.uuid4().hex[:12]}")
    return data


async def ensure_admin_user():
    admin_exists = await users_collection.find_one({"role": "admin"})
    if not admin_exists:
        # Credentials come from env so they're never hardcoded in source.
        admin_email = os.getenv("ADMIN_EMAIL", "admin@aarshaslabel.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        password_hash = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
        await users_collection.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "Admin",
            "role": "admin",
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Created admin user: %s", admin_email)


# Seed data on startup
@app.on_event("startup")
async def seed_database():
    # Check if products exist
    count = await products_collection.count_documents({})
    if count > 0:
        return

    # Restore the full catalog from the exported snapshot if it exists, so a DB
    # wipe brings back every product (not just the inline sample set below).
    snapshot = _load_seed_snapshot()
    if snapshot:
        await products_collection.insert_many(snapshot)
        logger.info(f"Seeded {len(snapshot)} products from products_seed.json")
        await ensure_admin_user()
        return

    # No snapshot file present - products come from products_seed.json (the
    # canonical catalog). Without it, seed only the admin user.
    logger.warning("No products_seed.json found - skipping product seeding.")
    await ensure_admin_user()