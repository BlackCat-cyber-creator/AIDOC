# AIDOC - AI-Powered Medical Diagnosis Assistant

![AIDOC Logo](public/ai.webp)

## Overview

AIDOC is a state-of-the-art medical diagnosis assistant that leverages advanced Artificial Intelligence to help users understand their symptoms. By combining patient history, symptom details, and interactive 3D visualizations, AIDOC provides educational insights into potential health conditions.

**Disclaimer: AIDOC is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.**

## Key Features

- **AI-Driven Diagnosis:** Utilizes Google Gemini via Genkit to analyze complex symptom patterns and patient history.
- **Patient Profiles:** Manage multiple profiles (e.g., for family members) with unique medical histories, including chronic conditions and medications.
- **Interactive 3D Anatomy:** Visualize symptom locations on high-quality 3D male and female models.
- **Multi-Step Assessment:** A comprehensive questionnaire covering symptom type, location, severity, duration, onset, and triggers.
- **Premium Features:** Support for photo analysis of symptoms, increased daily diagnosis limits, and expanded patient profiles.
- **Multilingual Support:** Fully localized in English, Indonesian, Spanish, and French.
- **PWA Ready:** Installable as a Progressive Web App for a native-like experience on mobile and desktop.
- **Theme Support:** Beautifully designed Light and Dark modes featuring iridescent background effects.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Integration:** [Genkit](https://github.com/firebase/genkit) with Google Gemini
- **Backend/Auth:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **3D Rendering:** [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Three.js](https://threejs.org/), and [OGL](https://github.com/o-o-o-o-o-o-o-o-o-o/ogl)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Internationalization:** [i18next](https://www.i18next.com/)
- **State Management:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project
- A Google Gemini API key

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/AIDOC.git
    cd AIDOC
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file and add your configuration:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_id
    GOOGLE_GENAI_API_KEY=your_gemini_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) in your browser.

## Development Scripts

- `npm run dev`: Starts the Next.js dev server.
- `npm run genkit:dev`: Starts the Genkit UI for AI flow testing.
- `npm run build`: Builds the production application.
- `npm run test`: Runs the Jest test suite.
- `npm run lint`: Checks for code quality issues.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: UI components, including `3d` models and assessment `forms`.
- `src/ai`: Genkit flows and AI logic.
- `src/lib`: Utility functions, Firebase config, and i18n setup.
- `src/hooks`: Custom React hooks for form handling and UI state.
- `public`: Static assets, including 3D models and localized icons.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
