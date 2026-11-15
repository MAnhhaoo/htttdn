import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Store,
  ShieldCheck,
  Send,
  RotateCw,
  ArrowLeft,
  ShoppingBag,
  Home as HomeIcon,
  Package,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { surveyService } from '../../services/surveyService';
import { useSurveyResponseForm } from '../../hooks/useSurveyResponseForm';
import SurveyFormContent, { SurveyProgressBar } from '../../components/survey/SurveyFormContent';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function SurveyPage() {
  const { responseId } = useParams();
  const navigate = useNavigate();

  // State for inbox list when no responseId is in URL
  const [inboxLoading, setInboxLoading] = useState(!responseId);
  const [inboxList, setInboxList] = useState([]);
  const [inboxTab, setInboxTab] = useState('all');

  const handleExit = useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/surveys');
    }
  }, [navigate]);

  const form = useSurveyResponseForm({
    responseId,
    enabled: Boolean(responseId),
    countdownSeconds: 4,
    onCountdownComplete: handleExit,
    scrollOnError: true,
  });

  useEffect(() => {
    if (!responseId) {
      let active = true;
      setInboxLoading(true);
      surveyService
        .getSurveyInbox()
        .then((raw) => {
          if (!active) return;
          const items =
            raw?.data?.list ||
            raw?.list ||
            raw?.data?.items ||
            raw?.items ||
            (Array.isArray(raw) ? raw : []);
          setInboxList(items);
        })
        .catch((err) => {
          console.error('Failed to load surveys inbox:', err);
        })
        .finally(() => {
          if (active) setInboxLoading(false);
        });
      return () => {
        active = false;
      };
    }
    return undefined;
  }, [responseId]);

  // ── Mode 1: Survey Inbox View (/surveys inside AccountLayout) ──
  if (!responseId) {
    const filteredInbox = inboxList.filter((item) => {
      if (inboxTab === 'pending') return item.status !== 'submitted';
      if (inboxTab === 'submitted') return item.status === 'submitted';
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Khảo sát & Đóng góp ý kiến
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
              Chia sẻ trải nghiệm mua sắm của bạn để MIVA và đối tác phục vụ tốt hơn
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 p-1.5 bg-white dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border w-fit">
            <button
              type="button"
              onClick={() => setInboxTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'all'
                  ? 'bg-[#1A3A2C] text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text'
              }`}
            >
              Tất cả ({inboxList.length})
            </button>
            <button
              type="button"
              onClick={() => setInboxTab('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'pending'
                  ? 'bg-[#1A3A2C] text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text'
              }`}
            >
              Chưa hoàn thành ({inboxList.filter((i) => i.status !== 'submitted').length})
            </button>
            <button
              type="button"
              onClick={() => setInboxTab('submitted')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'submitted'
                  ? 'bg-[#1A3A2C] text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text'
              }`}
            >
              Đã gửi ({inboxList.filter((i) => i.status === 'submitted').length})
            </button>
          </div>
        </div>

        {inboxLoading ? (
          <Loading text="Đang tải danh sách khảo sát..." />
        ) : filteredInbox.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-8">
            <EmptyState
              icon={ClipboardList}
              title="Không có khảo sát nào"
              description="Hiện tại bạn không có lời mời khảo sát nào trong mục này."
              actionText="Khám phá mua sắm"
              onAction={() => navigate('/products')}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInbox.map((item) => {
              const isSubmitted = item.status === 'submitted';
              const isMiva =
                item.survey?.scope === 'platform' || item.survey?.admin || !item.survey?.vendor;
              const senderName = isMiva
                ? 'MIVA Platform'
                : item.survey?.vendor?.storeName || 'Cửa hàng MIVA';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isMiva ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5" /> {senderName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          <Store className="w-3.5 h-3.5" /> {senderName}
                        </span>
                      )}

                      {item.expiresAt && (
                        <span className="text-xs text-light-muted dark:text-dark-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Hạn: {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-light-text dark:text-dark-text">
                      {item.survey?.title || 'Khảo sát chất lượng'}
                    </h3>

                    {item.survey?.description && (
                      <p className="text-xs text-light-muted dark:text-dark-muted line-clamp-2">
                        {item.survey.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isSubmitted && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                      </span>
                    )}

                    <Link
                      to={`/surveys/${item.id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                        isSubmitted
                          ? 'bg-light-bg hover:bg-light-border/60 text-light-text dark:bg-dark-bg dark:text-dark-text border border-light-border dark:border-dark-border'
                          : 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow'
                      }`}
                    >
                      {isSubmitted ? 'Xem lại câu trả lời' : 'Bắt đầu khảo sát'}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Mode 2: Standalone Survey Detail & Form (/surveys/:responseId) ──
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-dark-bg py-16">
        <Loading text="Đang tải nội dung khảo sát..." />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-dark-bg py-16 px-4">
        <div className="max-w-lg mx-auto p-8 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-center space-y-4 shadow-lg">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Không thể mở khảo sát</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadSurveyDetail}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Thử lại
            </button>
            <Link
              to="/surveys"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-light-border dark:border-dark-border text-xs font-bold rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Về danh sách khảo sát
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
          <div className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <HomeIcon className="w-3.5 h-3.5" /> Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/surveys" className="hover:text-primary transition-colors">
              Khảo sát
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-light-text dark:text-dark-text font-semibold line-clamp-1 max-w-[200px]">
              {detail?.survey?.title || 'Khảo sát ý kiến'}
            </span>
          </div>

          <Link
            to="/surveys"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text rounded-xl shadow-xs hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Danh sách khảo sát
          </Link>
        </div>

        {/* Survey Header Banner Card (shown while viewing/answering) */}
        {!justSubmitted && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-luxury dark:shadow-luxury-dark space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {detail?.survey?.scope === 'platform' || detail?.survey?.admin || !detail?.survey?.vendor ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                    <ShieldCheck className="w-4 h-4" /> MIVA Platform
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800">
                    <Store className="w-4 h-4" /> {detail?.survey?.vendor?.storeName || 'Cửa hàng đối tác'}
                  </span>
                )}

                {detail?.expiresAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted">
                    <Clock className="w-3.5 h-3.5" />
                    Hạn: {new Date(detail.expiresAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              {canEdit && questions.length > 0 && (
                <div className="text-xs font-semibold text-light-muted dark:text-dark-muted bg-light-bg dark:bg-dark-bg px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border">
                  Tiến độ:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong>/
                  {questions.length} câu hỏi
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-light-text dark:text-dark-text leading-tight">
                {detail?.survey?.title || 'Khảo sát ý kiến khách hàng'}
              </h1>
              {detail?.survey?.description && (
                <p className="text-sm text-light-muted dark:text-dark-muted mt-2 leading-relaxed">
                  {detail.survey.description}
                </p>
              )}
            </div>

            <SurveyProgressBar
              canEdit={canEdit}
              totalQuestions={questions.length}
              progressPercentage={progressPercentage}
              showLabel
            />
          </div>
        )}

        {/* Shared Survey Form Content */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <SurveyFormContent
            form={form}
            variant="page"
            onExit={handleExit}
            thankYouActions={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/surveys')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A3A2C] hover:bg-[#2A5C4A] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" /> Về danh sách khảo sát
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-bold text-sm rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4" /> Đơn mua của tôi
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-light-muted hover:text-primary dark:text-dark-muted text-sm font-semibold transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
                </button>
              </div>
            }
          />

          {/* Bottom Actions Bar */}
          {!justSubmitted && (
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-between flex-wrap gap-4 shadow-luxury dark:shadow-luxury-dark">
              <button
                type="button"
                onClick={handleExit}
                className="px-5 py-2.5 text-sm font-semibold text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer"
              >
                Thoát ra
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang gửi khảo sát...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi câu trả lời khảo sát</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
