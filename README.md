# Bookified

Transform your books into interactive AI conversations. Upload PDFs, and chat with your books using voice.

## 🚀 Features

- **PDF Book Upload**: Seamlessly upload and process your PDF books.
- **AI-Powered Conversations**: Engage in intelligent dialogues with your books using advanced AI.
- **Voice Sessions**: Experience hands-free interaction through voice chat powered by Vapi.
- **Subscription Plans**: Flexible pricing tiers (Free, Standard, Pro) with Clerk Billing.
- **Real-time Transcripts**: View live transcripts of your voice conversations.
- **Responsive Design**: Optimized for a smooth experience across devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication & Billing**: [Clerk](https://clerk.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Storage**: [Vercel Blob](https://vercel.com/storage/blob)
- **AI/Voice**: [Vapi](https://vapi.ai/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **PDF Parsing**: [pdfjs-dist](https://mozilla.github.io/pdf.js/)

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- A MongoDB database (e.g., MongoDB Atlas)
- Accounts for Clerk, Vercel (Blob storage), and Vapi

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd bookified
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # MongoDB
    MONGODB_URI=

    # Vercel Blob
    BLOB_READ_WRITE_TOKEN=

    # Vapi
    NEXT_PUBLIC_VAPI_PUBLIC_KEY=
    VAPI_API_KEY=
    VAPI_ASSISTANT_ID=

    # Clerk Billing (Subscription Slugs)
    # standard
    # pro
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## 💳 Subscription Plans

- **Free**: 1 book, 5 sessions/month, 5 min/session, no session history.
- **Standard**: 10 books, 100 sessions/month, 15 min/session.
- **Pro**: 100 books, unlimited sessions, 60 min/session.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
