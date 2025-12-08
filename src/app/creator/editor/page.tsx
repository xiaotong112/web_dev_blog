'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { articleService } from '@/services/article.service';
import { draftService } from '@/services/draft.service';
import { categoryService, tagService } from '@/services/taxonomy.service';
import { Category, Tag } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { toast } from 'react-hot-toast';
import { Save, UploadCloud, ArrowLeft, Eye } from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const articleIdParam = searchParams.get('articleId'); // For editing existing article

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  
  // Status State
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchTaxonomy();
    if (draftIdParam) loadDraft(Number(draftIdParam));
    else if (articleIdParam) loadArticle(Number(articleIdParam));
  }, [draftIdParam, articleIdParam]);

  // Auto-save
  useEffect(() => {
      const interval = setInterval(() => {
          if (title && content) {
              handleSaveDraft(true);
          }
      }, 30000); // 30s
      return () => clearInterval(interval);
  }, [title, content, articleIdParam]);

  const fetchTaxonomy = async () => {
      const [catRes, tagRes] = await Promise.all([categoryService.getAll(), tagService.getAll()]);
      if (catRes.code === 200) setCategories(catRes.data);
      if (tagRes.code === 200) setTags(tagRes.data);
  };

  const loadDraft = async (id: number) => {
      const res = await draftService.getDraftDetail(id);
      if (res.code === 200) {
          let loadedContent = res.data.content;
          
          // Try to extract metadata
          const metaRegex = /\n\n<!--_META_JSON_({.*})_-->$/;
          const match = loadedContent.match(metaRegex);
          
          if (match && match[1]) {
              try {
                  const meta = JSON.parse(match[1]);
                  if (meta.categoryId) setCategoryId(meta.categoryId);
                  if (meta.tags) setSelectedTagIds(meta.tags);
                  if (meta.summary) setSummary(meta.summary);
                  if (meta.coverImage) setCoverImage(meta.coverImage);
                  
                  // Remove meta from content displayed in editor
                  loadedContent = loadedContent.replace(metaRegex, '');
              } catch (e) {
                  console.error('Failed to parse draft metadata', e);
              }
          }

          setTitle(res.data.title);
          setContent(loadedContent);
      }
  };

  const loadArticle = async (id: number) => {
      const res = await articleService.getArticleDetail(id);
      if (res.code === 200) {
          setTitle(res.data.title);
          setContent(res.data.content);
          setSummary(res.data.summary || '');
          setCoverImage(res.data.coverImage || '');
          setCategoryId(res.data.category.id);
          setSelectedTagIds(res.data.tags.map(t => t.id));
      }
  };

  const handleSaveDraft = async (silent = false) => {
      if (!title) return;
      setIsSaving(true);
      
      // Embed metadata in content
      const meta = {
          categoryId,
          tags: selectedTagIds,
          summary,
          coverImage
      };
      
      const contentWithMeta = content + `\n\n<!--_META_JSON_${JSON.stringify(meta)}_-->`;

      try {
          const res = await draftService.saveDraft({
              articleId: articleIdParam ? Number(articleIdParam) : undefined,
              title,
              content: contentWithMeta
          });
          if (res.code === 200) {
              setLastSaved(new Date());
              if (!silent) toast.success('Draft saved');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsSaving(false);
      }
  };

  const handlePublish = async () => {
      if (!title || !content || !categoryId) {
          toast.error('Please fill in required fields (Title, Content, Category)');
          return;
      }
      
      setIsPublishing(true);
      try {
          const payload = {
              title,
              content,
              summary,
              coverImage,
              categoryId: Number(categoryId),
              tagIds: selectedTagIds
          };

          if (articleIdParam) {
              await articleService.updateArticle(Number(articleIdParam), payload);
              toast.success('Article updated successfully!');
          } else {
              await articleService.publishArticle(payload);
              toast.success('Article published successfully! Pending review.');
          }
          router.push('/creator/articles');
      } catch (e: any) {
          toast.error(e.response?.data?.message || 'Publish failed');
      } finally {
          setIsPublishing(false);
      }
  };

  const toggleTag = (tagId: number) => {
      if (selectedTagIds.includes(tagId)) {
          setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
      } else {
          if (selectedTagIds.length >= 5) return toast.error('Max 5 tags allowed');
          setSelectedTagIds([...selectedTagIds, tagId]);
      }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h1 className="text-2xl font-bold">
                  {articleIdParam ? 'Edit Article' : 'Write New Article'}
              </h1>
              {lastSaved && (
                  <span className="text-xs text-zinc-400">
                      Saved at {lastSaved.toLocaleTimeString()}
                  </span>
              )}
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSaveDraft(false)} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button onClick={() => setIsPreview(!isPreview)} variant="secondary">
                  <Eye className="h-4 w-4 mr-2" /> {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing} className="bg-green-600 hover:bg-green-700 text-white">
                  <UploadCloud className="h-4 w-4 mr-2" /> {articleIdParam ? 'Update' : 'Publish'}
              </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
               {/* Title */}
               <Input 
                  placeholder="Enter title here..." 
                  className="text-2xl font-bold py-6 px-4"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
               />
               
               {/* Editor Area */}
               <div className="min-h-[500px] bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col">
                   {isPreview ? (
                       <div className="p-6 prose dark:prose-invert max-w-none">
                           <MarkdownRenderer content={content} />
                       </div>
                   ) : (
                       <textarea
                           className="flex-1 w-full p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
                           placeholder="Write your story using Markdown..."
                           value={content}
                           onChange={e => setContent(e.target.value)}
                       />
                   )}
               </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
               {/* Category */}
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                   <h3 className="font-semibold mb-3">Category</h3>
                   <select 
                        className="w-full rounded-md border border-zinc-200 p-2 dark:bg-zinc-950 dark:border-zinc-800"
                        value={categoryId}
                        onChange={e => setCategoryId(Number(e.target.value))}
                   >
                       <option value="">Select Category</option>
                       {categories.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                   </select>
               </div>

               {/* Tags */}
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                   <h3 className="font-semibold mb-3">Tags</h3>
                   <div className="flex flex-wrap gap-2 mb-3">
                       {selectedTagIds.map(id => {
                           const tag = tags.find(t => t.id === id);
                           return tag ? (
                               <Badge key={id} variant="secondary" className="cursor-pointer bg-blue-50 text-blue-600" onClick={() => toggleTag(id)}>
                                   {tag.name} ✕
                               </Badge>
                           ) : null;
                       })}
                   </div>
                   <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                       {tags.filter(t => !selectedTagIds.includes(t.id)).map(t => (
                           <Badge key={t.id} variant="outline" className="cursor-pointer hover:bg-zinc-100" onClick={() => toggleTag(t.id)}>
                               {t.name}
                           </Badge>
                       ))}
                   </div>
               </div>

               {/* Summary */}
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                   <h3 className="font-semibold mb-3">Summary</h3>
                   <textarea 
                       className="w-full rounded-md border border-zinc-200 p-2 text-sm h-24 resize-none dark:bg-zinc-950 dark:border-zinc-800"
                       placeholder="Short description..."
                       value={summary}
                       onChange={e => setSummary(e.target.value)}
                   />
               </div>

               {/* Cover Image */}
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                   <h3 className="font-semibold mb-3">Cover Image URL</h3>
                   <Input 
                       placeholder="https://..." 
                       value={coverImage}
                       onChange={e => setCoverImage(e.target.value)}
                   />
                   {coverImage && (
                       <img src={coverImage} alt="Preview" className="mt-2 rounded-md w-full h-32 object-cover" />
                   )}
               </div>
          </div>
      </div>
    </div>
  );
}
