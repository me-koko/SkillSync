import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Star } from 'lucide-react';
import { SkillExchange } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: SkillExchange | null;
  currentUserId?: string;
  onSubmit: (data: { exchangeId: string; revieweeId: string; rating: number; feedback: string }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  exchange,
  currentUserId,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!exchange) return null;

  const partner = exchange.initiatorId === currentUserId ? exchange.partner : exchange.initiator;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide feedback about your learning experience');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        exchangeId: exchange.id,
        revieweeId: partner.id,
        rating,
        feedback: feedback.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Skill Exchange"
      subtitle={`How was your experience learning with ${partner.fullName}?`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Star Selector */}
        <div className="text-center py-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Your Rating
          </label>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {rating === 5 && 'Outstanding peer mentor!'}
            {rating === 4 && 'Great learning session.'}
            {rating === 3 && 'Good exchange.'}
            {rating === 2 && 'Could be improved.'}
            {rating === 1 && 'Not helpful.'}
          </p>
        </div>

        <Textarea
          label="Your Feedback / Testimonial"
          placeholder="Share what made this peer exchange helpful, their teaching style, and what you accomplished..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          required
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
