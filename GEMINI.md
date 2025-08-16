# GEMINI.md: Your Guide to the Chef Alex J Website

This document provides a comprehensive overview of the Chef Alex J website project, designed to help developers get up and running quickly.

## 1. Project Overview

This is a modern, responsive website for Chef Alex J, a private dining and events service. The site is built with Next.js 14 and features an AI-powered booking system, advanced design customization tools, and a comprehensive admin dashboard.

**Core Technologies:**

*   **Framework:** Next.js 14 (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI:** Groq AI (Llama 3.1 8B) for quote generation
*   **Backend Services:**
    *   **Database:** Firebase/Firestore
    *   **Email:** Mailjet
    *   **Calendar:** Google Calendar API
*   **UI & Animation:** Framer Motion, GSAP, Headless UI, Radix UI

## 2. Getting Started

### Prerequisites

*   Node.js
*   pnpm (package manager)

### Installation and Setup

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Populate `.env.local` with the necessary API keys and credentials for services like Groq, Mailjet, Google Calendar, and Firebase. Refer to the `README.md` for a complete list of required variables.

3.  **Running the Development Server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Other Important Commands

*   **Build for Production:**
    ```bash
    pnpm run build
    ```
*   **Start Production Server:**
    ```bash
    pnpm run start
    ```
*   **Linting:**
    ```bash
    pnpm run lint
    ```
*   **Image Optimization:**
    ```bash
    npx ts-node compress.ts
    ```

## 3. Key Features

*   **AI-Powered Booking:** A chat interface provides personalized quotes and integrates with a booking form.
*   **Email Approval Workflow:** A multi-step email process allows the chef to approve, reject, or suggest new times for bookings.
*   **Design Customization:** Real-time color and font management tools are available for administrators.
*   **Admin Dashboard:** A comprehensive interface for managing bookings, content, and site design.
*   **Advanced Animations:** The site utilizes GSAP and Framer Motion for a dynamic user experience.

## 4. Project Structure

The project follows the standard Next.js App Router structure.

*   `app/`: Contains the main application code, including pages, API routes, and UI components.
    *   `app/api/`: All backend API routes.
    *   `app/components/`: Reusable React components.
    *   `app/admin/`: The admin dashboard.
*   `lib/`: Houses backend logic, API handlers, and utility functions.
*   `public/`: Static assets like images and videos.
*   `scripts/`: Standalone scripts (e.g., database seeding).

## 5. Development Conventions

*   **Package Manager:** Use `pnpm` for all dependency management.
*   **Styling:** Utilize Tailwind CSS for styling. Custom styles are defined in `app/globals.css`.
*   **Code Quality:** Run `pnpm run lint` to check for code quality issues.
*   **Commits:** Follow conventional commit standards (though not explicitly stated, it's a good practice).
*   **API Routes:** All backend logic is handled through API routes in `app/api/`.
*   **Environment Variables:** All secrets and environment-specific configurations are stored in `.env.local`.
