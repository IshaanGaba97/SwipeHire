import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
    title: 'SwipeHire — AI-Powered Job Matching',
    description: 'Swipe your way to your dream job. AI-powered resume analysis, job matching, and interviews.',
    keywords: ['jobs', 'hiring', 'AI', 'swipe', 'recruitment', 'career'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
