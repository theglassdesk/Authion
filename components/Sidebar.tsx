"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  FileText, 
  Library,
  KanbanSquare,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  TableProperties,
  LayoutTemplate
} from 'lucide-react';
import { Page, ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TemplatesModal } from './modals/TemplatesModal';

export function Sidebar() {
  const { pages, activePageId, setActivePage, createPage, deletePage } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const rootPages = Object.values(pages).filter(p => !p.parentId);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentIcon = (type: ViewType) => {
    if (type === 'document') return <FileText className="w-4 h-4" />;
    if (type === 'kanban') return <KanbanSquare className="w-4 h-4" />;
    if (type === 'grid') return <TableProperties className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleCreatePage = (type: ViewType) => {
    const defaultTitles = {
      'document': 'Untitled Document',
      'kanban': 'New Board',
      'grid': 'New Database'
    };
    createPage(defaultTitles[type], type);
  };

  const renderPageTree = (page: Page, level = 0) => {
    const children = Object.values(pages).filter(p => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded[page.id];
    const isActive = activePageId === page.id;

    return (
      <div key={page.id} className="w-full">
        <div 
          onClick={() => setActivePage(page.id)}
          style={{ paddingLeft: `${ level * 12 + 12 }px` }}
          className={cn(
            "group flex items-center justify-between py-2 pr-3 cursor-pointer text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-0.5",
            isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-l-2 border-indigo-600" : "text-slate-600 dark:text-slate-400 border-l-2 border-transparent"
          )}
        >
          <div className="flex items-center space-x-2 overflow-hidden pl-2">
            <button 
              onClick={(e) => toggleExpand(page.id, e)}
              className={cn("p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700", hasChildren ? "opacity-100" : "opacity-0")}
              disabled={!hasChildren}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <span className="shrink-0">{page.icon ? page.icon : currentIcon(page.type)}</span>
            <span className="truncate">{page.title}</span>
          </div>
          
          <div className="hidden group-hover:flex items-center space-x-1 shrink-0">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                createPage("Untitled", 'document', page.id);
                setExpanded(prev => ({ ...prev, [page.id]: true }));
              }}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"
              title="Add child page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deletePage(page.id);
              }}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded"
              title="Delete page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {isExpanded && children.length > 0 && (
          <div className="mt-0.5">
            {children.map(child => renderPageTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen flex flex-col">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
          A
        </div>
        <div>
          <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">Authion</span>
          <span className="text-[10px] text-slate-400 font-medium block">Local-first Workspace</span>
        </div>
      </div>

      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspaces</h2>
        
        <div className="flex space-x-2 mb-4">
          <button onClick={() => handleCreatePage('document')} className="flex-1 flex justify-center items-center py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm" title="New Document">
            <FileText className="w-4 h-4" />
          </button>
          <button onClick={() => handleCreatePage('kanban')} className="flex-1 flex justify-center items-center py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm" title="New Kanban">
            <KanbanSquare className="w-4 h-4" />
          </button>
          <button onClick={() => handleCreatePage('grid')} className="flex-1 flex justify-center items-center py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm" title="New Database">
            <TableProperties className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => setShowTemplates(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 mb-4 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Browse Templates</span>
        </button>

        <div className="space-y-1">
          {rootPages.map(page => renderPageTree(page))}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
        <div className="flex items-center justify-between mb-2">
          <span>STORAGE: LOCAL</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
