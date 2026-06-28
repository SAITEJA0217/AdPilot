# AdAudit AI Deployment Guide

This guide outlines how to deploy AdAudit AI to production, specifically focusing on Vercel for hosting the Next.js application and a standard PostgreSQL database (e.g., Supabase, Neon, AWS RDS) for data storage.

## 1. Prerequisites

- A GitHub repository containing the AdAudit AI codebase.
- A Vercel account linked to your GitHub.
- A standard PostgreSQL database (e.g. Supabase DB or Neon Tech).
- A Gemini API Key from Google AI Studio.

## 2. Environment Variables

Before deploying, ensure you have the following environment variables ready. You will need to add these to your Vercel project settings.

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
GEMINI_API_KEY="your_google_gemini_api_key"
```

> **Note:** The `DATABASE_URL` must point to a reachable, persistent database, NOT a Prisma Dev Database or `localhost`.

## 3. Deployment Steps on Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your AdAudit AI repository from GitHub.
4. In the **Configure Project** section:
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: `./` (unless your code is in a subfolder).
   - **Build Command**: `npx prisma generate && next build`
   - **Install Command**: `npm install`
5. Expand the **Environment Variables** section and add both `DATABASE_URL` and `GEMINI_API_KEY`.
6. Click **Deploy**.

## 4. Post-Deployment Database Push

Once Vercel has successfully built and deployed the application, your database needs to have the schema applied.

Since Vercel handles the application code, you need to sync your schema to your production database from your local machine (or via a GitHub action). 

Run the following command locally, ensuring your local `.env` has the production `DATABASE_URL` temporarily, or by passing it inline:

```bash
DATABASE_URL="your_production_url" npx prisma db push
```

Alternatively, you can set up a `postinstall` script in your `package.json` to automatically push the schema during the Vercel build, but doing it manually the first time is safer.

## 5. File Storage Caveat (Action Required)

The MVP currently writes uploaded CSV files to the local filesystem (`/uploads` directory) in `src/app/api/uploads/route.ts`. 

Vercel functions are serverless and have a read-only filesystem (except for `/tmp`). 

**Before launching to real users on Vercel:**
You MUST update `src/app/api/uploads/route.ts` to upload the CSV text to a cloud storage provider (like Amazon S3, Vercel Blob, or simply passing the text directly to the database without saving a file) rather than using `fs/promises`.
