import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Store, 
  ShieldCheck, 
  Send, 
  RotateCw, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { surveyService } from '../../services/surveyService';

export default function SurveyModal({ isOpen, onClose, surveyResponseId, onSubmitted }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState({});
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (isOpen && surveyResponseId) {
      loadSurveyDetail();
    } else {
      setDetail(null);
      setAnswers({});
      setError(null);
      setHoverRating({});
      setJustSubmitted(false);
      setCountdown(null);
    }
  }, [isOpen, surveyResponseId]);

  // Handle auto-close countdown when submission succeeds
  useEffect(() => {
    let timer;
    if (justSubmitted && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (justSubmitted && countdown === 0) {
      handleModalClose();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [justSubmitted, countdown]);

  const handleModalClose = () => {
    setJustSubmitted(false);
    setCountdown(null);
    onClose();
  };

  const loadSurveyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mark as opened
      try {
        await surveyService.openResponse(surveyResponseId);
      } catch {
        // Continue even if open call errors
      }
      const raw = await surveyService.getInboxDetail(surveyResponseId);
      const data = raw?.data !== undefined ? raw.data : raw;
      setDetail(data);

      // Pre-fill answers if already submitted
      if (data?.answers && data.answers.length > 0) {
        const initialAnswers = {};
        data.answers.forEach((ans) => {
          if (ans.textAnswer !== null && ans.textAnswer !== undefined) {
            initialAnswers[ans.questionId] = { textAnswer: ans.textAnswer };
          } else if (ans.ratingValue !== null && ans.ratingValue !== undefined) {
            initialAnswers[ans.questionId] = { ratingValue: ans.ratingValue };
          } else if (ans.optionId) {
            const q = data.survey?.questions?.find((item) => item.id === ans.questionId);
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
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ratingValue: value }
    }));
  };

  const handleSingleChoiceChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId }
    }));
  };

  const handleMultipleChoiceChange = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.optionIds || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: { ...prev[questionId], optionIds: updated }
      };
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], textAnswer: text }
    }));
  };

  const cleanQuestionTitle = (title) => {
    if (!title) return '';
    return title.replace(/^(\[Q\d+\]|Q\d+:|Câu\s*\d+:?)\s*/i, '').trim();
  };

  const isQuestionAnswered = (q) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'rating') return typeof ans.ratingValue === 'number' && ans.ratingValue > 0;
    if (q.type === 'single_choice') return !!ans.optionId;
    if (q.type === 'multiple_choice') return Array.isArray(ans.optionIds) && ans.optionIds.length > 0;
    if (q.type === 'text') return typeof ans.textAnswer === 'string' && ans.textAnswer.trim().length > 0;
    return false;
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
          setError(`Vui lòng trả lời câu hỏi bắt buộc: "${cleanQuestionTitle(q.question)}"`);
          return;
        }
        if (q.type === 'rating' && !val.ratingValue) {
          setError(`Vui lòng đánh giá số sao cho: "${cleanQuestionTitle(q.question)}"`);
          return;
        }
        if (q.type === 'single_choice' && !val.optionId) {
          setError(`Vui lòng chọn 1 đáp án cho: "${cleanQuestionTitle(q.question)}"`);
          return;
        }
        if (q.type === 'multiple_choice' && (!val.optionIds || val.optionIds.length === 0)) {
          setError(`Vui lòng chọn ít nhất 1 đáp án cho: "${cleanQuestionTitle(q.question)}"`);
          return;
        }
        if (q.type === 'text' && (!val.textAnswer || !val.textAnswer.trim())) {
          setError(`Vui lòng nhập nội dung cho: "${cleanQuestionTitle(q.question)}"`);
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
        } else if (ans.ratingValue !== undefined && ans.ratingValue !== null) {
          formattedAnswers.push({ questionId, ratingValue: ans.ratingValue });
        } else if (ans.textAnswer !== undefined && ans.textAnswer.trim()) {
          formattedAnswers.push({ questionId, textAnswer: ans.textAnswer.trim() });
        }
      });

      await surveyService.submitResponse(surveyResponseId, { answers: formattedAnswers });
      setJustSubmitted(true);
      setCountdown(2);
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

  const isSubmittedAlready = detail?.status === 'submitted' && !justSubmitted;
  const isSkipped = detail?.status === 'skipped';
  const isExpired = (detail?.expiresAt && new Date(detail.expiresAt) < new Date()) || detail?.survey?.status === 'closed';
  const canEdit = !!detail && !isSubmittedAlready && !isSkipped && !isExpired && !justSubmitted;

  const questions = detail?.survey?.questions || [];
  const answeredCount = questions.filter(isQuestionAnswered).length;
  const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const ratingConfig = {
    1: { label: 'Rất không hài lòng', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    2: { label: 'Chưa hài lòng', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    3: { label: 'Bình thường', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    4: { label: 'Hài lòng', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    5: { label: 'Rất hài lòng', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 flex items-center justify-center transition-all animate-fade-in"
      onClick={handleModalClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden text-slate-800 dark:text-slate-100 my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex items-start justify-between">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {detail?.survey?.scope === 'platform' || detail?.survey?.admin || !detail?.survey?.vendor ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> MIVA Platform
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800 shadow-xs">
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

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug font-sans">
              {detail?.survey?.title || 'Khảo sát ý kiến người dùng'}
            </h2>

            {detail?.survey?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                {detail.survey.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEdit && questions.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                Đã trả lời <span className="font-bold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>/{questions.length}
              </div>
            )}
            <button
              type="button"
              onClick={handleModalClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Visible while editing) */}
        {canEdit && questions.length > 0 && (
          <div className="shrink-0 w-full bg-slate-100 dark:bg-slate-800 h-1">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Scrollable Body Container with min-h-0 to avoid overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium font-sans">Đang tải nội dung khảo sát...</p>
            </div>
          ) : error && !detail ? (
            <div className="py-14 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-slate-800 dark:text-slate-100 font-semibold text-base font-sans">Không thể mở khảo sát</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={loadSurveyDetail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors mt-2"
              >
                <RotateCw className="w-3.5 h-3.5" /> Thử lại
              </button>
            </div>
          ) : justSubmitted ? (
            /* Dedicated Success Screen with Auto-Close Countdown */
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center border-4 border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping -z-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Đã gửi câu trả lời
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 font-sans">
                Cảm ơn bạn đã tham gia khảo sát!
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-6 font-sans">
                Những đóng góp chân thành của bạn là cơ sở quan trọng giúp MIVA không ngừng nâng cao chất lượng sản phẩm và trải nghiệm mua sắm.
              </p>

              {/* Countdown Bar */}
              <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((countdown !== null ? countdown : 2) / 2) * 100}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Cửa sổ sẽ tự động đóng sau <span className="font-bold text-emerald-600 dark:text-emerald-400">{countdown}</span> giây...
              </p>

              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Đóng ngay
              </button>
            </div>
          ) : (
            <>
              {/* Status Alert Banners */}
              {isSubmittedAlready && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Bạn đã hoàn thành khảo sát này</h4>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                      Ý kiến của bạn đã được ghi nhận vào hệ thống CRM MIVA. Dưới đây là câu trả lời đã gửi.
                    </p>
                  </div>
                </div>
              )}

              {isSkipped && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Khảo sát này đã được bỏ qua</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bạn có thể xem lại nội dung các câu hỏi bên dưới.
                    </p>
                  </div>
                </div>
              )}

              {isExpired && !isSubmittedAlready && !isSkipped && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Khảo sát đã hết hạn</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                      Thời hạn tham gia khảo sát này đã kết thúc. Bạn có thể xem lại câu hỏi nhưng không thể gửi phản hồi mới.
                    </p>
                  </div>
                </div>
              )}

              {error && detail && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-5 pb-4">
                {questions.map((q, idx) => {
                  const currentAnswer = answers[q.id] || {};
                  const isAnswered = isQuestionAnswered(q);
                  const displayTitle = cleanQuestionTitle(q.question);
                  const hoveredVal = hoverRating[q.id] || 0;
                  const currentRating = currentAnswer.ratingValue || 0;
                  const displayRating = hoveredVal > 0 ? hoveredVal : currentRating;

                  return (
                    <div 
                      key={q.id}
                      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
                        isAnswered
                          ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-850/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Question Title & Number */}
                      <div className="flex items-start gap-3 mb-4">
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-[15px] sm:text-base font-semibold text-slate-900 dark:text-white leading-snug font-sans">
                            {displayTitle}
                            {q.required && (
                              <span className="text-rose-500 font-bold ml-1 text-sm inline-block" title="Bắt buộc">*</span>
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* 1. Rating Question (Stars) */}
                      {q.type === 'rating' && (
                        <div className="mt-2 pl-0 sm:pl-10">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-xs">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const active = star <= displayRating;
                                return (
                                  <button
                                    type="button"
                                    key={star}
                                    disabled={!canEdit}
                                    onMouseEnter={() => canEdit && setHoverRating((prev) => ({ ...prev, [q.id]: star }))}
                                    onMouseLeave={() => canEdit && setHoverRating((prev) => ({ ...prev, [q.id]: null }))}
                                    onClick={() => handleRatingChange(q.id, star)}
                                    className={`p-1.5 rounded-xl transition-all duration-150 ${
                                      canEdit
                                        ? 'hover:scale-120 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/40'
                                        : 'cursor-default'
                                    }`}
                                    title={`${star} sao`}
                                  >
                                    <Star
                                      className={`w-7 h-7 transition-colors duration-150 ${
                                        active
                                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>

                            {displayRating > 0 && ratingConfig[displayRating] && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all animate-fade-in ${ratingConfig[displayRating].color}`}>
                                {ratingConfig[displayRating].label}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Single Choice Question (Radio Cards) */}
                      {q.type === 'single_choice' && (
                        <div className="mt-2 pl-0 sm:pl-10 space-y-2.5">
                          {q.options?.map((opt) => {
                            const isSelected = currentAnswer.optionId === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => canEdit && handleSingleChoiceChange(q.id, opt.id)}
                                className={`group flex items-center gap-3.5 p-3.5 rounded-xl border text-sm transition-all duration-150 select-none ${
                                  canEdit ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isSelected
                                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs ring-1 ring-emerald-500/30'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                              >
                                <div
                                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                                      : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="flex-1 leading-relaxed font-sans">{opt.content}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Multiple Choice Question (Checkboxes Cards) */}
                      {q.type === 'multiple_choice' && (
                        <div className="mt-2 pl-0 sm:pl-10 space-y-2.5">
                          {q.options?.map((opt) => {
                            const isSelected = (currentAnswer.optionIds || []).includes(opt.id);
                            return (
                              <div
                                key={opt.id}
                                onClick={() => canEdit && handleMultipleChoiceChange(q.id, opt.id)}
                                className={`group flex items-center gap-3.5 p-3.5 rounded-xl border text-sm transition-all duration-150 select-none ${
                                  canEdit ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isSelected
                                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs ring-1 ring-emerald-500/30'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                              >
                                <div
                                  className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                                      : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                </div>
                                <span className="flex-1 leading-relaxed font-sans">{opt.content}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. Text Question */}
                      {q.type === 'text' && (
                        <div className="mt-2 pl-0 sm:pl-10 space-y-1.5">
                          <textarea
                            rows={3}
                            disabled={!canEdit}
                            value={currentAnswer.textAnswer || ''}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            placeholder={canEdit ? 'Nhập ý kiến đóng góp chi tiết của bạn tại đây...' : 'Chưa có câu trả lời'}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none transition-all disabled:opacity-75 font-sans"
                          />
                          {canEdit && (
                            <div className="text-right text-[11px] text-slate-400 font-sans">
                              {(currentAnswer.textAnswer || '').length} ký tự
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer (Hidden if justSubmitted to avoid cluttering success view) */}
        {!justSubmitted && (
          <div className="shrink-0 p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70 backdrop-blur-xs">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi khảo sát</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
