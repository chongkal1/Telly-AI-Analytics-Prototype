'use client';

import { pages } from '@/data/pages';
import { articles } from '@/data/articles';

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
}

export function ArticleDetail({ articleId, onBack }: ArticleDetailProps) {
  const page = pages.find((p) => p.id === articleId);
  const article = articles[articleId];

  if (!page) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to Traffic
        </button>
        <p className="mt-4 text-surface-500">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-surface-500 mb-4">
        <button onClick={onBack} className="hover:text-indigo-600 transition-colors">
          Traffic
        </button>
        <span>/</span>
        <span className="text-surface-900 font-medium truncate">{page.title}</span>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-surface-900">Article</h1>
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          Go to Article
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Article card */}
      <div className="bg-white rounded-[14px] border border-surface-200 shadow-card overflow-hidden">
        {/* Hero image */}
        {article ? (
          <div
            className="w-full h-48"
            style={{ background: article.heroImage }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-surface-200 to-surface-300" />
        )}

        {/* Title & meta */}
        <div className="px-6 pt-5 pb-2">
          <h2 className="text-xl font-bold text-surface-900 leading-snug">{page.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
            <span>{page.author}</span>
            <span>&middot;</span>
            <span>{new Date(page.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>&middot;</span>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700">
              {page.category}
            </span>
          </div>
        </div>

        {/* Body */}
        {article ? (
          <div
            className="px-6 py-4 prose prose-sm prose-gray max-w-none
              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-surface-900 [&_h2]:mt-6 [&_h2]:mb-2
              [&_p]:text-sm [&_p]:text-surface-700 [&_p]:leading-relaxed [&_p]:mb-3
              [&_ul]:text-sm [&_ul]:text-surface-700 [&_ul]:mb-3 [&_ul]:pl-5
              [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        ) : (
          <div className="px-6 py-4 text-sm text-surface-400 italic">
            Article content not available for this page.
          </div>
        )}
      </div>
    </div>
  );
}
