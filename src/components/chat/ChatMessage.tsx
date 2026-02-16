import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  onAction?: (message: string) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium',
          isUser ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-800 text-white'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="max-w-[80%] space-y-2">
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 text-sm',
            isUser
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          {message.chartMeta && (
            <div className="mt-2 pt-2 border-t border-gray-200/30">
              <span className="text-xs opacity-70 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Chart: {message.chartMeta.title}
              </span>
            </div>
          )}
        </div>
        {message.actions && message.actions.length > 0 && onAction && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction(action.message)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
