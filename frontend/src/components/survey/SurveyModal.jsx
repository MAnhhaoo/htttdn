import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, AlertCircle, Clock, Store, ShieldCheck, Send, RotateCw } from 'lucide-react';
import { surveyService } from '../../services/surveyService';

export default function SurveyModal({ isOpen, onClose, surveyResponseId, onSubmitted }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && surveyResponseId) {
      loadSurveyDetail();
    } else {
      setDetail(null);
      setAnswers({});
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, surveyResponseId]);

  const loadSurveyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mark as opened
      try {
        await surveyService.openResponse(surveyResponseId);
      } catch (e) {
        // Continue even if open call errors
      }
      const raw = await surveyService.getInboxDetail(surveyResponseId);
      const data = raw?.data !== undefined ? raw.data : raw;
      setDetail(data);

      // Pre-fill answers if already submitted
      if (data?.answers && data.answers.length > 0) {
        const initialAnswers = {};
        data.answers.forEach(ans => {
          if (ans.textAnswer !== null && ans.textAnswer !== undefined) {
            initialAnswers[ans.questionId] = { textAnswer: ans.textAnswer };
          } else if (ans.ratingValue !== null && ans.ratingValue !== undefined) {
            initialAnswers[ans.questionId] = { ratingValue: ans.ratingValue };
          } else if (ans.optionId) {
            const q = data.survey?.questions?.find(item => item.id === ans.questionId);
            if (q && q.type === 'multiple_choice') {
              initialAnswers[ans.questionId] = initialAnswers[ans.questionId] || { optionIds: [] };
              initialAnswers[ans.questionId].optionIds.push(ans.optionId);
            } else {
              initialAnswers[ans.questionId] = { optionId: ans.optionId };
            }
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Failed to load survey detail:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải nội dung khảo sát';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ratingValue: value }
    }));
  };

  const handleSingleChoiceChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId }
    }));
  };

  const handleMultipleChoiceChange = (questionId, optionId) => {
    setAnswers(prev => {
      const current = prev[questionId]?.optionIds || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: { ...prev[questionId], optionIds: updated }
      };
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], textAnswer: text }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!detail) return;

    // Validate required questions
    const questions = detail.survey?.questions || [];
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val) {
          setError(`Vui lòng trả lời câu hỏi bắt buộc: "${q.question}"`);
          return;
        }
        if (q.type === 'rating' && !val.ratingValue) {
          setError(`Vui lòng đánh giá số sao cho: "${q.question}"`);
          return;
        }
        if (q.type === 'single_choice' && !val.optionId) {
          setError(`Vui lòng chọn 1 đáp án cho: "${q.question}"`);
          return;
        }
        if (q.type === 'multiple_choice' && (!val.optionIds || val.optionIds.length === 0)) {
          setError(`Vui lòng chọn ít nhất 1 đáp án cho: "${q.question}"`);
          return;
        }
        if (q.type === 'text' && (!val.textAnswer || !val.textAnswer.trim())) {
          setError(`Vui lòng nhập nội dung cho: "${q.question}"`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      const formattedAnswers = [];
      Object.entries(answers).forEach(([questionId, ans]) => {
        if (ans.optionIds && ans.optionIds.length > 0) {
          formattedAnswers.push({ questionId, optionIds: ans.optionIds });
        } else if (ans.optionId) {
          formattedAnswers.push({ questionId, optionIds: [ans.optionId] });
        } else if (ans.ratingValue !== undefined) {
          formattedAnswers.push({ questionId, ratingValue: ans.ratingValue });
        } else if (ans.textAnswer !== undefined && ans.textAnswer.trim()) {
          formattedAnswers.push({ questionId, textAnswer: ans.textAnswer.trim() });
        }
      });

      await surveyService.submitResponse(surveyResponseId, { answers: formattedAnswers });
      setSuccess(true);
      if (onSubmitted) {
        onSubmitted(surveyResponseId);
      }
    } catch (err) {
      console.error('Submit survey error:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isSubmitted = detail?.status === 'submitted' || success;
  const isSkipped = detail?.status === 'skipped';
  const isExpired = (detail?.expiresAt && new Date(detail.expiresAt) < new Date()) || detail?.survey?.status === 'closed';
  const canEdit = !!detail && !isSubmitted && !isSkipped && !isExpired;

  const ratingLabels = {
    1: 'Rất không hài lòng',
    2: 'Chưa hài lòng',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất hài lòng',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {detail?.survey?.scope === 'platform' || detail?.survey?.admin || !detail?.survey?.vendor ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> MIVA Platform
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Store className="w-3.5 h-3.5" /> {detail?.survey?.vendor?.storeName || 'Cửa hàng đối tác'}
                </span>
              )}
              {detail?.expiresAt && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn: {new Date(detail.expiresAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {detail?.survey?.title || 'Khảo sát ý kiến'}
            </h2>
            {detail?.survey?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {detail.survey.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải nội dung khảo sát...</p>
            </div>
          ) : error && !detail ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-slate-700 dark:text-slate-200 font-semibold text-base">Không thể mở khảo sát</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={loadSurveyDetail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors mt-2"
              >
                <RotateCw className="w-3.5 h-3.5" /> Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Status Alert Banners */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Cảm ơn bạn đã hoàn thành khảo sát!</h4>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                      Ý kiến của bạn đã được ghi nhận vào hệ thống CRM MIVA để nâng cao chất lượng dịch vụ. Bạn có thể xem lại các câu trả lời dưới đây.
                    </p>
                  </div>
                </div>
              )}

              {isSkipped && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Khảo sát này đã được bỏ qua</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bạn có thể xem nội dung các câu hỏi bên dưới.
                    </p>
                  </div>
                </div>
              )}

              {isExpired && !isSubmitted && !isSkipped && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Khảo sát đã hết hạn</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                      Thời hạn tham gia khảo sát này đã kết thúc. Bạn có thể xem lại nội dung nhưng không thể gửi phản hồi mới.
                    </p>
                  </div>
                </div>
              )}

              {error && detail && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {detail?.survey?.questions?.map((q, idx) => {
                  const currentAnswer = answers[q.id] || {};

                  return (
                    <div 
                      key={q.id}
                      className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                            {q.question}
                            {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                          </h3>
                        </div>
                      </div>

                      {/* 1. Rating Question (Stars) */}
                      {q.type === 'rating' && (
                        <div className="mt-4 pl-8">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = (currentAnswer.ratingValue || 0) >= star;
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  disabled={!canEdit}
                                  onClick={() => handleRatingChange(q.id, star)}
                                  className={`p-1.5 rounded-lg transition-transform ${
                                    canEdit ? 'hover:scale-125 focus:outline-none' : 'cursor-default'
                                  }`}
                                >
                                  <Star
                                    className={`w-7 h-7 transition-colors ${
                                      active
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                            {currentAnswer.ratingValue && (
                              <span className="ml-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                                {ratingLabels[currentAnswer.ratingValue]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Single Choice Question (Radio) */}
                      {q.type === 'single_choice' && (
                        <div className="mt-3 pl-8 space-y-2">
                          {q.options?.map((opt) => {
                            const isSelected = currentAnswer.optionId === opt.id;
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                                  canEdit ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isSelected
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-medium'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt.id}
                                  checked={isSelected}
                                  disabled={!canEdit}
                                  onChange={() => handleSingleChoiceChange(q.id, opt.id)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                />
                                <span>{opt.content}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Multiple Choice Question (Checkboxes) */}
                      {q.type === 'multiple_choice' && (
                        <div className="mt-3 pl-8 space-y-2">
                          {q.options?.map((opt) => {
                            const isSelected = (currentAnswer.optionIds || []).includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                                  canEdit ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isSelected
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-medium'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!canEdit}
                                  onChange={() => handleMultipleChoiceChange(q.id, opt.id)}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                                />
                                <span>{opt.content}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. Text Question */}
                      {q.type === 'text' && (
                        <div className="mt-3 pl-8">
                          <textarea
                            rows={3}
                            disabled={!canEdit}
                            value={currentAnswer.textAnswer || ''}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            placeholder={canEdit ? 'Nhập ý kiến đóng góp chi tiết của bạn tại đây...' : 'Chưa có câu trả lời'}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none transition-colors disabled:opacity-75"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            Đóng
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi khảo sát
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
