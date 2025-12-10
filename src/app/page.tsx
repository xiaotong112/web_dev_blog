'use client';

import { useState, useEffect } from 'react';
import { articleService, ArticleQuery } from '@/services/article.service';
import { categoryService, tagService } from '@/services/taxonomy.service';
import ArticleCard from '@/components/ArticleCard';
import { Article, Category, Tag } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Hash, FolderOpen, Flame, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { clsx } from "clsx";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotTags, setHotTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Query State
  const [query, setQuery] = useState<ArticleQuery>({
      current: 1,
      size: 10,
      sortBy: 'latest'
  });
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchSidebar();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [query]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
        const res = await articleService.getArticles(query);
        if (res.code === 200) {
            setArticles(res.data.records);
            setTotalPages(res.data.pages);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const fetchSidebar = async () => {
    try {
        const [catRes, tagRes] = await Promise.all([
            categoryService.getAll(),
            tagService.getAll()
        ]);
        if (catRes.code === 200) setCategories(catRes.data);
        if (tagRes.code === 200) setHotTags(tagRes.data);
    } catch (e) {
        console.error(e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setQuery({ ...query, keyword, current: 1 });
  };

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= totalPages) {
          setQuery({ ...query, current: newPage });
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-8">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setQuery({ ...query, sortBy: 'latest', current: 1 })}
                    className={clsx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2", 
                        query.sortBy === 'latest' ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300")}
                >
                    <Clock className="w-4 h-4" /> Latest
                </button>
                <button
                    onClick={() => setQuery({ ...query, sortBy: 'hot', current: 1 })}
                    className={clsx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2", 
                        query.sortBy === 'hot' ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300")}
                >
                    <Flame className="w-4 h-4" /> Hottest
                </button>
            </div>

            <form onSubmit={handleSearch} className="w-full sm:w-auto relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-transparent text-sm border border-zinc-200 rounded-full focus:outline-none focus:border-blue-500 dark:border-zinc-800 dark:text-white"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </form>
        </div>

        {/* Selected Filters Chips */}
        {(query.categoryId || query.tagId) && (
            <div className="flex gap-2 mb-6">
                {query.categoryId && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setQuery({...query, categoryId: undefined})}>
                        Category: {categories.find(c => c.id === query.categoryId)?.name || query.categoryId} ✕
                    </Badge>
                )}
                {query.tagId && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setQuery({...query, tagId: undefined})}>
                        Tag: {hotTags.find(t => t.id === query.tagId)?.name || query.tagId} ✕
                    </Badge>
                )}
                 <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setQuery({ current:1, size:10, sortBy: query.sortBy })}>Clear All</Button>
            </div>
        )}

        {/* List */}
        {loading ? (
             <div className="space-y-6">
                 {[1,2,3].map(i => (
                     <div key={i} className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                 ))}
             </div>
        ) : articles.length > 0 ? (
            <div>
                 {articles.map(article => (
                     <ArticleCard key={article.id} article={article} />
                 ))}
                 
                 {/* Pagination */}
                 <div className="flex justify-center items-center gap-2 mt-8">
                     <Button 
                        variant="outline" 
                        disabled={query.current! <= 1}
                        onClick={() => handlePageChange(query.current! - 1)}
                     >
                         Previous
                     </Button>
                     <span className="text-sm text-zinc-500">Page {query.current} of {totalPages}</span>
                     <Button 
                        variant="outline" 
                        disabled={query.current! >= totalPages}
                        onClick={() => handlePageChange(query.current! + 1)}
                     >
                         Next
                     </Button>
                 </div>
            </div>
        ) : (
            <div className="text-center py-20">
                <div className="text-zinc-300 dark:text-zinc-700 mb-4 mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No articles found</h3>
                <p className="text-zinc-500">Try adjusting your filters or search query.</p>
            </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-8">
          {/* Categories */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-500" /> Categories
              </h3>
              <div className="space-y-2">
                  {categories.map(category => (
                      <div 
                        key={category.id} 
                        className={clsx("flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors", 
                            query.categoryId === category.id ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600" : "")}
                        onClick={() => setQuery({ ...query, categoryId: category.id, current: 1 })}
                      >
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{category.articleCount}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Tags */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-500" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                  {hotTags.map(tag => (
                      <span 
                        key={tag.id} 
                        className={clsx("px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border",
                             query.tagId === tag.id ? "ring-2 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950" : "")}
                        style={{
                            color: tag.color,
                            backgroundColor: tag.color ? `${tag.color}15` : undefined, // 8-bit hex alpha ~10%
                            borderColor: tag.color ? `${tag.color}40` : undefined
                        }}
                        onClick={() => setQuery({ ...query, tagId: tag.id, current: 1 })}
                      >
                          {tag.name}
                      </span>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
