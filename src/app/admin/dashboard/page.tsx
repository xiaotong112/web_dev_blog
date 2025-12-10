'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { Article } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'users' | 'categories' | 'tags'>('reviews');

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="flex gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Pending Reviews</TabButton>
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>User Management</TabButton>
            <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>Categories</TabButton>
            <TabButton active={activeTab === 'tags'} onClick={() => setActiveTab('tags')}>Tags</TabButton>
        </div>

        {activeTab === 'reviews' && <PendingReviews />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'tags' && <TagManagement />}
    </div>
  );
}

const TabButton = ({ active, onClick, children }: any) => (
    <button 
        onClick={onClick}
        className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${active ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-800'}`}
    >
        {children}
        {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
    </button>
);

function PendingReviews() {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState<number | null>(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
        const res = await adminService.getPendingArticles({ current: 1, size: 50 });
        if (res.code === 200) setPendingArticles(res.data.records);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAudit = async (articleId: number, pass: boolean) => {
      if (!pass && !rejectReason.trim()) {
          toast.error('Please provide a rejection reason');
          return;
      }
      try {
          await adminService.auditArticle(articleId, pass, pass ? undefined : rejectReason);
          toast.success(pass ? 'Article approved' : 'Article rejected');
          setPendingArticles(prev => prev.filter(a => a.id !== articleId));
          setRejectId(null);
          setRejectReason('');
      } catch (e: any) {
          toast.error(e.response?.data?.message || 'Audit failed');
      }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
                Pending Reviews
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{pendingArticles.length}</span>
            </h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">Article</th>
                        <th className="px-6 py-3">Author</th>
                        <th className="px-6 py-3">Submitted</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {pendingArticles.map(article => (
                        <tr key={article.id}>
                            <td className="px-6 py-4">
                                <Link href={`/article/${article.id}`} target="_blank" className="font-bold hover:text-blue-600 flex items-center gap-1">
                                    {article.title} <ArrowRight className="w-3 h-3" />
                                </Link>
                                <div className="text-zinc-500 text-xs truncate max-w-xs">{article.summary}</div>
                            </td>
                            <td className="px-6 py-4"><div className="font-medium">{article.author?.nickname || 'Unknown'}</div></td>
                            <td className="px-6 py-4 text-zinc-500">{formatDate(article.createTime)}</td>
                            <td className="px-6 py-4 text-right">
                                {rejectId === article.id ? (
                                    <div className="flex flex-col gap-2 items-end">
                                        <input 
                                            className="border rounded px-2 py-1 text-xs w-48"
                                            placeholder="Reason..."
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>Cancel</Button>
                                            <Button size="sm" variant="danger" className="bg-red-600 text-white h-7 text-xs" onClick={() => handleAudit(article.id, false)}>Confirm</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAudit(article.id, true)}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejectId(article.id)}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {pendingArticles.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-zinc-500">No pending articles.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
}

import { User } from '@/types';

function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminService.getUsers({ current: 1, size: 50 });
            if (res.code === 200) setUsers(res.data.records);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (userId: number, currentStatus: number) => {
        // 0: Banned, 1: Normal (based on latest API usage)
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await adminService.updateUserStatus(userId, newStatus);
            toast.success(`User ${newStatus === 0 ? 'banned' : 'unbanned'}`);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } as any : u));
        } catch(e) { toast.error('Failed to update status'); }
    }

    if(loading) return <div className="p-12 text-center">Loading users...</div>;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Stats</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? <img src={user.avatar} /> : user.nickname?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.nickname}</div>
                                            <div className="text-xs text-zinc-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-600'}`}>{user.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs ${user.status === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {user.status === 0 ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-zinc-500">
                                    Articles: {user.articleCount}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== 'ADMIN' && (
                                        <Button 
                                            size="sm" 
                                            variant={ user.status === 0 ? 'outline' : 'danger' }
                                            className={ user.status === 0 ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100' }
                                            onClick={() => handleStatusChange(user.id, user.status ?? 1)}
                                        >
                                            {user.status === 0 ? 'Unban' : 'Ban'}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import { categoryService, tagService } from '@/services/taxonomy.service';
import { Category, Tag } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');

    const fetchCategories = async () => {
        const res = await categoryService.getAll();
        if (res.code === 200) setCategories(res.data);
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleCreate = async () => {
        if(!newName.trim()) return;
        try {
            await adminService.createCategory({ name: newName });
            toast.success('Category created');
            setNewName('');
            fetchCategories();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleUpdate = async (id: number) => {
        if(!editName.trim()) return;
        try {
            await adminService.updateCategory(id, { name: editName });
            toast.success('Category updated');
            setIsEditing(null);
            fetchCategories();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('Delete this category? Articles might lose their category.')) return;
        try {
            await adminService.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex gap-2 mb-6">
                <input className="border rounded px-3 py-2 text-sm" placeholder="New Category Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1"/> Add</Button>
            </div>
            
            <div className="space-y-2">
                {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                        {isEditing === c.id ? (
                            <div className="flex items-center gap-2">
                                <input className="border rounded px-2 py-1 text-sm" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                                <Button size="sm" onClick={() => handleUpdate(c.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
                            </div>
                        ) : (
                            <span className="font-medium">{c.name} <span className="text-xs text-zinc-500 ml-2">({c.articleCount} articles)</span></span>
                        )}
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(c.id); setEditName(c.name); }}><Pencil className="w-4 h-4"/></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TagManagement() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#000000');
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#3b82f6');

    const fetchTags = async () => {
        const res = await tagService.getAll();
        if (res.code === 200) setTags(res.data);
    };

    useEffect(() => { fetchTags(); }, []);

    const handleCreate = async () => {
        if(!newName.trim()) return;
        try {
            await adminService.createTag({ name: newName, color: newColor });
            toast.success('Tag created');
            setNewName('');
            fetchTags();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleUpdate = async (id: number) => {
        if(!editName.trim()) return;
        try {
            await adminService.updateTag(id, { name: editName, color: editColor });
            toast.success('Tag updated');
            setIsEditing(null);
            fetchTags();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('Delete this tag?')) return;
        try {
            await adminService.deleteTag(id);
            toast.success('Tag deleted');
            fetchTags();
        } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex gap-2 mb-6 items-center">
                <input className="border rounded px-3 py-2 text-sm" placeholder="New Tag Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <input type="color" className="p-0 border rounded w-10 h-9 cursor-pointer" value={newColor} onChange={e => setNewColor(e.target.value)} title="Tag Color" />
                <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1"/> Add</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tags.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                        {isEditing === t.id ? (
                            <div className="flex items-center gap-2 w-full">
                                <input className="border rounded px-2 py-1 text-sm w-full" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                                <input type="color" className="border rounded w-8 h-8 flex-shrink-0" value={editColor} onChange={e => setEditColor(e.target.value)} />
                                <Button size="sm" onClick={() => handleUpdate(t.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>X</Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></span>
                                    <span className="font-medium">{t.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setIsEditing(t.id); setEditName(t.name); setEditColor(t.color || '#000000'); }}><Pencil className="w-3 h-3"/></Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(t.id)}><Trash2 className="w-3 h-3"/></Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
