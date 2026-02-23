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
          isUser ? 'bg-[#00C5DF]/15 text-[#00C5DF]' : 'bg-surface-800 text-white'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="max-w-[80%] space-y-2">
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 text-sm',
            isUser
              ? 'bg-surface-900 text-white'
              : 'bg-white border border-surface-200 text-surface-800'
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          {message.chartMeta && (
            <div className="mt-2 pt-2 border-t border-surface-200/30">
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
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-surface-200 bg-white text-surface-700 hover:bg-surface-100 hover:border-surface-300 hover:text-surface-900 transition-colors"
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
