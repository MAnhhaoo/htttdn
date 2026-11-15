import { Trash2, X, HelpCircle } from 'lucide-react';

/**
 * Trình tạo & chỉnh sửa danh sách câu hỏi khảo sát dùng chung cho Admin và Vendor.
 */
export function SurveyQuestionBuilder({
  questions = [],
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  sectionTitle = '2. Nội dung bộ câu hỏi khảo sát',
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#1A3A2C] dark:text-[#8BBAA1]" />
          {sectionTitle} ({questions.length})
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddQuestion('rating')}
            className="px-2.5 py-1.5 bg-[#FBF7EC] hover:bg-[#F5ECD7] dark:bg-[#C9A84C]/20 text-[#8C6B1F] dark:text-[#DEC47E] rounded-lg text-xs font-semibold"
          >
            + Sao (1–5)
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('single_choice')}
            className="px-2.5 py-1.5 bg-[#EEF5F1] hover:bg-[#DCEAE2] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#8BBAA1] rounded-lg text-xs font-semibold"
          >
            + Chọn 1
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('multiple_choice')}
            className="px-2.5 py-1.5 bg-[#EEF5F1] hover:bg-[#DCEAE2] dark:bg-[#2A5C4A]/35 text-[#2A5C4A] dark:text-[#B9D6C6] rounded-lg text-xs font-semibold"
          >
            + Chọn nhiều
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('text')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
          >
            + Tự luận
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
          >
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-[#EEF5F1] dark:bg-[#1A3A2C]/60 text-[#1A3A2C] dark:text-[#8BBAA1] text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                {idx + 1}
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => onUpdateQuestion(idx, 'question', e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#2A5C4A] text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveQuestion(idx)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                title="Xóa câu hỏi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pl-8 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="font-medium bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded">
                  Loại:{' '}
                  {q.type === 'rating'
                    ? 'Đánh giá Sao (1-5)'
                    : q.type === 'single_choice'
                      ? 'Chọn 1 đáp án'
                      : q.type === 'multiple_choice'
                        ? 'Chọn nhiều'
                        : 'Tự luận'}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(q.required)}
                    onChange={(e) => onUpdateQuestion(idx, 'required', e.target.checked)}
                    className="rounded text-[#1A3A2C] focus:ring-[#2A5C4A]"
                  />
                  <span>Bắt buộc trả lời</span>
                </label>
              </div>
            </div>

            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
              <div className="pl-8 space-y-2 pt-1">
                {(q.options || []).map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold w-4">{oIdx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onUpdateOption(idx, oIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2A5C4A]"
                    />
                    {(q.options || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => onRemoveOption(idx, oIdx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onAddOption(idx)}
                  className="text-xs text-[#1A3A2C] dark:text-[#8BBAA1] hover:underline font-medium pt-1"
                >
                  + Thêm lựa chọn
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurveyQuestionBuilder;

