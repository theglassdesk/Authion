"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Page, KanbanData, KanbanColumn, KanbanTask } from '@/lib/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { Plus, GripVertical, Trash2 } from 'lucide-react';

export function KanbanView({ page }: { page: Page }) {
  const { updatePage } = useAppStore();
  
  const data: KanbanData | null = React.useMemo(() => {
    try {
      return page.content ? JSON.parse(page.content) : null;
    } catch (e) {
      console.error("Failed to parse kanban data", e);
      return null;
    }
  }, [page.content]);

  const saveData = (newData: KanbanData) => {
    updatePage(page.id, { content: JSON.stringify(newData) });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || !data) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      saveData({ ...data, columnOrder: newColumnOrder });
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      
      const newColumn = { ...start, taskIds: newTaskIds };
      saveData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn }
      });
      return;
    }

    // Move between columns
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    saveData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });
  };

  const addTask = (columnId: string) => {
    if (!data) return;
    const newTaskId = uuidv4();
    const newTask: KanbanTask = { id: newTaskId, content: 'New Task' };
    
    const column = data.columns[columnId];
    const newColumn = { ...column, taskIds: [...column.taskIds, newTaskId] };

    saveData({
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: { ...data.columns, [columnId]: newColumn }
    });
  };

  const updateTask = (taskId: string, content: string) => {
    if (!data) return;
    saveData({
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: { ...data.tasks[taskId], content }
      }
    });
  };

  const addColumn = () => {
    if(!data) return;
    const newColId = uuidv4();
    saveData({
      ...data,
      columns: {
        ...data.columns,
        [newColId]: { id: newColId, title: 'New Column', taskIds: [] }
      },
      columnOrder: [...data.columnOrder, newColId]
    });
  };

  const updatePageTitle = (newTitle: string) => updatePage(page.id, { title: newTitle });

  if (!data) return <div className="p-8 text-slate-500">Loading Kanban...</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-8 overflow-hidden">
      <input 
        type="text" 
        value={page.title}
        onChange={(e) => updatePageTitle(e.target.value)}
        className="text-4xl font-bold bg-transparent text-slate-900 dark:text-slate-100 outline-none placeholder-slate-300 dark:placeholder-slate-700 w-full mb-8 shrink-0"
        placeholder="Board Title"
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex items-start space-x-4 h-full overflow-x-auto pb-8"
            >
              {data.columnOrder.map((columnId, index) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map(taskId => data.tasks[taskId]).filter(Boolean);

                return (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-slate-50 dark:bg-slate-800/80 rounded-lg shrink-0 w-72 flex flex-col max-h-full border border-slate-200 dark:border-slate-700"
                      >
                        <div 
                          {...provided.dragHandleProps} 
                          className="px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 cursor-grab"
                        >
                          <input 
                            value={column.title}
                            onChange={(e) => {
                              saveData({
                                ...data,
                                columns: {
                                  ...data.columns,
                                  [column.id]: { ...column, title: e.target.value }
                                }
                              });
                            }}
                            className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-none flex-1"
                          />
                          <span className="text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
                            {tasks.length}
                          </span>
                        </div>

                        <Droppable droppableId={column.id} type="task">
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                            >
                              {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`mb-2 bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab flex group transition-shadow ${snapshot.isDragging ? 'shadow-md border-indigo-500 ring-1 ring-indigo-500' : 'hover:border-slate-300 dark:hover:border-slate-500'}`}
                                    >
                                      <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-500 mr-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <textarea 
                                        value={task.content}
                                        onChange={(e) => updateTask(task.id, e.target.value)}
                                        className="w-full resize-none outline-none text-sm bg-transparent text-slate-700 dark:text-slate-300"
                                        rows={2}
                                        placeholder="Task description..."
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                          <button 
                            onClick={() => addTask(column.id)}
                            className="flex items-center text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 w-full px-2 py-1.5 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Task
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              <button 
                onClick={addColumn}
                className="shrink-0 w-72 h-12 flex items-center justify-center text-sm font-medium text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 hover:text-slate-700 dark:hover:border-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Column
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
