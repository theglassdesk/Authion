"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { FileText, KanbanSquare, TableProperties, X, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const TEMPLATES = [
  {
    id: 'book-project',
    name: 'Book Project (Novel)',
    icon: '📖',
    description: 'Complete author suite with chapter breakdown, character database, and plot board.',
    parentContent: `<h1>Novel Production Suite</h1><p>Welcome to your complete novel crafting hub. Use the child pages on the sidebar to structure your chapters, track character development, and outline the three-act plot curve.</p>`,
    pages: [
      {
        title: 'Story Bible & Worldbuilding',
        type: 'document',
        content: `<h1>Story Bible & World Lore</h1>
<h2>Setting & Geography</h2>
<p>Describe the primary realm, time period, and atmosphere.</p>
<h2>Magic / Tech System Rules</h2>
<ul>
  <li><p><strong>Rule 1</strong>: Magic has a visible physical cost or limitation.</p></li>
  <li><p><strong>Rule 2</strong>: Technological advances depend on rare elemental crystals.</p></li>
</ul>
<h2>Core Theme</h2>
<blockquote><p>"Courage is not the absence of fear, but the triumph over it."</p></blockquote>`
      },
      {
        title: 'Chapter Outline & Checklist',
        type: 'document',
        content: `<h1>Manuscript Progress</h1>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Chapter 1: The Inciting Spark (Drafted)</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Chapter 2: Crossing the Threshold</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Chapter 3: The First Encounter</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Chapter 4: Midpoint Reversal</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Chapter 5: Climax & Clashing Wills</p></div></li>
</ul>`
      },
      {
        title: 'Plot & Narrative Arcs',
        type: 'kanban',
        initFn: () => {
          const col1 = uuidv4();
          const col2 = uuidv4();
          const col3 = uuidv4();
          const col4 = uuidv4();
          const t1 = uuidv4();
          const t2 = uuidv4();
          return JSON.stringify({
            tasks: {
              [t1]: { id: t1, content: 'Hero discovers the ancient map in the family cellar' },
              [t2]: { id: t2, content: 'Mentor is captured by royal guards' }
            },
            columns: {
              [col1]: { id: col1, title: 'Act I: Setup', taskIds: [t1] },
              [col2]: { id: col2, title: 'Act II: Rising Action', taskIds: [t2] },
              [col3]: { id: col3, title: 'Midpoint Crisis', taskIds: [] },
              [col4]: { id: col4, title: 'Act III: Climax', taskIds: [] }
            },
            columnOrder: [col1, col2, col3, col4]
          });
        }
      },
      {
        title: 'Character Roster',
        type: 'grid',
        initFn: () => {
          return JSON.stringify({
            columns: [
              { id: 'name', title: 'Character Name', type: 'text' },
              { id: 'role', title: 'Story Role', type: 'status', options: ['Protagonist', 'Antagonist', 'Mentor', 'Sidekick', 'Wildcard'] },
              { id: 'motivation', title: 'Internal Motivation', type: 'text' },
              { id: 'status', title: 'Arc Status', type: 'status', options: ['Living', 'Endangered', 'Redeemed', 'Fallen'] }
            ],
            rows: [
              { id: uuidv4(), cells: { name: 'Aria Vance', role: 'Protagonist', motivation: 'Uncover her family heritage', status: 'Living' } },
              { id: uuidv4(), cells: { name: 'Lord Malakor', role: 'Antagonist', motivation: 'Reclaim the fallen dynasty', status: 'Living' } }
            ]
          });
        }
      }
    ]
  },
  {
    id: 'author-workspace',
    name: 'Author Workspace',
    icon: '📝',
    description: 'A focused workspace for draft writing, daily word count, and character ideation.',
    parentContent: `<h1>Author Workspace</h1><p>Organize your writing habit, daily targets, and research materials in one private space.</p>`,
    pages: [
      {
        title: 'Daily Writing Log',
        type: 'document',
        content: `<h1>Daily Writing Tracker</h1>
<p>Track your creative momentum and word count targets.</p>
<h2>Weekly Target: 5,000 Words</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Monday: 1,200 words — Chapter 3 intro</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Tuesday: 1,000 words — Dialogue polish</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Wednesday: 800 words — Action beat</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Thursday: 1,000 words — Revision</p></div></li>
</ul>`
      },
      {
        title: 'Character Brainstorm',
        type: 'kanban',
        initFn: () => {
          const col1Id = uuidv4();
          const col2Id = uuidv4();
          const col3Id = uuidv4();
          return JSON.stringify({
            tasks: {},
            columns: {
              [col1Id]: { id: col1Id, title: 'Protagonists', taskIds: [] },
              [col2Id]: { id: col2Id, title: 'Antagonists', taskIds: [] },
              [col3Id]: { id: col3Id, title: 'Supporting Cast', taskIds: [] }
            },
            columnOrder: [col1Id, col2Id, col3Id]
          });
        }
      }
    ]
  },
  {
    id: 'marketing-plan',
    name: 'Marketing Plan',
    icon: '🚀',
    description: 'Manage book launch campaigns, asset production, and rollout schedules.',
    parentContent: `<h1>Book Launch & Marketing Plan</h1><p>Coordinate press releases, newsletter campaigns, ARC reviews, and social media blitzes.</p>`,
    pages: [
      {
        title: 'Launch Strategy',
        type: 'document',
        content: `<h1>Book Launch Strategy</h1>
<h2>Key Objectives</h2>
<ul>
  <li><p>Secure 50 verified reader reviews within first 14 days of launch.</p></li>
  <li><p>Host virtual launch Q&amp;A on YouTube and Discord.</p></li>
  <li><p>Run newsletter swap promotion with 3 fantasy authors.</p></li>
</ul>
<h2>Launch Milestones</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Finalize cover design and typography</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Send ARC review copies to influencers</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Schedule countdown teasers on Instagram &amp; X</p></div></li>
</ul>`
      },
      {
        title: 'Content Pipeline',
        type: 'kanban',
        initFn: () => {
          const col1Id = uuidv4();
          const col2Id = uuidv4();
          const col3Id = uuidv4();
          const t1 = uuidv4();
          return JSON.stringify({
            tasks: {
              [t1]: { id: t1, content: 'Cover Reveal Video Reel' }
            },
            columns: {
              [col1Id]: { id: col1Id, title: 'Idea Backlog', taskIds: [] },
              [col2Id]: { id: col2Id, title: 'In Production', taskIds: [t1] },
              [col3Id]: { id: col3Id, title: 'Published / Live', taskIds: [] }
            },
            columnOrder: [col1Id, col2Id, col3Id]
          });
        }
      },
      {
        title: 'Marketing Budget',
        type: 'grid',
        initFn: () => {
          return JSON.stringify({
            columns: [
              { id: 'item', title: 'Campaign Item', type: 'text' },
              { id: 'cost', title: 'Budget ($)', type: 'number' },
              { id: 'status', title: 'Approval', type: 'status', options: ['Draft', 'Approved', 'Spent'] }
            ],
            rows: [
              { id: uuidv4(), cells: { item: 'Cover Designer Fee', cost: '450', status: 'Approved' } },
              { id: uuidv4(), cells: { item: 'Sponsored Newsletter Ads', cost: '200', status: 'Draft' } }
            ]
          });
        }
      }
    ]
  }
];

