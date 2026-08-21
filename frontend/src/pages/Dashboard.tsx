import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, Plus, Search, Trash2, Edit,
  CheckCircle, Circle, Calendar, ChevronLeft, ChevronRight, X,
  LayoutGrid, Table
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Pending' | 'Completed';
  dueDate?: string;
  user: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  dueDate: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'Pending',
    dueDate: ''
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // setError('');
      const params = {
        page,
        limit,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };
      const res = await axios.get(`${API_URL}/api/tasks`, { params });
      setTasks(res.data.tasks);
      setTotalPages(res.data.pages);
      setTotalTasks(res.data.total);
      setPage(res.data.currentPage);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, searchTerm, limit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    try {
      await axios.post(`${API_URL}/api/tasks`, formData);
      setShowAddModal(false);
      resetForm();
      fetchTasks();
      toast.success('Task created successfully');
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || 'Failed to create task';
      toast.error(errMsg);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    try {
      await axios.put(`${API_URL}/api/tasks/${editingTaskId}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchTasks();
      toast.success('Task updated successfully');
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || 'Failed to update task';
      toast.error(errMsg);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskToDelete}`);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks();
      toast.success('Task deleted successfully');
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || 'Failed to delete task';
      toast.error(errMsg);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await axios.put(`${API_URL}/api/tasks/${task._id}`, {
        ...task,
        status: newStatus
      });
      fetchTasks();
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || 'Failed to update status';
      toast.error(errMsg);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'Pending',
      dueDate: ''
    });
    setEditingTaskId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 md:px-10 flex justify-between items-center sticky top-0 z-10 shadow-xs">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-indigo-600">TaskManager</h1>
          <span className="text-xs text-slate-500 mt-1">Welcome, {user?.name}</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600 font-medium text-sm py-2 px-4 rounded-lg transition duration-200 cursor-pointer">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-10">

        <div className="flex gap-4 mb-8 items-center flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-3 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition duration-200 cursor-pointer ${viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition duration-200 cursor-pointer ${viewMode === 'table'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Table View"
            >
              <Table size={18} />
            </button>
          </div>

          <button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-lg transition duration-200 cursor-pointer shadow-md shadow-indigo-100">
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-xs font-medium">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-xs font-medium">
            <p>No tasks found. Create a new one to get started!</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map(task => (
              <div key={task._id} className={`bg-white border rounded-xl p-5 flex items-start gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition duration-200 ${task.status === 'Completed' ? 'border-slate-100 opacity-75' : 'border-slate-200'}`}>
                <div className="cursor-pointer flex items-center justify-center mt-1" onClick={() => handleToggleStatus(task)}>
                  {task.status === 'Completed' ? (
                    <CheckCircle className="text-emerald-500 hover:text-slate-400 transition duration-150" size={22} />
                  ) : (
                    <Circle className="text-slate-400 hover:text-indigo-600 transition duration-150" size={22} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg text-slate-900 leading-snug break-words ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-3 break-words">{task.description}</p>
                  {task.dueDate && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 py-1 px-2.5 rounded-md font-medium">
                      <Calendar size={14} />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <button onClick={() => openEditModal(task)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition duration-200 cursor-pointer" title="Edit Task">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition duration-200 cursor-pointer" title="Delete Task">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-6 w-12 text-center">Status</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 w-32">Due Date</th>
                  <th className="py-4 px-6 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(task => (
                  <tr key={task._id} className={`hover:bg-slate-50/50 transition duration-150 ${task.status === 'Completed' ? 'opacity-75' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <button className="cursor-pointer inline-flex items-center justify-center" onClick={() => handleToggleStatus(task)}>
                        {task.status === 'Completed' ? (
                          <CheckCircle className="text-emerald-500 hover:text-slate-400 transition duration-150" size={20} />
                        ) : (
                          <Circle className="text-slate-400 hover:text-indigo-600 transition duration-150" size={20} />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <span className={task.status === 'Completed' ? 'line-through text-slate-400' : ''}>
                        {task.title}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                      {task.description || '-'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditModal(task)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition duration-200 cursor-pointer" title="Edit Task">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition duration-200 cursor-pointer" title="Delete Task">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{totalTasks > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-800">{Math.min(page * limit, totalTasks)}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalTasks}</span> tasks
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                First
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((num, i) => (
                <button
                  key={i}
                  disabled={num === '...'}
                  onClick={() => typeof num === 'number' && setPage(num)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition duration-200 cursor-pointer ${num === page
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                    : num === '...'
                      ? 'border-transparent text-slate-400 cursor-default'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {num}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition duration-150 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Task details"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-sm transition duration-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition duration-200 cursor-pointer shadow-md shadow-indigo-100">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Edit Task</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition duration-150 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800 transition duration-200"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-sm transition duration-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition duration-200 cursor-pointer shadow-md shadow-indigo-100">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Delete Task</h2>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition duration-150 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-slate-600 text-base leading-relaxed">
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="px-5 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-white font-semibold text-sm transition duration-200 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteTask} className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition duration-200 cursor-pointer shadow-md shadow-red-100">
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
