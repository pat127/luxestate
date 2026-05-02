'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  priority: string;
  status: string;
  due: string;
  category: string;
  dueDate?: string;
}

const initialTasks: Task[] = [
  { id: 1, title: 'Follow up with James Harrington', description: 'Send property brochure and schedule viewing', assignee: 'Sarah M.', priority: 'High', status: 'In Progress', due: 'Today', category: 'Lead' },
  { id: 2, title: 'Prepare Meridian Villa listing', description: 'Upload photos and update property details', assignee: 'James C.', priority: 'High', status: 'Todo', due: 'Tomorrow', category: 'Listing' },
  { id: 3, title: 'Send weekly market report', description: 'Compile and send to all active leads', assignee: 'Omar H.', priority: 'Medium', status: 'Todo', due: 'This week', category: 'Marketing' },
  { id: 4, title: 'Update CRM with new leads', description: 'Import leads from last weekend open house', assignee: 'Priya S.', priority: 'Low', status: 'Completed', due: 'Yesterday', category: 'Admin' },
  { id: 5, title: 'Negotiate deal terms — Atlas Tower', description: 'Review counter-offer and prepare response', assignee: 'Sarah M.', priority: 'High', status: 'In Progress', due: 'Today', category: 'Deal' },
  { id: 6, title: 'Schedule team training session', description: 'Book venue and send invites', assignee: 'Admin', priority: 'Low', status: 'Todo', due: 'Next week', category: 'Admin' },
  { id: 7, title: 'Review Q2 commission statements', description: 'Verify all deal commissions are accurate', assignee: 'Admin', priority: 'Medium', status: 'Todo', due: 'This week', category: 'Finance' },
];

const priorityColors: Record<string, string> = {
  High: 'text-red-400 bg-red-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Low: 'text-emerald-400 bg-emerald-400/10',
};

const statusColors: Record<string, string> = {
  Todo: 'text-muted-foreground bg-muted/50',
  'In Progress': 'text-blue-400 bg-blue-400/10',
  Completed: 'text-emerald-400 bg-emerald-400/10',
};

interface TaskForm {
  title: string;
  description: string;
  assignee: string;
  priority: string;
  status: string;
  category: string;
  dueDate: string;
}

const emptyForm: TaskForm = {
  title: '',
  description: '',
  assignee: '',
  priority: 'Medium',
  status: 'Todo',
  category: 'Admin',
  dueDate: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [search, setSearch] = useState('');

  const statuses = ['All', 'Todo', 'In Progress', 'Completed'];

  const filtered = tasks.filter((t) => {
    const matchFilter = filter === 'All' || t.status === filter;
    const matchSearch = search === '' || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const openNew = () => {
    setEditTask(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      category: task.category,
      dueDate: task.dueDate || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    if (editTask) {
      setTasks(tasks.map(t => t.id === editTask.id ? { ...t, title: form.title, description: form.description, assignee: form.assignee, priority: form.priority, status: form.status, category: form.category, dueDate: form.dueDate } : t));
    } else {
      setTasks([...tasks, { id: Date.now(), title: form.title, description: form.description, assignee: form.assignee, priority: form.priority, status: form.status, due: form.dueDate || 'TBD', category: form.category, dueDate: form.dueDate }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Todo' : 'Completed' } : t));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.filter(t => t.status !== 'Completed').length} active tasks</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          Add Task
        </button>
      </div>

      {/* Status filter + search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {s} {s !== 'All' && `(${tasks.filter(t => t.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className={`bg-card border border-border p-4 hover:border-primary/20 transition-colors ${task.status === 'Completed' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleComplete(task.id)}
                className={`mt-0.5 w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'border-emerald-400 bg-emerald-400/20' : 'border-border hover:border-primary'}`}
              >
                {task.status === 'Completed' && <Icon name="CheckIcon" size={11} className="text-emerald-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[task.status] || ''}`}>{task.status}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 text-muted-foreground bg-muted/30">{task.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Icon name="UserIcon" size={11} />{task.assignee}</span>
                  <span className="flex items-center gap-1"><Icon name="ClockIcon" size={11} />{task.due}</span>
                  <span className="flex items-center gap-1"><Icon name="TagIcon" size={11} />{task.category}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(task)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                <button onClick={() => handleDelete(task.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No tasks found</div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Task Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Task title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Task description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Todo</option><option>In Progress</option><option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Assignee</label>
                  <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="">Select assignee</option>
                    <option>Sarah M.</option><option>James C.</option><option>Omar H.</option><option>Priya S.</option><option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Lead</option><option>Listing</option><option>Deal</option><option>Marketing</option><option>Admin</option><option>Finance</option><option>Legal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editTask ? 'Update Task' : 'Save Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
