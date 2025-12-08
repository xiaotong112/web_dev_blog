'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { articleService } from '@/services/article.service';
import { commentService } from '@/services/comment.service';
import { Article, Comment } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Heart, MessageSquare, Share2, CornerDownRight, Trash2 } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const { user, isAuthenticated } = useAuthStore();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  
  // Like state logic is simpler if we just mutate local state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (articleId) {
        fetchArticle();
        fetchComments();
    }
  }, [articleId]);

  const fetchArticle = async () => {
      try {
          const res = await articleService.getArticleDetail(articleId);
          if (res.code === 200) {
              setArticle(res.data);
              setIsLiked(res.data.isLiked || false);
              setLikeCount(res.data.likeCount);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const fetchComments = async () => {
     try {
         const res = await commentService.getComments(articleId);
         if (res.code === 200) {
             setComments(res.data);
         }
     } catch(e) { console.error(e); }
  };

  const handleLike = async () => {
     if (!isAuthenticated) return toast.error('Please login to like');
     
     try {
         if (isLiked) {
             await articleService.unlikeArticle(articleId);
             setLikeCount(prev => prev - 1);
             setIsLiked(false);
         } else {
             await articleService.likeArticle(articleId);
             setLikeCount(prev => prev + 1);
             setIsLiked(true);
         }
     } catch (e: any) {
         toast.error(e.response?.data?.message || 'Action failed');
     }
  };

  const handleSubmitComment = async (parentId?: number) => {
      if (!isAuthenticated) return toast.error('Please login to comment');
      if (!commentContent.trim()) return;

      try {
          await commentService.addComment(articleId, commentContent, parentId);
          setCommentContent('');
          setReplyTo(null);
          toast.success('Comment posted');
          fetchComments(); // Refresh comments
      } catch (e: any) {
          toast.error(e.response?.data?.message || 'Failed to post comment');
      }
  };

  const handleDeleteComment = async (commentId: number) => {
      if (!confirm('Are you sure you want to delete this comment?')) return;
      try {
          await commentService.deleteComment(commentId);
          toast.success('Comment deleted');
          fetchComments();
      } catch (e: any) {
           toast.error(e.response?.data?.message || 'Failed to delete');
      }
  };

  const CommentItem = ({ comment, isChild = false }: { comment: Comment, isChild?: boolean }) => (
      <div className={`flex gap-4 ${isChild ? 'pl-12 mt-4' : 'mt-6'}`}>
           <div className="flex-shrink-0">
               <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                   {comment.user?.avatar ? (
                       <img src={comment.user.avatar} className="w-full h-full object-cover" />
                   ) : (
                       <span className="text-zinc-500 font-bold">{comment.user?.nickname?.charAt(0) || 'U'}</span>
                   )}
               </div>
           </div>
           <div className="flex-1">
               <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
                   <div className="flex justify-between items-start mb-1">
                       <div>
                           <span className="font-semibold text-sm">{comment.user?.nickname || 'Unknown User'}</span>
                           <span className="text-xs text-zinc-500 ml-2">{formatDate(comment.createTime)}</span>
                       </div>
                       {user?.id === comment.user?.id && (
                           <button onClick={() => handleDeleteComment(comment.id)} className="text-zinc-400 hover:text-red-500">
                               <Trash2 className="w-4 h-4" />
                           </button>
                       )}
                   </div>
                   <p className="text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
               </div>
               
               <div className="flex items-center gap-4 mt-1 ml-1">
                   <button 
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                        className="text-xs font-medium text-zinc-500 hover:text-blue-600 flex items-center gap-1"
                   >
                       Reply
                   </button>
               </div>

               {replyTo === comment.id && (
                   <div className="mt-2 flex gap-2">
                       <input 
                            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                             placeholder={`Reply to ${comment.user?.nickname || 'User'}...`}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            autoFocus
                       />
                       <Button size="sm" onClick={() => handleSubmitComment(comment.id)}>Send</Button>
                   </div>
               )}

               {/* Children */}
               {(comment.replies || comment.children)?.map(child => (
                   <CommentItem key={child.id} comment={child} isChild={true} />
               ))}
           </div>
      </div>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  if (!article) return <div className="text-center py-20">Article not found</div>;

  return (
    <article className="max-w-4xl mx-auto">
       {/* Header */}
       <header className="mb-8 text-center">
           <div className="flex justify-center gap-2 mb-4">
               <Badge>{article.category.name}</Badge>
               {article.tags.map(tag => (
                   <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
                    >
                        {tag.name}
                    </Badge>
               ))}
           </div>
           
           <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
               {article.title}
           </h1>
           
           <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
                <span>By {article.author.nickname}</span>
                <span>•</span>
                <span>{formatDate(article.publishTime)}</span>
                <span>•</span>
                <span>{article.viewCount} views</span>
           </div>
       </header>

       {/* Banner Image */}
       {article.coverImage && (
           <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-10 bg-zinc-100">
               <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
           </div>
       )}
       
       {/* Content */}
       <div className="mb-12">
            <MarkdownRenderer content={article.content} />
       </div>

       {/* Author Card & Actions */}
       <div className="border-t border-zinc-200 dark:border-zinc-800 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200">
                   {article.author.avatar ? (
                       <img src={article.author.avatar} className="w-full h-full object-cover" />
                   ) : (
                       <span className="w-full h-full flex items-center justify-center font-bold">{article.author.nickname.charAt(0)}</span>
                   )}
               </div>
               <div>
                   <h4 className="font-bold">{article.author.nickname}</h4>
                   <p className="text-sm text-zinc-500">{article.author.bio || 'Content Creator'}</p>
               </div>
           </div>

           <div className="flex items-center gap-3">
               <Button 
                   variant={isLiked ? "danger" : "outline"} 
                   className={isLiked ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ""}
                   onClick={handleLike}
               >
                   <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} /> 
                   {likeCount} Likes
               </Button>
               <Button variant="outline">
                   <Share2 className="w-4 h-4 mr-2" /> Share
               </Button>
           </div>
       </div>

       {/* Comments Section */}
       <section className="mt-12">
           <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
               Comments <span className="text-sm font-normal text-zinc-500">({article.commentCount})</span>
           </h3>
           
           {/* Add Comment */}
           <div className="flex gap-4 mb-8">
               <div className="w-10 h-10 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center">
                   {user?.avatar ? ( <img src={user.avatar} className="w-full h-full rounded-full" /> ) : ( <span className="font-bold">{user?.nickname?.charAt(0) || 'G'}</span> )}
               </div>
               <div className="flex-1">
                   <textarea 
                        className="w-full rounded-lg border border-zinc-200 p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:border-zinc-800"
                        placeholder={isAuthenticated ? "Write a comment..." : "Please login to comment"}
                        disabled={!isAuthenticated}
                        value={replyTo === null ? commentContent : ''}
                        onChange={(e) => { if(replyTo === null) setCommentContent(e.target.value) }}
                   ></textarea>
                   <div className="flex justify-end mt-2">
                       <Button disabled={!isAuthenticated || (replyTo === null && !commentContent.trim())} onClick={() => handleSubmitComment()}>
                           Post Comment
                       </Button>
                   </div>
               </div>
           </div>

           {/* Comment List */}
           <div className="space-y-2">
               {comments.map(comment => (
                   <CommentItem key={comment.id} comment={comment} />
               ))}
               {comments.length === 0 && (
                   <p className="text-center text-zinc-500 py-8">No comments yet. Be the first to share your thoughts!</p>
               )}
           </div>
       </section>
    </article>
  );
}
