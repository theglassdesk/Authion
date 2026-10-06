"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Page, GridData, GridColumn, GridRow } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, MoreHorizontal } from 'lucide-react';

export function GridView({ page }: { page: Page }) {
  const { updatePage } = useAppStore();
  
  const data: GridData | null = React.useMemo(() => {
    try {
      return page.content ? JSON.parse(page.content) : null;
    } catch (e) {
      console.error("Failed to parse grid data", e);
      return null;
    }
  }, [page.content]);

  const saveData = (newData: GridData) => {
    updatePage(page.id, { content: JSON.stringify(newData) });
  };

  const addRow = () => {
    if (!data) return;
    const newRow: GridRow = { id: uuidv4(), cells: {} };
    saveData({ ...data, rows: [...data.rows, newRow] });
  };

  const updateCell = (rowId: string, colId: string, value: any) => {
    if (!data) return;
    const newRows = data.rows.map(row => {
      if (row.id === rowId) {
        return { ...row, cells: { ...row.cells, [colId]: value } };
      }
      return row;
    });
    saveData({ ...data, rows: newRows });
  };

  const addColumn = () => {
    if (!data) return;
    const newColId = uuidv4();
    const newCol: GridColumn = { id: newColId, title: 'New Column', type: 'text' };
    saveData({ ...data, columns: [...data.columns, newCol] });
  };

  const updatePageTitle = (newTitle: string) => updatePage(page.id, { title: newTitle });

  if (!data) return <div className="p-8 text-slate-500">Loading Grid...</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-8 overflow-hidden">
      <input 
        type="text" 
        value={page.title}
        onChange={(e) => updatePageTitle(e.target.value)}
        className="text-4xl font-bold bg-transparent text-slate-900 dark:text-slate-100 outline-none placeholder-slate-300 dark:placeholder-slate-700 w-full mb-8 shrink-0"
        placeholder="Database Title"
      />

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full min-w-max text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              {data.columns.map(col => (
                <th key={col.id} className="relative px-4 py-3 font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 last:border-0 min-w-[150px]">
                  <input 
                    value={col.title}
                    onChange={(e) => {
                      const newCols = data.columns.map(c => c.id === col.id ? { ...c, title: e.target.value } : c);
                      saveData({ ...data, columns: newCols });
                    }}
                    className="bg-transparent outline-none w-full font-semibold"
                  />
                </th>
              ))}
              <th className="px-4 py-3 w-10">
                <button onClick={addColumn} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 group">
                {data.columns.map(col => (
                  <td key={col.id} className="p-0 border-r border-slate-100 dark:border-slate-800/50 last:border-0 relative">
                    {col.type === 'status' ? (
                      <select 
                        value={row.cells[col.id] || ''}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        className="w-full h-full p-3 bg-transparent outline-none appearance-none text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="">-</option>
                        {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input 
                        className="w-full h-full p-3 bg-transparent outline-none text-slate-700 dark:text-slate-300"
                        value={row.cells[col.id] || ''}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        placeholder="Empty"
                      />
                    )}
                  </td>
                ))}
                <td className="w-10"></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 sticky left-0 text-left bg-white dark:bg-slate-900">
          <button 
            onClick={addRow}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> New Row
          </button>
        </div>
      </div>
    </div>
  );
}
