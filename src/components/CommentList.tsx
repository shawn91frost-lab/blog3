import React, { useState } from 'react';
import { Comment } from '../types/blog';
import { Reply, User as UserIcon } from 'lucide-react';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onCommentAdded: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, postId, onCommentAdded }) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Only show top-level approved comments here, nested replies are rendered underneath
  const rootComments = comments.filter((c) => !c.parentId && c.status === 'approved');

  if (rootComments.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500 text-sm border-t border-stone-200">
        No discussion yet. Be the first to start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 border-t border-stone-200">
      <h3 className="text-xl font-bold font-editorial text-stone-900">
        Engineering Discussion ({rootComments.length})
      </h3>

      <div className="space-y-6">
        {rootComments.map((comment) => (
          <div key={comment.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-xs">
                  {comment.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900">{comment.name}</span>
                    {comment.website && (
                      <a
                        href={comment.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                      >
                        profile
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 font-sans">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-stone-700 leading-relaxed pl-11">
              {comment.comment}
            </p>

            {/* Nested Reply Form if active */}
            {replyingToId === comment.id && (
              <div className="pl-11 pt-3">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  parentAuthorName={comment.name}
                  onCommentSubmitted={() => {
                    setReplyingToId(null);
                    onCommentAdded();
                  }}
                  onCancelReply={() => setReplyingToId(null)}
                />
              </div>
            )}

            {/* Nested Approved Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-11 pt-3 space-y-3 border-t border-stone-100 mt-3">
                {comment.replies
                  .filter((r) => r.status === 'approved')
                  .map((reply) => (
                    <div key={reply.id} className="p-3 bg-stone-50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-900">{reply.name}</span>
                        <span className="text-stone-400">
                          {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {reply.comment}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
