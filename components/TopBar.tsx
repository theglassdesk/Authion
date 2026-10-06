"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Share, Sparkles, Sidebar as SidebarIcon, Sun, Moon, Download } from 'lucide-react';
import LZString from 'lz-string';
import { AISettingsModal } from './modals/AISettingsModal';
import { htmlToMarkdown, downloadMarkdownFile } from '@/lib/utils';

export function TopBar() {
  const { toggleSidebar, activePageId, pages, aiSettings, theme, toggleTheme } = useAppStore();
  const [showShareCopied, setShowShareCopied] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const activePage = activePageId ? pages[activePageId] : null;

  const handleShare = () => {
    if (!activePage) return;
    
    // Create a shareable URL containing compressed JSON of the page
    const pageData = JSON.stringify(activePage);
    const compressed = LZString.compressToEncodedURIComponent(pageData);
    
    const url = new URL(window.location.href);
    url.searchParams.set('share', compressed);
    
    navigator.clipboard.writeText(url.toString());
    setShowShareCopied(true);
    setTimeout(() => setShowShareCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!activePage || activePage.type !== 'document') return;
    const markdown = htmlToMarkdown(activePage.content || '');
    downloadMarkdownFile(activePage.title || 'document', markdown);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2000);
  };

  return (
    <>
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <SidebarIcon className="w-5 h-5" />
          </button>

          {activePage && (
            <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200 space-x-2">
              <span>{activePage.icon || '📄'}</span>
              <span>{activePage.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {activePage?.type === 'document' && (
            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              title="Export current document as Markdown file (.md)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{showExportToast ? 'Exported!' : 'Export .md'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Share className="w-3.5 h-3.5" />
            <span>{showShareCopied ? 'Copied Link!' : 'Share Page'}</span>
          </button>

          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tools</span>
            <span className="text-[10px] bg-indigo-500/80 px-1.5 py-0.2 rounded font-mono ml-0.5">
              {aiSettings?.provider || 'Google'}
            </span>
          </button>
        </div>
      </div>

      {showAiModal && <AISettingsModal onClose={() => setShowAiModal(false)} />}
    </>
  );
}
