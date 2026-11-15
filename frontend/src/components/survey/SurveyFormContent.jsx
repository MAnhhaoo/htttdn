import {
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react';
import { cleanQuestionTitle } from '../../hooks/useSurveyResponseForm';

const RATING_CONFIG = {
  1: {
    label: 'Rất không hài lòng',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
  2: {
    label: 'Chưa hài lòng',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  3: {
    label: 'Bình thường',
    color: 'text-primary bg-primary/10 dark:bg-primary/20 border-primary/30',
  },
  4: {
    label: 'Hài lòng',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  5: {
    label: 'Rất hài lòng',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
};

export function SurveyProgressBar({ canEdit, totalQuestions, progressPercentage, showLabel = false }) {
  if (!canEdit || totalQuestions <= 0) return null;

  if (showLabel) {
    return (
      <div className="space-y-1.5 pt-2">
        <div className="w-full bg-light-bg dark:bg-dark-bg h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-right text-[11px] font-medium text-light-muted dark:text-dark-muted">
          Hoàn thành {progressPercentage}%
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 w-full bg-light-bg dark:bg-dark-bg h-1">
      <div
        className="h-full bg-emerald-500 transition-all duration-300 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
}

export default function SurveyFormContent({
  form,
  variant = 'page',
  onExit,
  thankYouActions,
}) {
  const {
    answers,
    error,
    hoverRating,
    setHoverRating,
    justSubmitted,
    countdown,
    countdownSeconds,
    handleRatingChange,
    handleSingleChoiceChange,
    handleMultipleChoiceChange,
    handleTextChange,
    isQuestionAnswered,
    isSubmittedAlready,
    isSkipped,
    isExpired,
    canEdit,
    questions,
  } = form;

  const isModal = variant === 'modal';

  if (justSubmitted) {
    const ratio = ((countdown !== null ? countdown : countdownSeconds) / countdownSeconds) * 100;
    return (
      <div
        className={`${
          isModal
            ? 'py-10 px-4'
            : 'p-8 sm:p-12 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-luxury dark:shadow-luxury-dark'
        } flex flex-col items-center justify-center text-center animate-fade-in`}
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center border-4 border-emerald-500/20 shadow-xl shadow-emerald-500/15">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping -z-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Gửi phản hồi thành công
        </span>

        <h3 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text mb-2">
          Cảm ơn bạn đã tham gia khảo sát!
        </h3>

        <p className="text-sm text-light-muted dark:text-dark-muted max-w-md mx-auto leading-relaxed mb-6">
          Những chia sẻ chân thành của bạn đã được ghi nhận vào hệ thống CRM MIVA và là cơ sở quan trọng giúp chúng tôi nâng cao trải nghiệm mua sắm.
        </p>

        {/* Countdown Bar */}
        <div className="w-full max-w-xs bg-light-bg dark:bg-dark-bg rounded-full h-1.5 overflow-hidden mb-3">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${ratio}%` }}
          />
        </div>

        <p className="text-xs text-light-muted dark:text-dark-muted mb-6 flex items-center justify-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {isModal ? 'Cửa sổ sẽ tự động đóng sau' : 'Tự động thoát sau'}{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{countdown}</strong> giây...
        </p>

        {thankYouActions || (
          <button
            type="button"
            onClick={onExit}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Đóng ngay
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status Alert Banners */}
      {isSubmittedAlready && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Bạn đã hoàn thành khảo sát này</h4>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
              Ý kiến của bạn đã được ghi nhận vào hệ thống CRM MIVA. Dưới đây là câu trả lời đã gửi.
            </p>
          </div>
          {!isModal && onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition cursor-pointer shrink-0"
            >
              Thoát ra
            </button>
          )}
        </div>
      )}

      {isSkipped && (
        <div className="p-4 rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-light-muted shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Khảo sát này đã được bỏ qua</h4>
            <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
              Bạn có thể xem lại nội dung các câu hỏi bên dưới.
            </p>
          </div>
        </div>
      )}

      {isExpired && !isSubmittedAlready && !isSkipped && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Khảo sát đã hết hạn tham gia</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
              Thời hạn tiếp nhận phản hồi cho khảo sát này đã kết thúc. Bạn có thể xem lại câu hỏi nhưng không thể gửi mới.
            </p>
          </div>
          {!isModal && onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-1.5 border border-amber-300 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer shrink-0"
            >
              Thoát ra
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
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
              className={`${
                isModal ? 'p-5 sm:p-6 rounded-2xl' : 'p-6 sm:p-7 rounded-3xl'
              } border transition-all duration-200 ${
                isAnswered
                  ? 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border shadow-xs'
                  : 'bg-light-bg/70 dark:bg-dark-card/60 border-light-border/70 dark:border-dark-border/70 hover:border-light-border dark:hover:border-dark-border'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="text-[15px] sm:text-base font-bold text-light-text dark:text-dark-text leading-snug">
                    {displayTitle}
                    {q.required && (
                      <span className="text-rose-500 font-bold ml-1.5" title="Bắt buộc">
                        *
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              {/* 1. Rating Question (Stars) */}
              {q.type === 'rating' && (
                <div className="mt-2 pl-0 sm:pl-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1.5 bg-light-bg dark:bg-dark-bg rounded-2xl border border-light-border dark:border-dark-border shadow-xs">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= displayRating;
                        return (
                          <button
                            type="button"
                            key={star}
                            disabled={!canEdit}
                            onMouseEnter={() =>
                              canEdit && setHoverRating((prev) => ({ ...prev, [q.id]: star }))
                            }
                            onMouseLeave={() =>
                              canEdit && setHoverRating((prev) => ({ ...prev, [q.id]: null }))
                            }
                            onClick={() => handleRatingChange(q.id, star)}
                            className={`p-1.5 rounded-xl transition-all duration-150 ${
                              canEdit
                                ? 'hover:scale-115 active:scale-95 cursor-pointer focus:outline-none'
                                : 'cursor-default'
                            }`}
                            title={`${star} sao`}
                          >
                            <Star
                              className={`${
                                isModal ? 'w-7 h-7' : 'w-8 h-8'
                              } transition-colors duration-150 ${
                                active
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                  : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {displayRating > 0 && RATING_CONFIG[displayRating] && (
                      <span
                        className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border transition-all ${RATING_CONFIG[displayRating].color}`}
                      >
                        {RATING_CONFIG[displayRating].label}
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
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg/80 hover:border-primary/40'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-primary/60'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1 leading-relaxed">{opt.content}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Multiple Choice Question (Checkbox Cards) */}
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
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg/80 hover:border-primary/40'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-primary/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className="flex-1 leading-relaxed">{opt.content}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. Text Question */}
              {q.type === 'text' && (
                <div className="mt-2 pl-0 sm:pl-10 space-y-1.5">
                  <textarea
                    rows={isModal ? 3 : 4}
                    disabled={!canEdit}
                    value={currentAnswer.textAnswer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder={
                      canEdit
                        ? 'Nhập ý kiến đóng góp chi tiết của bạn tại đây...'
                        : 'Chưa có câu trả lời'
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted resize-none transition-all disabled:opacity-75"
                  />
                  {canEdit && (
                    <div className="text-right text-[11px] text-light-muted dark:text-dark-muted">
                      {(currentAnswer.textAnswer || '').length} ký tự
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
