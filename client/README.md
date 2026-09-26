Split Payout Platform

A MERN-stack marketplace payment system that automates complex multi-party transactions — splitting a single customer payment across multiple vendors, platform commission, and tax withholding, with escrow-style holds, async payout processing, and per-vendor refund handling.

The Problem

Marketplace platforms with multiple vendors struggle to manually split one customer payment among several parties (vendors, platform fees, taxes), hold funds safely until delivery is confirmed, and handle partial refunds without breaking payout accuracy for other vendors in the same order.

The Solution

This project calculates exact percentage-based splits at checkout and processes payouts to each vendor independently and asynchronously, with:

Multi-vendor cart splitting — a single order can contain items from different vendors, each with their own commission rate and tax region, calculated and split correctly in one transaction
Escrow-style payout holds — payouts sit in a pending state until the order is marked delivered
Async payout queue with automatic retries — payout jobs are processed via a BullMQ job queue with exponential backoff, so a transient failure doesn't lose money or block the checkout flow
Idempotent payouts — each payout carries a unique idempotency key tied to its transaction and vendor, preventing duplicate payouts on retry
Per-vendor refund reversal — refunding one item in a multi-vendor order only reverses that vendor's payout, leaving other vendors' payouts untouched
Admin visibility — platform-wide fees collected, tax withheld, and a failed-payout audit trail with failure reasons
Vendor visibility — each vendor can look up their own payout history and pending/earned totals
Tech Stack
Backend: Node.js, Express, MongoDB (Mongoose), BullMQ + Redis (Upstash) for the payout queue
Web frontend: React, custom dark dashboard UI, Recharts for data visualization
Mobile frontend: React Native (Expo, Expo Router), matching dark theme, SVG-based charts
Testing: Jest (split-calculation unit tests)
Payments: A custom mock payment gateway service (see note below) built behind the same interface a real processor would use
Architecture Notes

Payment gateway is mocked, by design. Stripe Connect and Razorpay Route (the standard tools for marketplace-style split payouts) require a registered business and completed KYC to use their split/transfer features — not available as a student building a portfolio project. Rather than skip the payment layer, it's implemented as a mockPaymentService behind the exact same interface a real gateway integration would use (createPaymentIntent, confirmPayment, createTransfer, createReversal), so swapping in a real processor later is a matter of replacing one file, not restructuring the app.

Escrow is modeled explicitly. Payouts are created in a pending state at payment confirmation and only queued for release once an order is marked delivered — mirroring how a real marketplace holds funds until a transaction is considered complete.

Split calculation and payout execution are separate concerns, stored in separate MongoDB collections (Transaction for the calculated breakdown, Payout for the actual money-movement attempt and its status). This means a failed payout can be retried without recalculating the split, and the calculation itself has a full audit trail independent of whether the money actually moved.

The mobile app is verified via Expo's web preview, not a physical device. Live device testing through Expo Go/dev client was blocked by a restrictive network environment (firewall settings locked at the OS level, outbound tunneling blocked). The React Native codebase itself is complete and confirmed working end-to-end against the same backend as the web app — npx expo start --web renders the identical code and logic in a browser tab.

Features by Version

v1 — Core flow: Vendor/Order/Transaction/Payout models, split calculator (unit-tested with Jest), checkout → pay → confirm-payment → deliver API flow, single-vendor split calculation.

v2 — Marketplace features: Multi-vendor cart splitting (verified with different commission rates and tax regions per vendor in the same order), per-vendor refund reversal, vendor payout-history API, full React web dashboard.

v3 — Reliability & operations: BullMQ payout queue with retry/backoff, separate worker process for async payout execution, admin stats endpoint (platform fees, tax collected, payout health, failed-payout audit trail), React Native mobile app.

Project Structure
split-payout-platform/
├── client/          # React web dashboard
├── mobile/          # Expo / React Native app
└── server/
    ├── models/        # Vendor, Order, Transaction, Payout (Mongoose schemas)
    ├── routes/         # API endpoints
    ├── services/        # splitCalculator, taxService, mockPaymentService
    ├── queues/            # BullMQ queue + worker
    ├── worker.js            # standalone payout-worker process
    └── index.js               # Express app entry point
Running Locally

Prerequisites: Node.js, a MongoDB connection string (Atlas free tier works), a Redis connection string (Upstash free tier works).

bash
# Backend
cd server
npm install
# create a .env file with MONGO_URI, JWT_SECRET, REDIS_URL, PORT
npm run dev          # starts the API server on :5000
node worker.js        # in a separate terminal — starts the payout worker

# Web frontend
cd client
npm install
npm start             # starts on :3000

# Mobile app
cd mobile
npm install
npx expo start --web  # browser preview, or scan the QR code with Expo Go
Key Engineering Decisions (for discussion)
Why separate Transaction and Payout collections? The split calculation and the payout execution are different concerns with different failure modes — a payout can fail and be retried without ever touching the calculation that produced it.
How are duplicate payouts prevented? Each Payout document carries an idempotency key derived from its transaction and vendor ID, so re-queuing the same payout (e.g. after a crash mid-processing) doesn't double-pay.
How is rounding handled? The split calculator tracks a roundingAdjustment field per transaction so that any fractional currency left over after splitting is logged explicitly rather than silently lost or duplicated.
Why a job queue instead of processing payouts synchronously? Marking an order delivered shouldn't block on external payment-processor calls; payouts are queued and processed by a separate worker, with automatic exponential-backoff retries on failure.
Status

Actively developed as a portfolio project demonstrating marketplace payment-splitting architecture