export function TemplatesModal({ onClose }: { onClose: () => void }) {
  const { createPage, updatePage } = useAppStore();

  const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
    // Create parent workspace folder/document
    const parentId = createPage(template.name, 'document');
    updatePage(parentId, { 
      icon: template.icon, 
      content: template.parentContent || `<h1>${template.name}</h1><p>${template.description}</p>` 
    });

    // Create child pages
    template.pages.forEach(p => {
      const childId = createPage(p.title, p.type as any, parentId);
      if (p.content) {
        updatePage(childId, { content: p.content });
      } else if (p.initFn) {
        updatePage(childId, { content: p.initFn() });
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Writer Templates & Starter Packs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pre-built multi-page workspaces tailored for authors and creators</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-max overflow-y-auto max-h-[65vh]">
          {TEMPLATES.map(template => (
            <div 
              key={template.id} 
              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white dark:bg-slate-850 flex flex-col justify-between group"
              onClick={() => handleApplyTemplate(template)}
            >
              <div>
                <div className="text-3xl mb-2.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg inline-block border border-slate-100 dark:border-slate-700">
                  {template.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {template.description}
                </p>
              </div>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Includes {template.pages.length} Pages:</div>
                {template.pages.map((p, i) => (
                  <div key={i} className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-1.5">
                    {p.type === 'document' && <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    {p.type === 'kanban' && <KanbanSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    {p.type === 'grid' && <TableProperties className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                    <span className="truncate">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>Click any card to instantiate the template into your workspace.</span>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
