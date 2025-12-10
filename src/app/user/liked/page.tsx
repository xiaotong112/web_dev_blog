'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { articleService } from '@/services/article.service';
import { Article } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function MyLikedArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedArticles();
  }, []);

  const fetchLikedArticles = async () => {
    setLoading(true);
    try {
        const res = await articleService.getMyLikedArticles({ current: 1, size: 50 });
        if (res.code === 200) {
            setArticles(res.data.records);
        }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Liked Articles</h1>

        {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div></div>
        ) : (
            <div className="space-y-4">
                {articles.map(article => (
                    <div key={article.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                        {article.coverImage && (
                            <div className="w-full sm:w-48 h-32 flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden">
                                <img src={article.coverImage} className="w-full h-full object-cover" alt={article.title} />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-2">
                                <Link href={`/article/${article.id}`} className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors line-clamp-2">
                                    {article.title}
                                </Link>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{article.summary}</p>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-zinc-200 overflow-hidden">
                                            {article.author?.avatar ? <img src={article.author.avatar} /> : <span className="flex items-center justify-center w-full h-full font-bold">{article.author?.nickname?.charAt(0)}</span>}
                                        </div>
                                        <span>{article.author?.nickname}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{formatDate(article.createTime)}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {article.viewCount}</span>
                                    <span className="flex items-center gap-1 text-red-500"><Heart className="w-3 h-3 fill-current"/> {article.likeCount}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {article.commentCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {articles.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Heart className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No liked articles yet</h3>
                        <p className="text-zinc-500 mb-6">Articles you like will appear here.</p>
                        <Link href="/">
                            <Button>Explore Articles</Button>
                        </Link>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
