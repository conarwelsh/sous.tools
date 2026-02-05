import { KnowledgeDocView } from '@sous/features';
import { getKnowledgeBaseDocs } from '@sous/features/server';
import { Book } from 'lucide-react';

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const docs = await getKnowledgeBaseDocs();
  
  const currentSlug = slug?.[0];
  const doc = docs.find((d) => d.slug === currentSlug) || docs[0];

  if (!doc) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-6">
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse">
          <Book size={64} className="opacity-20" />
        </div>
        <p className="font-bold tracking-[0.2em] uppercase text-xs">Document Not Found</p>
      </div>
    );
  }

  return <KnowledgeDocView doc={doc} />;
}
