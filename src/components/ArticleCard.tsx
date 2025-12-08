import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';
import { Heart, MessageSquare, Eye } from 'lucide-react';
import { Badge } from './ui/Badge';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/article/${article.id}`} className="group block mb-6">
      <article className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white border border-zinc-100 transition-all hover:shadow-lg dark:bg-zinc-900 dark:border-zinc-800 group-hover:border-blue-100 dark:group-hover:border-blue-900">
        {article.coverImage && (
            <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
            </div>
        )}
        
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {article.category.name}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                        {formatDate(article.publishTime)}
                    </span>
                </div>
                
                <h2 className="text-xl font-bold text-zinc-900 mb-2 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                </h2>
                
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                    {article.summary}
                </p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs overflow-hidden">
                        {article.author?.avatar ? (
                            <img src={article.author.avatar} alt={article.author.nickname} className="w-full h-full object-cover" />
                        ) : (
                            <span>{article.author?.nickname?.charAt(0) || 'U'}</span>
                        )}
                     </div>
                     <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{article.author?.nickname || 'Unknown Author'}</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {article.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {article.commentCount}
                    </span>
                </div>
            </div>
        </div>
      </article>
    </Link>
  );
}
