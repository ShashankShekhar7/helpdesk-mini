import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { validators, validateForm } from '../../utils/validators';
import { formatRelativeTime, getInitials } from '../../utils/helpers';
import Loading from '../common/Loading';
import '../../styles/components.css';

const CommentSection = ({ ticket, comments = [] }) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, isAgent } = useAuth();
  const { addComment } = useTickets();

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate comment
    const validation = validateForm(
      { content: newComment }, 
      { content: [validators.required, validators.minLength(1), validators.maxLength(1000)] }
    );
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await addComment(ticket._id, {
        content: newComment.trim(),
        isInternal: isAgent() ? isInternal : false
      });

      if (result.success) {
        setNewComment('');
        setIsInternal(false);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to add comment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3>Comments & Updates</h3>
        <span className="comment-count">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {sortedComments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to add one!</p>
          </div>
        ) : (
          sortedComments.map((comment, index) => (
            <div 
              key={comment._id || index} 
              className={`comment ${comment.isInternal ? 'comment-internal' : 'comment-public'}`}
            >
              <div className="comment-avatar">
                {getInitials(comment.authorId?.name)}
              </div>
              
              <div className="comment-content">
                <div className="comment-meta">
                  <span className="comment-author">
                    {comment.authorId?.name}
                    {comment.authorId?._id === user?.id && ' (You)'}
                  </span>
                  <span className="comment-role">
                    {comment.authorId?.role?.toUpperCase()}
                  </span>
                  {comment.isInternal && (
                    <span className="internal-badge">Internal</span>
                  )}
                  <span className="comment-time">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                
                <div className="comment-text">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Comment Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-header">
          <h4>Add Comment</h4>
          {isAgent() && (
            <label className="internal-toggle">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={isSubmitting}
              />
              <span className="toggle-label">Internal comment</span>
            </label>
          )}
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <div className="comment-input-container">
          <div className="comment-avatar">
            {getInitials(user?.name)}
          </div>
          
          <div className="comment-input">
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder={
                isInternal 
                  ? "Add an internal comment (only visible to agents)..." 
                  : "Add your comment..."
              }
              className={errors.content ? 'error' : ''}
              rows={3}
              disabled={isSubmitting}
              maxLength={1000}
            />
            {errors.content && (
              <span className="field-error">{errors.content}</span>
            )}
            <span className="character-count">
              {newComment.length}/1000
            </span>
          </div>
        </div>

        <div className="comment-form-actions">
          {isInternal && (
            <span className="internal-notice">
              🔒 This comment will only be visible to agents and admins
            </span>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
