'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { articleService } from '@/services/article.service';
import { Article } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMyArticles();
  }, [statusFilter]);

  const fetchMyArticles = async () => {
    setLoading(true);
    try {
        const res = await articleService.getMyArticles({ 
            current: 1, 
            size: 100, // Fetch more for simple list
            status: statusFilter || undefined 
        });
        if (res.code === 200) {
            setArticles(res.data.records);
        }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
      if(!confirm('Delete this article?')) return;
      try {
          await articleService.deleteArticle(id);
          setArticles(articles.filter(a => a.id !== id));
          toast.success('Article deleted');
      } catch (e) { toast.error('Failed to delete'); }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PUBLISHED': return <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><CheckCircle className="w-3 h-3 mr-1"/> Published</span>;
          case 'PENDING_REVIEW': return <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs"><Clock className="w-3 h-3 mr-1"/> Reviewing</span>;
          case 'REJECTED': return <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs"><AlertCircle className="w-3 h-3 mr-1"/> Rejected</span>;
          default: return <span className="flex items-center text-zinc-500 bg-zinc-100 px-2 py-1 rounded text-xs"><FileText className="w-3 h-3 mr-1"/> Draft</span>;
      }
  };

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">My Articles</h1>
            <Link href="/creator/editor">
                <Button>Write New</Button>
            </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-1">
            {['', 'PUBLISHED', 'PENDING_REVIEW', 'REJECTED'].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        statusFilter === status 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                >
                    {status === '' ? 'All' : status.replace('_', ' ')}
                </button>
            ))}
        </div>

        {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div></div>
        ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Stats</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {articles.map(article => (
                            <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1 max-w-md" title={article.title}>{article.title}</div>
                                    <div className="text-zinc-500 text-xs line-clamp-1">{article.summary || 'No summary'}</div>
                                    {article.status === 'REJECTED' && article.rejectReason && (
                                        <div className="text-red-500 text-xs mt-1">Reason: {article.rejectReason}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(article.status)}
                                </td>
                                <td className="px-6 py-4 text-zinc-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1" title="Views"><Eye className="w-3 h-3"/> {article.viewCount}</span>
                                        {/* Likes/Comments could be added here */}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500">
                                    {formatDate(article.createTime)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/creator/editor?articleId=${article.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="w-4 h-4"/></Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(article.id)}>
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {articles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-zinc-500">No articles found in this category.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
