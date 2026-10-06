"use client";

import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ClientOnly } from '@/components/ClientOnly';
import { useEffect } from 'react';
import LZString from 'lz-string';

const DocumentView = dynamic(() => import('@/components/views/DocumentView').then(mod => mod.DocumentView), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading document editor...</div>
});

const KanbanView = dynamic(() => import('@/components/views/KanbanView').then(mod => mod.KanbanView), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading Kanban board...</div>
});

const GridView = dynamic(() => import('@/components/views/GridView').then(mod => mod.GridView), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading database table...</div>
});

export default function Home() {
  const { pages, activePageId, sidebarOpen, importSharedPage, theme } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    // Check for shared page in URL
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const page = JSON.parse(decompressed);
          importSharedPage(page);
          // clear url
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to parse shared page data", err);
      }
    }
  }, [importSharedPage]);

  const activePage = activePageId ? pages[activePageId] : null;

  return (
    <ClientOnly fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500 bg-[#F5F7F9]">Loading Authion...</div>}>
      <div className="flex flex-row h-screen w-full bg-[#F5F7F9] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          <TopBar />
          
          <div className="flex-1 overflow-auto">
            {activePage ? (
              activePage.type === 'document' ? (
                <DocumentView page={activePage} key={activePage.id} />
              ) : activePage.type === 'kanban' ? (
                <KanbanView page={activePage} key={activePage.id} />
              ) : activePage.type === 'grid' ? (
                <GridView page={activePage} key={activePage.id} />
              ) : (
                <div className="p-8 text-slate-500">View not supported</div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400">
                <span className="text-4xl mb-4">🍃</span>
                <p>Select a page or create a new one.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ClientOnly>
  );
}
