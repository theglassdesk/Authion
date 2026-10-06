import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Page, KanbanData, GridData, AISettings } from './types';
import { v4 as uuidv4 } from 'uuid';
import { ensureHtmlContent } from './utils';

interface AppState {
  pages: Record<string, Page>;
  activePageId: string | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  aiSettings: AISettings;
  createPage: (title: string, type: Page['type'], parentId?: string | null) => string;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  setActivePage: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  importSharedPage: (page: Page) => void;
  setAiSettings: (settings: Partial<AISettings>) => void;
}

const defaultWelcomePageId = 'welcome-page-default-id';

const defaultWelcomePageHtml = `<h1>Welcome to Authion</h1>
<p>Authion is a local-first, open-source alternative to Notion and AppFlowy crafted specifically for writers, researchers, and creators.</p>
<h2>✨ Core Capabilities</h2>
<ul>
  <li><p><strong>Local-First Storage</strong>: All documents, databases, and Kanban boards stay securely in your browser's local storage.</p></li>
  <li><p><strong>Markdown Export</strong>: Export any document anytime as a clean <code>.md</code> file to back up or use with other tools.</p></li>
  <li><p><strong>Privacy Focused</strong>: Connect to private local LLMs (Ollama) or secure cloud providers (Gemini, OpenAI, OpenRouter).</p></li>
  <li><p><strong>Modular Blocks</strong>: Type <code>/</code> anywhere on a blank line to insert headings, task lists, code, and images.</p></li>
</ul>
<h2>📋 Getting Started Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Launch Authion workspace</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Try the Slash Command Menu by typing <code>/</code></p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Export your document as a Markdown file (.md)</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Create a new Kanban Board or Database from the sidebar</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Configure your AI provider in the AI Tools dialog</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Share a page via compressed snapshot URL</p></div></li>
</ul>
<blockquote><p>"The scariest moment is always just before you start. After that, things can only get better." — Stephen King</p></blockquote>`;

const defaultWelcomePage: Page = {
  id: defaultWelcomePageId,
  title: 'Welcome to Authion',
  icon: '👋',
  type: 'document',
  parentId: null,
  content: defaultWelcomePageHtml,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      pages: {
        [defaultWelcomePageId]: defaultWelcomePage,
      },
      activePageId: defaultWelcomePageId,
      sidebarOpen: true,
      theme: 'light',
      aiSettings: {
        provider: 'Google',
        model: 'gemini-2.5-flash',
        apiKey: '',
        localEndpoint: 'http://localhost:11434',
      },

      createPage: (title, type, parentId = null) => {
        const id = uuidv4();
        
        let initialContent = '';
        if (type === 'kanban') {
          const initData: KanbanData = {
            tasks: {},
            columns: {
              'todo': { id: 'todo', title: 'To Do', taskIds: [] },
              'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
              'done': { id: 'done', title: 'Done', taskIds: [] }
            },
            columnOrder: ['todo', 'in-progress', 'done']
          };
          initialContent = JSON.stringify(initData);
        } else if (type === 'grid') {
          const initData: GridData = {
            columns: [
              { id: 'title', title: 'Name', type: 'text' },
              { id: 'status', title: 'Status', type: 'status', options: ['To Do', 'In Progress', 'Done'] },
              { id: 'date', title: 'Date', type: 'date' }
            ],
            rows: []
          };
          initialContent = JSON.stringify(initData);
        }

        const newPage: Page = {
          id,
          title,
          type,
          parentId,
          content: initialContent,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          pages: { ...state.pages, [id]: newPage },
          activePageId: id,
        }));
        
        return id;
      },

      updatePage: (id, updates) => set((state) => {
        const page = state.pages[id];
        if (!page) return state;
        return {
          pages: {
            ...state.pages,
            [id]: { ...page, ...updates, updatedAt: Date.now() }
          }
        };
      }),

      deletePage: (id) => set((state) => {
        const newPages = { ...state.pages };
        
        // simple recursive delete for children
        const toDelete = [id];
        let i = 0;
        while (i < toDelete.length) {
          const currentId = toDelete[i];
          Object.values(newPages).forEach(p => {
            if (p.parentId === currentId && !toDelete.includes(p.id)) {
              toDelete.push(p.id);
            }
          });
          i++;
        }

        toDelete.forEach(dictId => delete newPages[dictId]);

        return {
          pages: newPages,
          activePageId: state.activePageId === id ? null : state.activePageId
        };
      }),

      setActivePage: (id) => set({ activePageId: id }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { theme: nextTheme };
      }),
      setTheme: (theme) => set(() => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { theme };
      }),
      
      importSharedPage: (page) => set((state) => {
        // give it a new ID to avoid collisions
        const newId = uuidv4();
        const newPage = { ...page, id: newId, parentId: null };
        return {
          pages: { ...state.pages, [newId]: newPage },
          activePageId: newId
        };
      }),

      setAiSettings: (settings) => set((state) => ({
        aiSettings: { ...state.aiSettings, ...settings }
      })),
    }),
    {
      name: 'flowy-web-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (typeof document !== 'undefined') {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        if (!state.pages) return;
        let changed = false;
        const newPages = { ...state.pages };
        Object.keys(newPages).forEach((id) => {
          const page = newPages[id];
          if (page.type === 'document' && page.content) {
            const html = ensureHtmlContent(page.content);
            if (html !== page.content) {
              newPages[id] = { ...page, content: html };
              changed = true;
            }
          }
        });
        if (changed) {
          state.pages = newPages;
        }
      },
    }
  )
);
