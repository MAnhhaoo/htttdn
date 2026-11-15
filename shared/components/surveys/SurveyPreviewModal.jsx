import { Star } from 'lucide-react';
import { Modal } from '../ui/Modal';

/**
 * Modal xem trước nội dung bộ câu hỏi khảo sát dùng chung cho Admin và Vendor.
 */
export function SurveyPreviewModal({ survey, onClose }) {
  return (
    <Modal
      isOpen={Boolean(survey)}
      onClose={onClose}
      title={survey?.title || 'Xem trước khảo sát'}
      maxWidth="max-w-xl"
    >
      {survey && (
        <div className="space-y-4">
          {survey.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{survey.description}</p>
          )}

          <div className="space-y-3">
            {survey.questions?.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {q.question}{' '}
                  {q.required && <span className="text-rose-500">*</span>}
                </div>
                {q.type === 'rating' && (
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                )}
                {q.options?.map((opt, oIdx) => (
                  <div
                    key={opt.id || oIdx}
                    className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    &bull; {typeof opt === 'string' ? opt : opt.content}
                  </div>
                ))}
                {q.type === 'text' && (
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 italic">
                    [Người nhận nhập câu trả lời tự luận]
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SurveyPreviewModal;

