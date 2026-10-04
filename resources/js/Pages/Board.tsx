import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { PlusIcon, SparklesIcon, CheckCircle2Icon, ClockIcon, HashIcon, UsersIcon } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { TaskModal } from '../components/kanban/TaskModal';
import { NewTaskModal } from '../components/kanban/NewTaskModal';
import { AddColumnModal } from '../components/kanban/AddColumnModal';
import { WorkspaceModal } from '../components/workspace/WorkspaceModal';
import { MembersModal } from '../components/workspace/MembersModal';
import type { Board, Column, Task, Priority, BoardSummary, Workspace, User } from '../types/kanban';

type BoardPageProps = {
  board: Board;
  allBoards: BoardSummary[];
  workspace?: Workspace | null;
  allWorkspaces?: Workspace[];
  workspaceMembers?: User[];
  authUser?: User | null;
};

export default function BoardPage({
  board,
  allBoards,
  workspace,
  allWorkspaces = [],
  workspaceMembers = [],
  authUser,
}: BoardPageProps) {
  const [columns, setColumns] = useState<Column[]>(board.columns || []);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Sync columns when server data updates (via Inertia reload/actions)
  useEffect(() => {
    setColumns(board.columns || []);
    if (selectedTask) {
      for (const col of board.columns) {
        const found = col.tasks.find((t) => t.id === selectedTask.id);
        if (found) {
          setSelectedTask(found);
          break;
        }
      }
    }
  }, [board]);

  // Quick Add Task in a specific column
  const handleQuickAddTask = (columnId: number, title: string) => {
    router.post(
      `/boards/${board.id}/tasks`,
      {
        column_id: columnId,
        title,
        priority: 'medium',
      },
      {
        preserveScroll: true,
      }
    );
  };

  // Delete Column
  const handleDeleteColumn = (columnId: number) => {
    if (confirm('Delete this column and all tasks inside it?')) {
      router.delete(`/columns/${columnId}`, {
        preserveScroll: true,
      });
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
  };

  const handleDropTask = (targetColumnId: number) => {
    if (!draggedTask) return;
    if (draggedTask.column_id === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const currentTask = draggedTask;
    setDraggedTask(null);

    // Optimistic UI update
    setColumns((prevCols) => {
      const nextCols = prevCols.map((col) => ({
        ...col,
        tasks: [...col.tasks],
      }));

      // Remove from old column
      const sourceCol = nextCols.find((c) => c.id === currentTask.column_id);
      if (sourceCol) {
        sourceCol.tasks = sourceCol.tasks.filter((t) => t.id !== currentTask.id);
      }

      // Add to new column
      const destCol = nextCols.find((c) => c.id === targetColumnId);
      if (destCol) {
        const updatedTask = {
          ...currentTask,
          column_id: targetColumnId,
          order: destCol.tasks.length + 1,
        };
        destCol.tasks.push(updatedTask);
      }

      return nextCols;
    });

    // Send backend move request
    router.post(
      `/tasks/${currentTask.id}/move`,
      {
        column_id: targetColumnId,
        order: 9999,
      },
      {
        preserveScroll: true,
        preserveState: true,
      }
    );
  };

  // Filter tasks per column based on search & priority filter
  const filteredColumns = useMemo(() => {
    return columns.map((col) => {
      const filteredTasks = col.tasks.filter((task) => {
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchKey = task.task_key.toLowerCase().includes(q);
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchLabels = task.labels?.some((l) => l.toLowerCase().includes(q));
          const matchAssignee = task.assignee_name?.toLowerCase().includes(q);
          return matchKey || matchTitle || matchLabels || matchAssignee;
        }

        return true;
      });

      return {
        ...col,
        tasks: filteredTasks,
      };
    });
  }, [columns, searchQuery, selectedPriority]);

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const doneColumn = columns.find((c) => c.title.toLowerCase().includes('done'));
  const completedTasks = doneColumn ? doneColumn.tasks.length : 0;

  return (
    <div className="flex h-screen flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden select-none">
      <Head title={`${board.title} — গুছাও (Guchao)`} />

      {/* Top Navbar */}
      <Navbar
        board={board}
        workspace={workspace}
        allWorkspaces={allWorkspaces}
        membersCount={workspaceMembers.length}
        authUser={authUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        onOpenAddColumnModal={() => setIsAddColumnModalOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
      />

      {/* Sub-header / Board Stats Bar */}
      <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/60 px-6 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono">
            <HashIcon className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-slate-300 font-semibold">Prefix:</span>
            <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-brand-300 font-bold">
              {board.prefix}-*
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5 text-slate-500" />
            <span>Total Tasks:</span>
            <span className="font-semibold text-slate-200">{totalTasks}</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Completed:</span>
            <span className="font-semibold text-emerald-400">{completedTasks}</span>
          </div>

          {workspace && (
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-brand-300 transition-colors"
            >
              <UsersIcon className="h-3.5 w-3.5 text-brand-400" />
              <span>Workspace:</span>
              <span className="font-medium text-slate-200 underline decoration-slate-700 underline-offset-2">
                {workspace.name}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <SparklesIcon className="h-3 w-3 text-amber-400" />
            Drag & drop cards across columns to reorder
          </span>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full items-start gap-4">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
              onSelectTask={(task) => setSelectedTask(task)}
              onAddTask={handleQuickAddTask}
              onDeleteColumn={handleDeleteColumn}
              onDragStart={handleDragStart}
              onDropTask={handleDropTask}
            />
          ))}

          {/* Add Another List / Column Button */}
          <div className="w-[280px] shrink-0">
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-4 text-xs font-semibold text-slate-400 hover:border-brand-500/50 hover:bg-slate-900/60 hover:text-brand-300 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add another list</span>
            </button>
          </div>
        </div>
      </main>

      {/* Task Details / Edit Modal */}
      <TaskModal
        task={selectedTask}
        members={workspaceMembers}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* New Task Modal */}
      <NewTaskModal
        board={board}
        members={workspaceMembers}
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />

      {/* Add Column Modal */}
      <AddColumnModal
        board={board}
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
      />

      {/* Create Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      {/* Workspace Members Modal */}
      <MembersModal
        workspace={workspace || null}
        members={workspaceMembers}
        currentUser={authUser || null}
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </div>
  );
}
