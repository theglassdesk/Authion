import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Authion - Open-source Local-first Workspace for Writers',
  description: 'An open-source, local-first alternative to Notion and AppFlowy with rich modular blocks, Kanban, databases, and private AI.',
  openGraph: {
    title: 'Authion - Open-source Local-first Workspace',
    description: 'An open-source, local-first alternative to Notion and AppFlowy with rich modular blocks, Kanban, databases, and private AI.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
