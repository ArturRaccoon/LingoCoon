import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LingoCoon collects and uses your data',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-4 text-4xl font-bold text-black">Privacy Policy</h1>
      <p className="mb-12 text-sm text-gray-400">Last updated: July 2026</p>

      <div className="flex gap-12">
        <div className="w-48 shrink-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Contents
          </p>
          <nav className="flex flex-col gap-1">
            <a href="#general" className="text-sm text-gray-500 hover:text-black">1. General</a>
            <a href="#data-we-collect" className="text-sm text-gray-500 hover:text-black">2. Data LingoCoon collects</a>
            <a href="#how-we-use-it" className="text-sm text-gray-500 hover:text-black">3. How your data is used</a>
            <a href="#third-parties" className="text-sm text-gray-500 hover:text-black">4. Third parties</a>
            <a href="#your-rights" className="text-sm text-gray-500 hover:text-black">5. Your rights</a>
            <a href="#contact" className="text-sm text-gray-500 hover:text-black">6. Contact</a>
          </nav>
        </div>

        <div className="flex-1">
          <section id="general" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">1. General</h2>
            <p className="leading-relaxed text-gray-600">
              LingoCoon is a language learning app designed to help you learn languages
              through personalised flashcards, AI conversation, and speech practice.
              This Privacy Policy explains what personal data LingoCoon collects when
              you use the app, why it is collected, and your rights under the
              General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section id="data-we-collect" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">2. Data LingoCoon collects</h2>
            <p className="leading-relaxed text-gray-600">
              LingoCoon collects the following data when you use the app:
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              <li>Email address and login provider (Google or email/password)</li>
              <li>Profile: nickname, native language, target language, learning level</li>
              <li>Flashcard decks and cards you create</li>
              <li>Study progress and learning statistics</li>
              <li>Voice audio when you use speech features — sent to a third-party AI provider for processing, not stored by LingoCoon</li>
              <li>Chat messages sent to the AI assistant — processed by a third-party AI provider</li>
            </ul>
          </section>

          <section id="how-we-use-it" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">3. How your data is used</h2>
            <p className="leading-relaxed text-gray-600">
              LingoCoon uses your data solely to provide and improve the app. I do not sell your data,
              use it for advertising, or share it with third parties except as described in section 4.
            </p>
          </section>

          <section id="third-parties" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">4. Third parties</h2>
            <p className="leading-relaxed text-gray-600">
              LingoCoon uses third-party AI providers for speech recognition and AI features,
              and cloud infrastructure providers for hosting and database.
              These providers receive only the data necessary to perform their function
              and are contractually bound to protect it.
            </p>
          </section>

          <section id="your-rights" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">5. Your rights</h2>
            <p className="mb-4 leading-relaxed text-gray-600">Under GDPR you have the right to access,
              correct, or delete your personal data at any time.
              To exercise these rights, contact me at{' '}
              <a href="mailto:lingocoon.info@gmail.com" className="text-black underline">lingocoon.info@gmail.com</a>
              . I will respond as soon as possible.
            </p>
          </section>

          <section id="contact" className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-black">6. Contact</h2>
            <p className="mb-4 leading-relaxed text-gray-600">For any privacy-related questions, contact me at{' '}
              <a href="mailto:lingocoon.info@gmail.com" className="text-black underline">lingocoon.info@gmail.com</a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 