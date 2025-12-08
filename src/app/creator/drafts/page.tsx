'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { draftService } from '@/services/draft.service';
import { Draft } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DraftList() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const res = await draftService.getDraftList();
            if (res.code === 200) setDrafts(res.data.records);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('Delete this draft?')) return;
        try {
            await draftService.deleteDraft(id);
            setDrafts(drafts.filter(d => d.id !== id));
            toast.success('Draft deleted');
        } catch(e) { toast.error('Failed to delete'); }
    }

    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Drafts</h1>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div></div>
            ) : (
                <div className="grid gap-4">
                    {drafts.map(draft => (
                        <div key={draft.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-zinc-400" />
                                    {draft.title || 'Untitled Draft'}
                                </h3>
                                <p className="text-sm text-zinc-500">
                                    Last saved: {formatDate(draft.updateTime)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/creator/editor?draftId=${draft.id}${draft.articleId ? `&articleId=${draft.articleId}` : ''}`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" /> Continue
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(draft.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {drafts.length === 0 && (
                        <div className="text-center py-12 text-zinc-500 bg-zinc-50 rounded-xl dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800">
                             No drafts found. Start writing!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
