"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  Edit3,
  Quote,
  Minus,
  Wand2,
  Check,
  Download
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Page } from '@/lib/types';
import { ensureHtmlContent, htmlToMarkdown, downloadMarkdownFile } from '@/lib/utils';

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: any) => void;
}

export function DocumentView({ page }: { page: Page }) {
  const { updatePage, aiSettings } = useAppStore();
  const [mode, setMode] = useState<'edit' | 'read'>('edit');
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNotification, setAiNotification] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slash menu state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slashRangeRef = useRef<{ from: number; to: number } | null>(null);

  // Floating selection bubble menu state
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number; show: boolean }>({ top: 0, left: 0, show: false });

  const slashCommands: SlashCommandItem[] = useMemo(() => [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['h1', 'heading', 'title', 'large'],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small subsection heading',
      icon: <Heading3 className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['h3', 'heading', 'small'],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: 'todo',
      title: 'To-do List',
      description: 'Interactive checklist with checkboxes',
      icon: <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      keywords: ['todo', 'task', 'check', 'checkbox', 'list'],
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'bullet',
      title: 'Bulleted List',
      description: 'Standard bulleted list',
      icon: <List className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['bullet', 'list', 'unordered'],
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'number',
      title: 'Numbered List',
      description: 'Sequential ordered list',
      icon: <ListOrdered className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['number', 'ordered', 'list', '1.'],
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Capture a notable quote or callout',
      icon: <Quote className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['quote', 'callout', 'cite'],
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Code snippet with monospace formatting',
      icon: <Code className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['code', 'pre', 'snippet'],
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'divider',
      title: 'Divider',
      description: 'Horizontal rule dividing content',
      icon: <Minus className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['divider', 'hr', 'line', 'rule', 'separator'],
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
    {
      id: 'image',
      title: 'Image',
      description: 'Embed an image via web URL',
      icon: <ImageIcon className="w-4 h-4 text-slate-700 dark:text-slate-200" />,
      keywords: ['image', 'photo', 'picture', 'url', 'img'],
      action: (ed) => {
        const url = window.prompt('Enter image URL:');
        if (url) {
          ed.chain().focus().setImage({ src: url }).run();
        }
      },
    },
    {
      id: 'ai-assist',
      title: 'Ask AI Writer',
      description: 'Brainstorm or continue text with AI',
      icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      keywords: ['ai', 'ask', 'generate', 'write', 'sparkles'],
      action: (ed) => {
        ed.chain().focus().insertContent('<p><em>AI: Drafting suggestions...</em></p>').run();
      },
    },
    {
      id: 'export-md',
      title: 'Export as Markdown',
      description: 'Download this document locally as a .md file',
      icon: <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      keywords: ['export', 'markdown', 'md', 'download', 'save'],
      action: (ed) => {
        const md = htmlToMarkdown(ed.getHTML());
        downloadMarkdownFile(page.title || 'document', md);
      },
    },
  ], [page.title]);

  const filteredCommands = useMemo(() => {
    if (!slashQuery.trim()) return slashCommands;
    const q = slashQuery.toLowerCase().trim();
    return slashCommands.filter(
      cmd => cmd.title.toLowerCase().includes(q) || cmd.keywords.some(k => k.includes(q))
    );
  }, [slashCommands, slashQuery]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing...",
        emptyEditorClass: 'is-editor-empty',
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: ensureHtmlContent(page.content),
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg dark:prose-invert max-w-none outline-none focus:outline-none min-h-[500px] pb-32 text-slate-800 dark:text-slate-100',
      },
      handleKeyDown: (view, event) => {
        if (!slashMenuOpen) return false;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          return true;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          setSlashMenuOpen(false);
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        updatePage(page.id, { content: html });
      }, 700);

      // Check slash command trigger
      const { selection } = ed.state;
      const { $head } = selection;
      const lineText = $head.parent.textBetween(0, $head.parentOffset);
      const lastSlashIdx = lineText.lastIndexOf('/');

      if (lastSlashIdx !== -1) {
        const query = lineText.slice(lastSlashIdx + 1);
        // If there are no spaces in the query, it's an active slash search
        if (!query.includes(' ') && query.length < 20) {
          const coords = ed.view.coordsAtPos($head.pos);
          setSlashPos({
            top: coords.bottom + 6,
            left: Math.max(16, coords.left),
          });
          setSlashQuery(query);
          slashRangeRef.current = {
            from: $head.pos - query.length - 1,
            to: $head.pos,
          };
          setSlashMenuOpen(true);
          setSelectedIndex(0);
          return;
        }
      }

      setSlashMenuOpen(false);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to, empty } = ed.state.selection;
      if (empty || mode !== 'edit') {
        setBubblePos(prev => ({ ...prev, show: false }));
        return;
      }

      const coords = ed.view.coordsAtPos(from);
      setBubblePos({
        top: Math.max(10, coords.top - 48),
        left: Math.max(20, coords.left),
        show: true,
      });
    },
  });

  // Re-sync editor content if we switch pages
  useEffect(() => {
    if (editor) {
      const sanitized = ensureHtmlContent(page.content);
      if (editor.getHTML() !== sanitized) {
        editor.commands.setContent(sanitized);
      }
    }
  }, [page.id, editor, page.content]);

  // Set editable mode
  useEffect(() => {
    if (editor) {
      editor.setEditable(mode === 'edit');
    }
  }, [mode, editor]);

  const executeCommand = useCallback((cmd: SlashCommandItem) => {
    if (!editor) return;

    if (slashRangeRef.current) {
      editor
        .chain()
        .focus()
        .deleteRange(slashRangeRef.current)
        .run();
    }
    cmd.action(editor);
    setSlashMenuOpen(false);
    setSlashQuery("");
    slashRangeRef.current = null;
  }, [editor]);

  const handleAskAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPrompt;
    if (!promptToSend.trim() || !editor) return;
    setIsAiLoading(true);
    setAiNotification(null);

    try {
      const textContext = editor.getText();
      let generatedText = "";

      if (aiSettings.provider === 'Local') {
        // Direct local LLM fetch (e.g. Ollama) from client browser for privacy
        const endpoint = aiSettings.localEndpoint || 'http://localhost:11434';
        const res = await fetch(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiSettings.model || 'llama3',
            prompt: `You are an expert writing assistant for "${page.title}". Context:\n${textContext}\n\nTask: ${promptToSend}`,
            stream: false,
          }),
        });

        if (!res.ok) {
          throw new Error(`Local model error at ${endpoint}. Make sure Ollama or LM Studio is running.`);
        }
        const data = await res.json();
        generatedText = data.response || data.text || '';
      } else {
        // Server proxy for Gemini, OpenAI, or OpenRouter
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an expert workspace assistant for a document titled "${page.title}".\n\nCurrent Document Content:\n${textContext}\n\nUser Instruction:\n${promptToSend}\n\nRespond with clean, professional prose or formatted markdown that can be directly added to the document. Do not include markdown code block backticks around the whole answer.`,
            model: aiSettings.model,
            provider: aiSettings.provider,
            apiKey: aiSettings.apiKey,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'AI generation failed');
        generatedText = data.text;
      }

      // Convert generated text to HTML and insert into editor
      const htmlToAdd = ensureHtmlContent(generatedText);
      editor.chain().focus().insertContent(htmlToAdd).run();
      setAiPrompt("");
      setAiNotification("AI response inserted into document!");
      setTimeout(() => setAiNotification(null), 3000);
    } catch (e: any) {
      console.error(e);
      setAiNotification(`Error: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const markdown = htmlToMarkdown(currentHtml);
    downloadMarkdownFile(page.title || 'document', markdown);
    setAiNotification(`Exported "${page.title || 'document'}.md"`);
    setTimeout(() => setAiNotification(null), 3000);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="max-w-4xl mx-auto w-full px-8 md:px-16 py-10 flex flex-col h-full bg-white dark:bg-slate-900 border-x border-slate-100 dark:border-slate-800 shadow-sm relative overflow-y-auto"
    >
      {/* Top Header: Title, Export Markdown & Edit/Read Switch */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <input 
          type="text" 
          value={page.title}
          onChange={(e) => updatePage(page.id, { title: e.target.value })}
          className="text-3xl md:text-4xl font-bold bg-transparent text-slate-900 dark:text-slate-100 outline-none placeholder-slate-300 dark:placeholder-slate-700 w-full tracking-tight"
          placeholder="Untitled page..."
        />
        <div className="flex items-center space-x-2 shrink-0 ml-4">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Download document as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export .md</span>
          </button>
          <button 
            onClick={() => setMode(mode === 'edit' ? 'read' : 'edit')}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            {mode === 'edit' ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{mode === 'edit' ? 'Reading Mode' : 'Edit Mode'}</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Bar */}
      {mode === 'edit' && (
        <div className="mb-6 shrink-0">
          <div className="flex items-center space-x-2 bg-indigo-50/70 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1.5" />
            <input 
              type="text"
              placeholder={`Ask AI (${aiSettings.provider}: ${aiSettings.model || 'default'}) to write, outline, or edit...`}
              className="flex-1 bg-transparent text-xs md:text-sm outline-none px-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              disabled={isAiLoading}
            />
            <button 
              onClick={() => handleAskAI()}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-xs shrink-0 flex items-center space-x-1"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Writing...' : 'Generate'}</span>
            </button>
          </div>

          {/* Quick AI Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Prompts:</span>
            {[
              "Summarize key points",
              "Continue drafting next section",
              "Extract action items into tasks",
              "Fix grammar and polish tone",
              "Brainstorm 3 novel plot ideas"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleAskAI(chip)}
                disabled={isAiLoading}
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {aiNotification && (
            <div className="mt-2 text-xs px-2 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-800 flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{aiNotification}</span>
            </div>
          )}
        </div>
      )}

      {/* Editor Main Content */}
      <div className="flex-1 relative pb-28">
        <EditorContent editor={editor} className="h-full" />

        {/* Floating Bubble Formatting Toolbar */}
        {bubblePos.show && mode === 'edit' && (
          <div 
            className="fixed z-40 flex items-center bg-slate-900 text-white rounded-lg shadow-xl px-1.5 py-1 space-x-0.5 border border-slate-700 text-xs animate-in fade-in"
            style={{ top: bubblePos.top, left: bubblePos.left }}
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('code') ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="H1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="H2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('taskList') ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
              title="To-do List"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Notion-style Slash Command Menu Popup */}
        {slashMenuOpen && mode === 'edit' && (
          <div 
            className="fixed z-50 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl overflow-hidden w-72 max-h-80 animate-in fade-in zoom-in-95"
            style={{ 
              top: Math.min(window.innerHeight - 340, slashPos.top), 
              left: Math.min(window.innerWidth - 300, slashPos.left) 
            }}
          >
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span>Basic Blocks</span>
              {slashQuery && <span className="text-indigo-600 font-mono">/{slashQuery}</span>}
            </div>

            <div className="overflow-y-auto p-1 space-y-0.5 max-h-64">
              {filteredCommands.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-400 text-center">
                  No matching blocks found
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedIndex === idx 
                        ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-900 dark:text-white' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 mr-3 shadow-2xs">
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-tight">{cmd.title}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{cmd.description}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 flex justify-between">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Cancel</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
