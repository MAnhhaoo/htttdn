import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Store, 
  ShieldCheck, 
  Send, 
  RotateCw, 
  Check, 
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Home as HomeIcon,
  Package,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { surveyService } from '../../services/surveyService';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function SurveyPage() {
  const { responseId } = useParams();
  const navigate = useNavigate();

  // State for survey detail
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState({});
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // State for list if no responseId provided
  const [inboxList, setInboxList] = useState([]);
  const [inboxTab, setInboxTab] = useState('all');
  const openedRef = useRef(null);

  useEffect(() => {
    if (responseId) {
      loadSurveyDetail();
    } else {
      loadInboxList();
    }
  }, [responseId]);

  // Handle auto-redirect countdown when survey is submitted
  useEffect(() => {
    let timer;
    if (justSubmitted && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (justSubmitted && countdown === 0) {
      handleExit();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [justSubmitted, countdown]);

  const handleExit = () => {
    // If user has history, back; otherwise go to orders or home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/orders');
    }
  };

  const loadSurveyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (openedRef.current !== responseId) {
        openedRef.current = responseId;
        try {
          await surveyService.openResponse(responseId);
        } catch {
          // ignore open error
        }
      }
      const raw = await surveyService.getInboxDetail(responseId);
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

  const loadInboxList = async () => {
    try {
      setLoading(true);
      const raw = await surveyService.getSurveyInbox();
      const items = raw?.data?.list || raw?.list || raw?.data?.items || raw?.items || (Array.isArray(raw) ? raw : []);
      setInboxList(items);
    } catch (err) {
      console.error('Failed to load surveys inbox:', err);
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
    if (e) e.preventDefault();
    if (!detail) return;

    // Validate required questions
    const questions = detail.survey?.questions || [];
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val) {
          setError(`Vui lòng trả lời câu hỏi bắt buộc: "${cleanQuestionTitle(q.question)}"`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
          return;
        }
        if (q.type === 'rating' && !val.ratingValue) {
          setError(`Vui lòng đánh giá số sao cho: "${cleanQuestionTitle(q.question)}"`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
          return;
        }
        if (q.type === 'single_choice' && !val.optionId) {
          setError(`Vui lòng chọn 1 đáp án cho: "${cleanQuestionTitle(q.question)}"`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
          return;
        }
        if (q.type === 'multiple_choice' && (!val.optionIds || val.optionIds.length === 0)) {
          setError(`Vui lòng chọn ít nhất 1 đáp án cho: "${cleanQuestionTitle(q.question)}"`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
          return;
        }
        if (q.type === 'text' && (!val.textAnswer || !val.textAnswer.trim())) {
          setError(`Vui lòng nhập nội dung cho: "${cleanQuestionTitle(q.question)}"`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
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

      await surveyService.submitResponse(responseId, { answers: formattedAnswers });
      setJustSubmitted(true);
      setCountdown(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit survey error:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const ratingConfig = {
    1: { label: 'Rất không hài lòng', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    2: { label: 'Chưa hài lòng', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    3: { label: 'Bình thường', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    4: { label: 'Hài lòng', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    5: { label: 'Rất hài lòng', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  };

  // If no responseId was in URL, show survey inbox view
  if (!responseId) {
    const filteredInbox = inboxList.filter((item) => {
      if (inboxTab === 'pending') return item.status === 'pending' || item.status === 'opened';
      if (inboxTab === 'submitted') return item.status === 'submitted';
      return true;
    });

    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted mb-1">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-light-text dark:text-dark-text font-semibold">Khảo sát & Đóng góp ý kiến</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-2.5">
                <ClipboardList className="w-7 h-7 text-emerald-600" />
                Danh sách khảo sát người dùng
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1.5 bg-white dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border w-fit">
            <button
              onClick={() => setInboxTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted'
              }`}
            >
              Tất cả ({inboxList.length})
            </button>
            <button
              onClick={() => setInboxTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'pending'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted'
              }`}
            >
              Chưa hoàn thành ({inboxList.filter((i) => i.status !== 'submitted').length})
            </button>
            <button
              onClick={() => setInboxTab('submitted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                inboxTab === 'submitted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text dark:text-dark-muted'
              }`}
            >
              Đã gửi ({inboxList.filter((i) => i.status === 'submitted').length})
            </button>
          </div>

          {/* List content */}
          {loading ? (
            <Loading text="Đang tải danh sách khảo sát..." />
          ) : filteredInbox.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Không có khảo sát nào"
              description="Hiện tại bạn không có lời mời khảo sát nào cần thực hiện."
              actionText="Khám phá mua sắm"
              onAction={() => navigate('/products')}
            />
          ) : (
            <div className="grid gap-4">
              {filteredInbox.map((item) => {
                const isSubmitted = item.status === 'submitted';
                const isMiva = item.survey?.scope === 'platform' || item.survey?.admin || !item.survey?.vendor;
                const senderName = isMiva ? 'MIVA Platform' : (item.survey?.vendor?.storeName || 'Cửa hàng MIVA');

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
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                        </span>
                      ) : null}

                      <Link
                        to={`/surveys/${item.id}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          isSubmitted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow'
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
      </div>
    );
  }

  // If responseId is provided, render the survey detail and form
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
              onClick={loadSurveyDetail}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Thử lại
            </button>
            <button
              onClick={handleExit}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-light-border dark:border-dark-border text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSubmittedAlready = detail?.status === 'submitted' && !justSubmitted;
  const isSkipped = detail?.status === 'skipped';
  const isExpired = (detail?.expiresAt && new Date(detail.expiresAt) < new Date()) || detail?.survey?.status === 'closed';
  const canEdit = !!detail && !isSubmittedAlready && !isSkipped && !isExpired && !justSubmitted;

  const questions = detail?.survey?.questions || [];
  const answeredCount = questions.filter(isQuestionAnswered).length;
  const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navigation Bar with Back & Out Controls */}
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

          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text rounded-xl shadow-xs hover:bg-gray-50 dark:hover:bg-dark-border transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>

        {/* Dedicated Thank-you & Exit Screen upon submission */}
        {justSubmitted ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-center space-y-6 shadow-xl animate-fade-in">
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -inset-2 rounded-full bg-emerald-500/15 animate-ping -z-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5" /> Gửi phản hồi thành công
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-light-text dark:text-dark-text">
                Cảm ơn bạn đã tham gia khảo sát!
              </h2>
              <p className="text-sm text-light-muted dark:text-dark-muted max-w-md mx-auto leading-relaxed">
                Những chia sẻ quý báu của bạn đã được ghi nhận vào hệ thống CRM MIVA và là động lực to lớn giúp chúng tôi không ngừng cải tiến dịch vụ.
              </p>
            </div>

            {/* Auto countdown bar */}
            <div className="max-w-xs mx-auto space-y-2 pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((countdown !== null ? countdown : 4) / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Tự động thoát sau <strong className="text-emerald-600 dark:text-emerald-400">{countdown}</strong> giây...
              </p>
            </div>

            {/* Exit Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Package className="w-4 h-4" /> Về danh sách đơn hàng
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-light-muted hover:text-light-text dark:text-dark-muted text-sm font-semibold transition-all cursor-pointer"
              >
                <HomeIcon className="w-4 h-4" /> Trang chủ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Survey Header Banner Card */}
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
                  <div className="text-xs font-semibold text-light-muted dark:text-dark-muted bg-gray-50 dark:bg-dark-bg px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border">
                    Tiến độ: <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong>/{questions.length} câu hỏi
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

              {/* Progress Bar */}
              {canEdit && questions.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="w-full bg-gray-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-medium text-light-muted dark:text-dark-muted">
                    Hoàn thành {progressPercentage}%
                  </div>
                </div>
              )}
            </div>

            {/* Status Alert Banners */}
            {isSubmittedAlready && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Bạn đã hoàn thành khảo sát này</h4>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                    Câu trả lời của bạn đã được ghi nhận. Dưới đây là nội dung bạn đã đóng góp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExit}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  Thoát ra
                </button>
              </div>
            )}

            {isExpired && !isSubmittedAlready && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Khảo sát đã hết hạn tham gia</h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Thời gian tiếp nhận phản hồi cho đợt khảo sát này đã kết thúc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExit}
                  className="px-3.5 py-1.5 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100 transition cursor-pointer"
                >
                  Thoát ra
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Questions List */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 ${
                      isAnswered
                        ? 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border shadow-xs'
                        : 'bg-white/80 dark:bg-dark-card/60 border-light-border/70 dark:border-dark-border/70 hover:border-light-border dark:hover:border-dark-border'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text leading-snug">
                          {displayTitle}
                          {q.required && (
                            <span className="text-rose-500 font-bold ml-1.5" title="Bắt buộc">*</span>
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* 1. Rating Question (Stars) */}
                    {q.type === 'rating' && (
                      <div className="pl-0 sm:pl-11">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-light-border dark:border-dark-border shadow-xs">
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
                                  className={`p-2 rounded-xl transition-all duration-150 ${
                                    canEdit
                                      ? 'hover:scale-125 active:scale-95 cursor-pointer focus:outline-none'
                                      : 'cursor-default'
                                  }`}
                                  title={`${star} sao`}
                                >
                                  <Star
                                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150 ${
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
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${ratingConfig[displayRating].color}`}>
                              {ratingConfig[displayRating].label}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Single Choice Question (Radio Cards) */}
                    {q.type === 'single_choice' && (
                      <div className="pl-0 sm:pl-11 space-y-2.5">
                        {q.options?.map((opt) => {
                          const isSelected = currentAnswer.optionId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => canEdit && handleSingleChoiceChange(q.id, opt.id)}
                              className={`group flex items-center gap-3.5 p-4 rounded-2xl border text-sm transition-all duration-150 select-none ${
                                canEdit ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                isSelected
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                                  : 'bg-white dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/80 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
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
                      <div className="pl-0 sm:pl-11 space-y-2.5">
                        {q.options?.map((opt) => {
                          const isSelected = (currentAnswer.optionIds || []).includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => canEdit && handleMultipleChoiceChange(q.id, opt.id)}
                              className={`group flex items-center gap-3.5 p-4 rounded-2xl border text-sm transition-all duration-150 select-none ${
                                canEdit ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                isSelected
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                                  : 'bg-white dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/80 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 scale-105'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
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
                      <div className="pl-0 sm:pl-11 space-y-2">
                        <textarea
                          rows={4}
                          disabled={!canEdit}
                          value={currentAnswer.textAnswer || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder={canEdit ? 'Nhập ý kiến đóng góp chi tiết của bạn tại đây...' : 'Chưa có câu trả lời'}
                          className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted resize-none transition-all disabled:opacity-75"
                        />
                        {canEdit && (
                          <div className="text-right text-xs text-light-muted dark:text-dark-muted">
                            {(currentAnswer.textAnswer || '').length} ký tự
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Actions Bar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-between flex-wrap gap-4 shadow-luxury">
                <button
                  type="button"
                  onClick={handleExit}
                  className="px-5 py-2.5 text-sm font-semibold text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
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
            </form>
          </>
        )}
      </div>
    </div>
  );
}
