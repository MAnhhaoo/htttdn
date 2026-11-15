import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  AlertCircle,
  Clock,
  Store,
  ShieldCheck,
  Send,
  RotateCw,
  Maximize2,
} from 'lucide-react';
import { useSurveyResponseForm } from '../../hooks/useSurveyResponseForm';
import SurveyFormContent, { SurveyProgressBar } from './SurveyFormContent';

export default function SurveyModal({ isOpen, onClose, surveyResponseId, onSubmitted }) {
  const navigate = useNavigate();

  const form = useSurveyResponseForm({
    responseId: surveyResponseId,
    enabled: Boolean(isOpen && surveyResponseId),
    countdownSeconds: 2,
    onSubmitted,
    onCountdownComplete: () => onClose(),
  });

  if (!isOpen || typeof document === 'undefined') return null;

  const {
    loading,
    submitting,
    detail,
    error,
    justSubmitted,
    loadSurveyDetail,
    handleSubmit,
    canEdit,
    questions,
    answeredCount,
    progressPercentage,
  } = form;

  const handleModalClose = () => {
    form.resetForm();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 flex items-center justify-center transition-all animate-fade-in"
      onClick={handleModalClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl sm:rounded-3xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden text-light-text dark:text-dark-text my-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-light-border dark:border-dark-border bg-white/95 dark:bg-dark-card/95 backdrop-blur-xs flex items-start justify-between">
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
                <span className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn: {new Date(detail.expiresAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text leading-snug">
              {detail?.survey?.title || 'Khảo sát ý kiến người dùng'}
            </h2>

            {detail?.survey?.description && (
              <p className="text-sm text-light-muted dark:text-dark-muted mt-1.5 line-clamp-2 leading-relaxed">
                {detail.survey.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canEdit && questions.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-light-muted dark:text-dark-muted bg-light-bg dark:bg-dark-bg px-2.5 py-1 rounded-lg mr-1 border border-light-border dark:border-dark-border">
                Đã trả lời{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>/
                {questions.length}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                handleModalClose();
                if (surveyResponseId) {
                  navigate(`/surveys/${surveyResponseId}`);
                }
              }}
              className="p-2 rounded-xl text-light-muted hover:text-primary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer"
              title="Mở toàn màn hình / trang riêng"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              className="p-2 rounded-xl text-light-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <SurveyProgressBar
          canEdit={canEdit}
          totalQuestions={questions.length}
          progressPercentage={progressPercentage}
        />

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-light-muted dark:text-dark-muted gap-3">
              <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải nội dung khảo sát...</p>
            </div>
          ) : error && !detail ? (
            <div className="py-14 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-light-text dark:text-dark-text font-semibold text-base">
                Không thể mở khảo sát
              </p>
              <p className="text-sm text-light-muted max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={loadSurveyDetail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-light-bg hover:bg-light-border/60 dark:bg-dark-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text text-xs font-semibold rounded-xl transition-colors mt-2 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Thử lại
              </button>
            </div>
          ) : (
            <SurveyFormContent form={form} variant="modal" onExit={handleModalClose} />
          )}
        </div>

        {/* Footer */}
        {!justSubmitted && (
          <div className="shrink-0 p-4 px-6 border-t border-light-border dark:border-dark-border flex items-center justify-between bg-light-bg/70 dark:bg-dark-bg/70 backdrop-blur-xs">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-sm font-medium text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-border/40 dark:hover:bg-dark-border/40 rounded-xl transition-colors cursor-pointer"
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
    </div>,
    document.body,
  );
}
