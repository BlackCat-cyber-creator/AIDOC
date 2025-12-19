# AIDOC - AI-Powered Medical Diagnosis Assistant

![AIDOC Logo](public/icon-512x512.webp)

## Description

AIDOC is a modern web application designed to assist users in understanding potential medical diagnoses based on entered symptoms. It leverages AI to provide educational information and insights into various health conditions.
**Please note: AIDOC is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.**

## Features

- AI-powered symptom analysis and potential diagnosis generation.
- Interactive 3D human anatomy models for visual understanding.
- Dynamic and engaging background effects with Iridescence (light mode)
- Responsive user interface designed for seamless experience across mobile and desktop devices.

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, OGL (for 3D and shader effects), `next-themes` (for theme management)
- **AI Integration:** Genkit (for AI flows)

## Installation & Local Development

Follow these steps to set up and run AIDOC on your local machine:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/AIDOC-AIDOC.git
    cd AIDOC-AIDOC
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install
    ```

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the root of the project directory and add your Genkit (or other AI service) API key:

    ```
    NEXT_PUBLIC_GENKIT_API_KEY=your_api_key_here
    ```

    (Replace `your_api_key_here` with your actual API key.)

4.  **Run the development server:**

    ```bash
    npm run dev
    # or yarn dev
    ```

5.  **Open in Browser:**

    Open your web browser and navigate to `http://localhost:9002`.

## Usage

Once the application is running:

1.  Navigate to the home page.
2.  Enter your symptoms and any relevant medical history into the provided form.
3.  Submit the form to receive potential diagnoses and educational information.
4.  Toggle between light and dark modes using the theme switch in the header to experience different background effects.

## Live Demo

[https://studio--aidoc-ze7io.us-central1.hosted.app/]

## Contributing

We welcome contributions! If you have suggestions for improvements, bug reports, or want to contribute code, please feel free to:

- Open an issue to discuss your ideas or report bugs.
- Fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with Next.js and powered by Google Gemini.
- Thanks to the developers of OGL for the beautiful shader effects.
- Thanks to the open-source community for amazing tools and libraries.
