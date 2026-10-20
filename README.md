# Stoneale gaming platform

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/matthew-ajayis-projects/v0-stoneale-gaming-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/uIFQ0LQ6VcI)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/matthew-ajayis-projects/v0-stoneale-gaming-platform](https://vercel.com/matthew-ajayis-projects/v0-stoneale-gaming-platform)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/uIFQ0LQ6VcI](https://v0.app/chat/projects/uIFQ0LQ6VcI)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Stellar integration

Wallets connect through [Freighter](https://www.freighter.app/), and plans (`/pricing`) and specialist sessions (`/booking`) are paid in XLM or USDC on Stellar.

1. Copy `.env.example` to `.env.local` and fill it in. Set the same variables in Vercel.
2. Payment flow:
   - The app asks `/api/payments/quote` for a signed quote: the price in the chosen asset, the treasury address and a unique memo.
   - Freighter signs the payment and the browser submits it to Horizon.
   - `/api/payments/subscribe` or `/api/payments/book-session` checks on Horizon that the transaction paid the quoted amount, in the quoted asset, to the treasury, with the quoted memo.
3. XLM prices come from CoinGecko and are locked in the quote for 10 minutes.

Subscriptions and bookings aren't stored in a database yet, so a confirmed transaction hash isn't recorded and could be confirmed twice. Store used hashes once persistence is added.
