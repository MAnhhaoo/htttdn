import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Store,
  Star,
  Calendar,
  CalendarPlus,
  Users,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { SurveyQuestionBuilder } from '@shared/components/surveys/SurveyQuestionBuilder';
import { SurveyResultsPanel } from '@shared/components/surveys/SurveyResultsPanel';
import { SurveyPreviewModal } from '@shared/components/surveys/SurveyPreviewModal';
import { ExtendEndDateModal } from '@shared/components/common/ExtendEndDateModal';
import { surveyService } from '../../services/surveyService';
import { Button, Modal, useToast } from '../../components/ui';

const CUSTOM_TOPIC_LABEL = 'Khác (Tự nhập chủ đề)';

function normalizeTemplateQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q, idx) => ({
    id: String(idx + 1),
    question: q.question || '',
    type: q.type || 'rating',
    required: Boolean(q.required),
    options: Array.isArray(q.options) ? [...q.options] : [],
  }));
}

export default function SurveyManagement() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('list');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Templates loaded from API
  const [vendorTopics, setVendorTopics] = useState([CUSTOM_TOPIC_LABEL]);
  const [shopTemplates, setShopTemplates] = useState([]);

  // Results state
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [surveyResults, setSurveyResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Extend modal state
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [surveyToExtend, setSurveyToExtend] = useState(null);

  // Soft-delete modal state
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Admin Surveys Inbox state
  const [adminInbox, setAdminInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [activeInboxItem, setActiveInboxItem] = useState(null);
  const [vendorAnswers, setVendorAnswers] = useState({});
  const [inboxSubmitting, setInboxSubmitting] = useState(false);

  // Preview Modal
  const [previewSurvey, setPreviewSurvey] = useState(null);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(CUSTOM_TOPIC_LABEL);
  const [customTopic, setCustomTopic] = useState('');
  const [audienceType, setAudienceType] = useState('vendor_buyers');
  const [triggerType, setTriggerType] = useState('manual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await surveyService.getMine(params);
      const items = res?.list || (Array.isArray(res) ? res : []);
      setSurveys(items);
    } catch (err) {
      console.error('Failed to load surveys:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadAdminInbox = useCallback(async () => {
    try {
      setInboxLoading(true);
      const res = await surveyService.getInbox({ page: 1, itemPerPage: 50 });
      const items =
        res?.data?.list ||
        res?.list ||
        res?.data?.items ||
        res?.items ||
        (Array.isArray(res) ? res : []);
      setAdminInbox(items);
    } catch (err) {
      console.error('Failed to load admin survey inbox:', err);
    } finally {
      setInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadTemplates = async () => {
      try {
        const res = await surveyService.getTemplates('shop');
        const raw = res?.data ?? res;
        const apiTopics = Array.isArray(raw?.topics) ? raw.topics : [];
        const apiTemplates = Array.isArray(raw?.templates) ? raw.templates : [];
        if (!mounted) return;

        const mergedTopics = apiTopics.includes(CUSTOM_TOPIC_LABEL)
          ? apiTopics
          : [...apiTopics, CUSTOM_TOPIC_LABEL];
        setVendorTopics(mergedTopics);
        setShopTemplates(apiTemplates);

        if (apiTemplates.length > 0) {
          const first = apiTemplates[0];
          setSelectedTopic(first.topic || mergedTopics[0]);
          setTitle(first.title || '');
          setDescription(first.description || '');
          setImageUrl(first.imageUrl || '');
          setAudienceType(first.audienceType || 'vendor_buyers');
          setTriggerType(first.triggerType || 'manual');
          setQuestions(normalizeTemplateQuestions(first.questions));
        }
      } catch (err) {
        console.error('Failed to load shop survey templates:', err);
      }
    };

    loadTemplates();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  useEffect(() => {
    loadAdminInbox();
  }, [loadAdminInbox]);

  const handleOpenAdminSurvey = useCallback(
    async (responseId) => {
      try {
        setInboxLoading(true);
        try {
          await surveyService.openResponse(responseId);
        } catch {
          // ignore
        }
        const res = await surveyService.getInboxDetail(responseId);
        const detail = res?.data || res;
        setActiveInboxItem(detail);
        const initAns = {};
        if (Array.isArray(detail?.answers)) {
          detail.answers.forEach((a) => {
            if (a.ratingValue !== null && a.ratingValue !== undefined) {
              initAns[a.questionId] = { ratingValue: a.ratingValue };
            } else if (a.textAnswer !== null && a.textAnswer !== undefined) {
              initAns[a.questionId] = { textAnswer: a.textAnswer };
            } else if (a.optionId) {
              const q = detail.survey?.questions?.find((item) => item.id === a.questionId);
              if (q?.type === 'multiple_choice') {
                initAns[a.questionId] = initAns[a.questionId] || { optionIds: [] };
                initAns[a.questionId].optionIds.push(a.optionId);
              } else {
                initAns[a.questionId] = { optionId: a.optionId };
              }
            }
          });
        }
        setVendorAnswers(initAns);
      } catch (err) {
        toast.error('Không thể mở khảo sát: ' + (err.response?.data?.message || err.message));
      } finally {
        setInboxLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const respId = searchParams.get('responseId');
    if (tabParam === 'from_admin') {
      setActiveTab('from_admin');
      if (respId) {
        handleOpenAdminSurvey(respId);
      }
    }
  }, [searchParams, handleOpenAdminSurvey]);

  const handleSubmitVendorSurvey = async (e) => {
    if (e) e.preventDefault();
    if (!activeInboxItem) return;
    const qs = activeInboxItem.survey?.questions || [];
    for (const q of qs) {
      if (q.required) {
        const v = vendorAnswers[q.id];
        if (
          !v ||
          (q.type === 'rating' && !v.ratingValue) ||
          (q.type === 'single_choice' && !v.optionId) ||
          (q.type === 'multiple_choice' && (!v.optionIds || v.optionIds.length === 0)) ||
          (q.type === 'text' && (!v.textAnswer || !v.textAnswer.trim()))
        ) {
          toast.error(`Vui lòng trả lời câu hỏi bắt buộc: "${q.question}"`);
          return;
        }
      }
    }
    try {
      setInboxSubmitting(true);
      const formatted = [];
      Object.entries(vendorAnswers).forEach(([questionId, ans]) => {
        if (ans.optionIds?.length) {
          formatted.push({ questionId, optionIds: ans.optionIds });
        } else if (ans.optionId) {
          formatted.push({ questionId, optionIds: [ans.optionId] });
        } else if (ans.ratingValue !== undefined && ans.ratingValue !== null) {
          formatted.push({ questionId, ratingValue: ans.ratingValue });
        } else if (ans.textAnswer?.trim()) {
          formatted.push({ questionId, textAnswer: ans.textAnswer.trim() });
        }
      });
      await surveyService.submitResponse(activeInboxItem.id, { answers: formatted });
      toast.success('Đã gửi phản hồi khảo sát về Ban Quản Trị MIVA thành công!');
      setActiveInboxItem(null);
      setSearchParams({});
      await loadAdminInbox();
    } catch (err) {
      toast.error('Không thể gửi khảo sát: ' + (err.response?.data?.message || err.message));
    } finally {
      setInboxSubmitting(false);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    const preset = shopTemplates.find((tpl) => tpl.topic === topic);
    if (preset) {
      setTitle(preset.title || topic);
      setDescription(preset.description || '');
      if (preset.imageUrl) setImageUrl(preset.imageUrl);
      if (preset.audienceType) setAudienceType(preset.audienceType);
      if (preset.triggerType) setTriggerType(preset.triggerType);
      setQuestions(normalizeTemplateQuestions(preset.questions));
    } else if (topic !== CUSTOM_TOPIC_LABEL) {
      setTitle(topic);
    }
  };

  const handleOpenResults = async (surveyId) => {
    try {
      setSelectedSurveyId(surveyId);
      setActiveTab('results');
      setResultsLoading(true);
      const res = await surveyService.getResults(surveyId);
      setSurveyResults(res);
    } catch (err) {
      console.error('Failed to load results:', err);
      toast.error('Không thể tải kết quả: ' + (err.response?.data?.message || err.message));
    } finally {
      setResultsLoading(false);
    }
  };

  const handleChangeStatus = async (surveyId, newStatus) => {
    try {
      await surveyService.changeStatus(surveyId, newStatus);
      toast.success(
        newStatus === 'active'
          ? 'Đã kích hoạt khảo sát!'
          : 'Đã đóng chương trình khảo sát.',
      );
      loadSurveys();
      if (selectedSurveyId === surveyId) {
        handleOpenResults(surveyId);
      }
    } catch (err) {
      toast.error(
        'Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleOpenExtendModal = (survey) => {
    setSurveyToExtend(survey);
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = async (isoEnd) => {
    if (!surveyToExtend) return;
    await surveyService.extendSurvey(surveyToExtend.id, isoEnd);
    await loadSurveys();
    toast.success(
      `Đã gia hạn khảo sát "${surveyToExtend.title}" đến ${new Date(isoEnd).toLocaleDateString('vi-VN')}!`,
    );
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete || isDeleting) return;
    const target = surveyToDelete;
    try {
      setIsDeleting(true);
      await surveyService.deleteSurvey(target.id);
      toast.success(`Đã xóa mềm khảo sát "${target.title}" khỏi danh sách quản lý.`);
      if (selectedSurveyId === target.id) {
        setSelectedSurveyId(null);
        setSurveyResults(null);
        if (activeTab === 'results') {
          setActiveTab('list');
        }
      }
      setSurveyToDelete(null);
      await loadSurveys();
    } catch (err) {
      console.error('Failed to delete survey:', err);
      toast.error(
        'Không thể xóa mềm khảo sát: ' + (err.response?.data?.message || err.message),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddQuestion = (type) => {
    const newQ = {
      id: Date.now().toString(),
      question: '',
      type,
      required: false,
      options:
        type === 'single_choice' || type === 'multiple_choice'
          ? ['Lựa chọn 1', 'Lựa chọn 2']
          : [],
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: [...(q.options || []), `Lựa chọn ${(q.options || []).length + 1}`],
            }
          : q,
      ),
    );
  };

  const handleUpdateOption = (qIndex, optIndex, val) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: (q.options || []).map((opt, oi) => (oi === optIndex ? val : opt)),
            }
          : q,
      ),
    );
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: (q.options || []).filter((_, oi) => oi !== optIndex) }
          : q,
      ),
    );
  };

  const handleCreateSurvey = async (activateImmediately = false) => {
    const surveyTitle =
      title.trim() || (selectedTopic === CUSTOM_TOPIC_LABEL ? customTopic.trim() : selectedTopic);
    if (!surveyTitle) {
      toast.error('Vui lòng nhập tiêu đề hoặc chủ đề khảo sát.');
      return;
    }
    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi khảo sát.');
      return;
    }
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error('Có câu hỏi chưa nhập nội dung.');
        return;
      }
      if (
        (q.type === 'single_choice' || q.type === 'multiple_choice') &&
        (q.options || []).length < 2
      ) {
        toast.error(`Câu hỏi trắc nghiệm "${q.question}" cần ít nhất 2 đáp án.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: surveyTitle,
        description: description.trim() || undefined,
        imageUrl: imageUrl && imageUrl.trim().startsWith('http') ? imageUrl.trim() : undefined,
        scope: 'vendor',
        audienceType,
        triggerType,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        questions: questions.map((q, idx) => ({
          question: q.question.trim(),
          type: q.type,
          required: Boolean(q.required),
          position: idx + 1,
          options:
            q.type === 'single_choice' || q.type === 'multiple_choice'
              ? q.options.map((opt, oIdx) => ({ content: opt.trim(), position: oIdx + 1 }))
              : undefined,
        })),
      };

      const res = await surveyService.createSurvey(payload);
      const created = res?.data || res;

      if (activateImmediately && created?.id) {
        await surveyService.changeStatus(created.id, 'active');
      }

      toast.success(
        activateImmediately
          ? 'Khảo sát đã được kích hoạt và gửi thông báo tới khách hàng!'
          : 'Đã lưu bản nháp khảo sát thành công!',
      );
      loadSurveys();
      setActiveTab('list');
    } catch (err) {
      console.error('Error creating survey:', err);
      const data = err.response?.data;
      let errorText = err.message;
      if (data?.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorText = data.errors
            .map((e) => e.message || e.error || JSON.stringify(e))
            .join(', ');
        } else if (typeof data.errors === 'string') {
          errorText = data.errors;
        }
      } else if (data?.message && data.message !== 'ERROR') {
        errorText = data.message;
      }
      toast.error('Lỗi tạo khảo sát: ' + errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSurveys = surveys.filter((s) =>
    searchTerm ? (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Khảo sát Khách hàng &amp; BQT
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Khảo sát ý kiến người mua tại gian hàng &amp; tiếp nhận khảo sát đối tác từ Ban Quản Trị MIVA.
          </p>
        </div>

        {activeTab !== 'create' && (
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tạo khảo sát mới
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'list'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Khảo sát của Shop ({surveys.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('create');
            setActiveInboxItem(null);
          }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'create'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          + Tạo khảo sát khách hàng
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('from_admin');
            setActiveInboxItem(null);
            loadAdminInbox();
          }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'from_admin'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Khảo sát từ Ban Quản Trị ({adminInbox.length})
        </button>
        {selectedSurveyId && (
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'results'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Kết quả &amp; Thống kê
          </button>
        )}
      </div>

      {/* TAB 1: LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề khảo sát..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="draft">Bản nháp</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Đang tải danh sách khảo sát...</p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Chưa có khảo sát nào
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Tạo khảo sát đầu tiên để thu thập đánh giá từ khách hàng.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                >
                  Tạo khảo sát ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Tiêu đề khảo sát</th>
                      <th className="px-4 py-4">Đối tượng nhận</th>
                      <th className="px-4 py-4">Thời gian</th>
                      <th className="px-4 py-4">Trạng thái</th>
                      <th className="px-4 py-4 text-center">Phản hồi</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSurveys.map((survey) => {
                      const audienceLabel =
                        survey.audienceType === 'vendor_completed_buyers'
                          ? 'Khách hoàn thành đơn'
                          : 'Khách từng mua hàng';
                      const isExpired =
                        survey.endDate && new Date(survey.endDate) < new Date();

                      return (
                        <tr
                          key={survey.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white max-w-sm truncate">
                              {survey.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                              {survey.description || 'Không có mô tả'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              <Users className="w-3 h-3 text-indigo-500" /> {audienceLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            <div>
                              {survey.startDate
                                ? new Date(survey.startDate).toLocaleDateString('vi-VN')
                                : 'Ngay lập tức'}
                              {' → '}
                              {survey.endDate
                                ? new Date(survey.endDate).toLocaleDateString('vi-VN')
                                : 'Vô thời hạn'}
                            </div>
                            {isExpired && (
                              <span className="text-[10px] text-rose-500 font-semibold">
                                (Đã quá hạn)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {survey.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Đang diễn ra
                              </span>
                            )}
                            {survey.status === 'draft' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                Bản nháp
                              </span>
                            )}
                            {survey.status === 'closed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                Đã đóng
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                            {survey._count?.responses || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenExtendModal(survey)}
                                className={`p-1.5 rounded-lg ${
                                  isExpired
                                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Gia hạn thời hạn khảo sát"
                              >
                                <CalendarPlus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenResults(survey.id)}
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                title="Xem kết quả & thống kê"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewSurvey(survey)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Xem trước câu hỏi"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {survey.status === 'draft' && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeStatus(survey.id, 'active')}
                                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                                  title="Kích hoạt và gửi thông báo cho khách"
                                >
                                  Kích hoạt
                                </button>
                              )}
                              {survey.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeStatus(survey.id, 'closed')}
                                  className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100"
                                  title="Đóng khảo sát"
                                >
                                  Đóng
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSurveyToDelete(survey)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Xóa mềm khảo sát"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE SURVEY */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                1. Thông tin khảo sát &amp; Chủ đề mẫu
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Chọn chủ đề khảo sát theo gợi ý nghiệp vụ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {vendorTopics.map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => handleTopicSelect(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedTopic === topic
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTopic === CUSTOM_TOPIC_LABEL && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chủ đề tùy chỉnh
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Nhập chủ đề khảo sát riêng của Shop..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề khảo sát <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hoặc chọn từ danh sách chủ đề trên..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả lời mời (hiển thị trong thông báo khách hàng)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kính chào Quý khách! Để nâng cao chất lượng sản phẩm và trải nghiệm mua sắm..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Đối tượng khách hàng được khảo sát:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      audienceType === 'vendor_buyers'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audienceType"
                      value="vendor_buyers"
                      checked={audienceType === 'vendor_buyers'}
                      onChange={() => setAudienceType('vendor_buyers')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Tất cả khách từng mua hàng
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Khách hàng đã từng đặt ít nhất một đơn hàng tại Shop.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      audienceType === 'vendor_completed_buyers'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audienceType"
                      value="vendor_completed_buyers"
                      checked={audienceType === 'vendor_completed_buyers'}
                      onChange={() => setAudienceType('vendor_completed_buyers')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Khách đã hoàn thành đơn
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Khách đã nhận hàng thành công (đơn Hoàn tất).
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Quy tắc nghiệp vụ:</strong> Shop chỉ được khảo sát khách hàng đã mua sản phẩm tại gian hàng của mình.
                  </span>
                </div>
              </div>
            </div>

            <SurveyQuestionBuilder
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onAddOption={handleAddOption}
              onUpdateOption={handleUpdateOption}
              onRemoveOption={handleRemoveOption}
              sectionTitle="2. Danh sách câu hỏi khảo sát"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                3. Thiết lập gửi &amp; Thời hạn
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cơ chế kích hoạt thông báo
                </label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="manual">Gửi thủ công ngay khi kích hoạt</option>
                  <option value="after_order_completed">Tự động gửi khi đơn hàng Hoàn tất</option>
                  <option value="after_checkout">Tự động gửi sau khi Đặt hàng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hạn trả lời khảo sát (Ngày kết thúc)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <button
                type="button"
                onClick={() => handleCreateSurvey(true)}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Đang kích hoạt...' : 'Kích hoạt & Gửi thông báo ngay'}
              </button>

              <button
                type="button"
                onClick={() => handleCreateSurvey(false)}
                disabled={submitting}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs transition-colors"
              >
                Lưu thành bản nháp
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-medium"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESULTS */}
      {activeTab === 'results' && (
        <SurveyResultsPanel
          loading={resultsLoading}
          surveyResults={surveyResults}
          onBack={() => setActiveTab('list')}
        />
      )}

      {/* TAB 4: SURVEYS FROM ADMIN */}
      {activeTab === 'from_admin' && (
        <div className="space-y-6">
          {activeInboxItem ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ban Quản Trị MIVA
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {activeInboxItem.survey?.title}
                  </h2>
                  {activeInboxItem.survey?.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {activeInboxItem.survey.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveInboxItem(null);
                    setSearchParams({});
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Quay lại danh sách
                </button>
              </div>

              <form onSubmit={handleSubmitVendorSurvey} className="space-y-5">
                {activeInboxItem.survey?.questions?.map((q, idx) => {
                  const ans = vendorAnswers[q.id] || {};
                  const isReadonly = activeInboxItem.status === 'submitted';
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {idx + 1}. {q.question}{' '}
                        {q.required && <span className="text-rose-500">*</span>}
                      </div>
                      {q.type === 'rating' && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              disabled={isReadonly}
                              onClick={() =>
                                setVendorAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ratingValue: star },
                                }))
                              }
                              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  star <= (ans.ratingValue || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === 'single_choice' && (
                        <div className="space-y-2">
                          {q.options?.map((opt) => (
                            <label
                              key={opt.id}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                disabled={isReadonly}
                                checked={ans.optionId === opt.id}
                                onChange={() =>
                                  setVendorAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: { optionId: opt.id },
                                  }))
                                }
                              />
                              <span>{opt.content}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {q.options?.map((opt) => {
                            const checked = (ans.optionIds || []).includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  disabled={isReadonly}
                                  checked={checked}
                                  onChange={() => {
                                    const curr = ans.optionIds || [];
                                    const next = checked
                                      ? curr.filter((id) => id !== opt.id)
                                      : [...curr, opt.id];
                                    setVendorAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: { optionIds: next },
                                    }));
                                  }}
                                />
                                <span>{opt.content}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {q.type === 'text' && (
                        <textarea
                          rows={3}
                          disabled={isReadonly}
                          value={ans.textAnswer || ''}
                          onChange={(e) =>
                            setVendorAnswers((prev) => ({
                              ...prev,
                              [q.id]: { textAnswer: e.target.value },
                            }))
                          }
                          placeholder="Nhập ý kiến đóng góp của Đối tác..."
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      )}
                    </div>
                  );
                })}

                {activeInboxItem.status !== 'submitted' && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={inboxSubmitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {inboxSubmitting ? 'Đang gửi...' : 'Gửi phản hồi tới Ban Quản Trị'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : inboxLoading ? (
            <div className="py-16 text-center text-slate-400">
              Đang tải khảo sát từ Ban Quản Trị MIVA...
            </div>
          ) : adminInbox.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">
                Hiện chưa có khảo sát nào từ Ban Quản Trị MIVA
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {adminInbox.map((item) => {
                const isSubmitted = item.status === 'submitted';
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          <ShieldCheck className="w-3.5 h-3.5" /> Ban Quản Trị MIVA
                        </span>
                        {isSubmitted && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã gửi phản hồi
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                        {item.survey?.title || 'Khảo sát Đối tác MIVA'}
                      </h3>
                      {item.survey?.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.survey.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAdminSurvey(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                        isSubmitted
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      }`}
                    >
                      {isSubmitted ? 'Xem lại phản hồi' : 'Thực hiện khảo sát'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <SurveyPreviewModal survey={previewSurvey} onClose={() => setPreviewSurvey(null)} />

      <ExtendEndDateModal
        isOpen={extendModalOpen && Boolean(surveyToExtend)}
        onClose={() => setExtendModalOpen(false)}
        title={`Gia hạn khảo sát: ${surveyToExtend?.title || ''}`}
        itemTitle={surveyToExtend?.title}
        currentEndDate={surveyToExtend?.endDate}
        onConfirm={handleConfirmExtend}
      />

      <Modal
        isOpen={Boolean(surveyToDelete)}
        onClose={() => {
          if (!isDeleting) setSurveyToDelete(null);
        }}
        title="Xóa mềm khảo sát"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isDeleting}
              onClick={() => setSurveyToDelete(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              icon={isDeleting ? Loader2 : Trash2}
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className={isDeleting ? '[&_svg]:animate-spin' : ''}
            >
              {isDeleting ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}
            </Button>
          </>
        }
      >
        {surveyToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                Bạn có chắc chắn muốn xóa mềm khảo sát{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  &ldquo;{surveyToDelete.title}&rdquo;
                </span>
                ?
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                • Khảo sát sẽ được <strong className="text-slate-800 dark:text-slate-100">ẩn khỏi danh sách quản lý</strong> của gian hàng và ngưng tiếp nhận phản hồi mới.
              </p>
              <p>
                • Toàn bộ câu hỏi và <strong className="text-slate-800 dark:text-slate-100">lịch sử phản hồi đã thu thập trong cơ sở dữ liệu vẫn được giữ nguyên 100%</strong>.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
