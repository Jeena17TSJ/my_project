import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'DentalCare Dental Clinic',
  description: 'Professional dental care in Bengaluru',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatbotWidget />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
