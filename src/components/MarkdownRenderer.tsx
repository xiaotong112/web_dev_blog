import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
// I will add some basic styling for markdown content, usually via a prose class if using typography plugin, 
// but since I am using pure tailwind I might need to style elements manually or just use 'prose' if typography is installed.
// Checking package.json: "@tailwindcss/postcss": "^4".
// Usually v4 includes typography or needs plugin.
// I'll assume standard 'prose' class might not be available without plugin.
// I'll add a simple styling wrapper.

export default function MarkdownRenderer({ content, className }: { content: string, className?: string }) {
  return (
    <div className={cn("markdown-body prose dark:prose-invert max-w-none break-words", className)}>
      <ReactMarkdown
        components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 " {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="leading-7 mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            code: ({node, className, children, ...props}) => {
                const isInline = !className; // react-markdown usage logic
                 if (isInline) {
                     return <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm font-mono text-red-500" {...props}>{children}</code>
                 }
                return (
                    <div className="bg-zinc-900 rounded-lg p-4 my-4 overflow-x-auto text-white">
                        <code className="text-sm font-mono" {...props}>{children}</code>
                    </div>
                )
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4" {...props} />,
            img: ({node, ...props}) => <img className="rounded-lg max-w-full my-4" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
