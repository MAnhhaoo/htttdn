import { useState, useEffect, useCallback } from 'react';
import {
  CalendarPlus,
  ClipboardList,
  Search,
  Eye,
  BarChart3,
  CheckCircle2,
  X,
  Send,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { SurveyQuestionBuilder } from '@shared/components/surveys/SurveyQuestionBuilder';
import { SurveyResultsPanel } from '@shared/components/surveys/SurveyResultsPanel';
import { SurveyPreviewModal } from '@shared/components/surveys/SurveyPreviewModal';
import { ExtendEndDateModal } from '@shared/components/common/ExtendEndDateModal';
import { surveysApi } from '../../api';
import { Button, Modal, useToast } from '../../components/ui';

const CUSTOM_TOPIC_LABEL = 'Chủ đề khác (Tự nhập)';

const FALLBACK_TEMPLATES = {
  client: [
    {
      topic: 'Trải nghiệm mua sắm trên MIVA',
      title: 'Khảo sát trải nghiệm mua sắm và giao diện sàn MIVA',
      description:
        'MIVA trân trọng lắng nghe ý kiến của bạn về giao diện, tính năng và trải nghiệm mua sắm chung để nâng cấp nền tảng ngày một tốt hơn.',
      imageUrl: '',
      scope: 'platform',
      audienceType: 'all_users',
      triggerType: 'manual',
      questions: [
        {
          id: '1',
          question: 'Mức độ hài lòng chung của bạn khi trải nghiệm mua sắm trên sàn MIVA?',
          type: 'rating',
          required: true,
          options: [],
        },
        {
          id: '2',
          question: 'Đóng góp ý kiến hoặc đề xuất của bạn để MIVA cải thiện chất lượng dịch vụ:',
          type: 'text',
          required: false,
          options: [],
        },
      ],
    },
  ],
  vendor: [
    {
      topic: 'Trải nghiệm quản lý cửa hàng',
      title: 'Khảo sát trải nghiệm sử dụng Cổng quản trị đối tác bán hàng (Vendor Portal)',
      description:
        'Thu thập ý kiến đóng góp của Quý đối tác về giao diện, sự tiện lợi và hiệu năng của công cụ quản lý bán hàng MIVA.',
      imageUrl: '',
      scope: 'platform',
      audienceType: 'all_vendors',
      triggerType: 'manual',
      questions: [
        {
          id: '1',
          question: 'Mức độ hài lòng của Đối tác về sự tiện lợi và tốc độ của Vendor Portal?',
          type: 'rating',
          required: true,
          options: [],
        },
        {
          id: '2',
          question: 'Góp ý của Shop để hoàn thiện cổng quản trị đối tác bán hàng:',
          type: 'text',
          required: false,
          options: [],
        },
      ],
    },
  ],
};

const normalizeTemplateQuestions = (questions = []) =>
  questions.map((q, idx) => ({
    id: String(idx + 1),
    question: q.question || '',
    type: q.type || 'rating',
    required: Boolean(q.required),
    options: Array.isArray(q.options) ? [...q.options] : [],
  }));

export default function SurveyManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'results'
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all'); // 'all' | 'client' | 'vendor'
  const [searchTerm, setSearchTerm] = useState('');

  // Results State
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [surveyResults, setSurveyResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Extend Survey Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [surveyToExtend, setSurveyToExtend] = useState(null);

  // Soft-Delete Survey Modal State
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [deletingSurvey, setDeletingSurvey] = useState(false);

  // Preview State
  const [previewSurvey, setPreviewSurvey] = useState(null);

  // Templates & Form State
  const defaultPreset = FALLBACK_TEMPLATES.client[0];
  const [targetType, setTargetType] = useState('client'); // 'client' | 'vendor'
  const [templatesByTarget, setTemplatesByTarget] = useState(FALLBACK_TEMPLATES);
  const [topicsByTarget, setTopicsByTarget] = useState({
    client: [defaultPreset.topic, CUSTOM_TOPIC_LABEL],
    vendor: [FALLBACK_TEMPLATES.vendor[0].topic, CUSTOM_TOPIC_LABEL],
  });
  const [title, setTitle] = useState(defaultPreset.title);
  const [description, setDescription] = useState(defaultPreset.description);
  const [imageUrl, setImageUrl] = useState(defaultPreset.imageUrl || '');
  const [selectedTopic, setSelectedTopic] = useState(defaultPreset.topic);
  const [audienceType, setAudienceType] = useState('all_users');
  const [triggerType, setTriggerType] = useState('manual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState(() =>
    normalizeTemplateQuestions(defaultPreset.questions),
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await surveysApi.getSurveys(params);
      const items = res?.data?.list || (Array.isArray(res?.data) ? res.data : []);
      setSurveys(items);
    } catch (err) {
      console.error('Failed to load admin surveys:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const applyPreset = useCallback((preset, fallbackTitle = '') => {
    if (preset) {
      setTitle(preset.title || fallbackTitle);
      setDescription(preset.description || '');
      setImageUrl(preset.imageUrl || '');
      setQuestions(normalizeTemplateQuestions(preset.questions));
    } else if (fallbackTitle && !fallbackTitle.includes('Khác')) {
      setTitle(fallbackTitle);
    }
  }, []);

  // Load templates from backend API when creating surveys
  useEffect(() => {
    if (activeTab !== 'create') return;
    let mounted = true;
    const fetchTemplates = async () => {
      try {
        const res = await surveysApi.getTemplates(targetType);
        const raw = res?.data?.data || res?.data || res;
        const list =
          Array.isArray(raw?.templates) && raw.templates.length > 0
            ? raw.templates
            : FALLBACK_TEMPLATES[targetType];
        const rawTopics =
          Array.isArray(raw?.topics) && raw.topics.length > 0
            ? raw.topics
            : list.map((t) => t.topic);
        const topicList = rawTopics.includes(CUSTOM_TOPIC_LABEL)
          ? rawTopics
          : [...rawTopics, CUSTOM_TOPIC_LABEL];

        if (!mounted) return;
        setTemplatesByTarget((prev) => ({ ...prev, [targetType]: list }));
        setTopicsByTarget((prev) => ({ ...prev, [targetType]: topicList }));
        const firstPreset = list[0];
        if (firstPreset) {
          setSelectedTopic(firstPreset.topic);
          applyPreset(firstPreset, firstPreset.topic);
        }
      } catch {
        // Keep lightweight offline fallback silently
      }
    };
    fetchTemplates();
    return () => {
      mounted = false;
    };
  }, [activeTab, targetType, applyPreset]);

  const currentTopics = topicsByTarget[targetType] || [CUSTOM_TOPIC_LABEL];
  const currentTemplates = templatesByTarget[targetType] || FALLBACK_TEMPLATES[targetType];

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    const preset = currentTemplates.find((t) => t.topic === topic);
    if (preset) {
      applyPreset(preset, topic);
    } else if (topic === CUSTOM_TOPIC_LABEL) {
      setTitle('');
      setDescription('');
    } else {
      setTitle(topic);
    }
  };

  const handleTargetTypeChange = (type) => {
    setTargetType(type);
    if (type === 'client') {
      setAudienceType('all_users');
    } else {
      setAudienceType('all_vendors');
      setTriggerType('manual');
    }
    const list = templatesByTarget[type] || FALLBACK_TEMPLATES[type];
    const firstPreset = list[0];
    if (firstPreset) {
      setSelectedTopic(firstPreset.topic);
      applyPreset(firstPreset, firstPreset.topic);
    }
  };

  const handleOpenExtendModal = (survey) => {
    setSurveyToExtend(survey);
    setExtendModalOpen(true);
  };

  const handleConfirmDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    try {
      setDeletingSurvey(true);
      await surveysApi.deleteSurvey(surveyToDelete.id);
      if (selectedSurveyId === surveyToDelete.id) {
        setSelectedSurveyId(null);
        setSurveyResults(null);
      }
      toast.success(`Đã xóa mềm khảo sát "${surveyToDelete.title}" thành công`);
      setSurveyToDelete(null);
      await loadSurveys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa mềm khảo sát thất bại');
    } finally {
      setDeletingSurvey(false);
    }
  };

  const handleOpenResults = async (surveyId) => {
    try {
      setSelectedSurveyId(surveyId);
      setActiveTab('results');
      setResultsLoading(true);
      const res = await surveysApi.getResults(surveyId);
      setSurveyResults(res?.data || res);
    } catch (err) {
      console.error('Failed to load results:', err);
      toast.error('Không thể tải kết quả: ' + (err.response?.data?.message || err.message));
    } finally {
      setResultsLoading(false);
    }
  };

  const handleChangeStatus = async (surveyId, newStatus) => {
    try {
      await surveysApi.changeStatus(surveyId, newStatus);
      toast.success(
        newStatus === 'active'
          ? 'Đã kích hoạt chiến dịch khảo sát thành công'
          : 'Đã đóng chiến dịch khảo sát',
      );
      await loadSurveys();
      if (selectedSurveyId === surveyId) {
        handleOpenResults(surveyId);
      }
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  // Question manipulation handlers for SurveyQuestionBuilder
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
          ? { ...q, options: [...(q.options || []), `Lựa chọn ${(q.options || []).length + 1}`] }
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
              options: (q.options || []).map((opt, oIdx) => (oIdx === optIndex ? val : opt)),
            }
          : q,
      ),
    );
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: (q.options || []).filter((_, oIdx) => oIdx !== optIndex) }
          : q,
      ),
    );
  };

  const handleCreateSurvey = async (activateImmediately = false) => {
    const surveyTitle =
      title.trim() || (!selectedTopic.includes('Khác') ? selectedTopic : '');
    if (!surveyTitle) {
      toast.error('Vui lòng nhập tiêu đề khảo sát');
      return;
    }
    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi khảo sát');
      return;
    }
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error('Có câu hỏi chưa nhập nội dung');
        return;
      }
      if ((q.type === 'single_choice' || q.type === 'multiple_choice') && q.options.length < 2) {
        toast.error(`Câu hỏi trắc nghiệm "${q.question}" cần ít nhất 2 đáp án`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: surveyTitle,
        description: description.trim() || undefined,
        imageUrl: imageUrl && imageUrl.trim().startsWith('http') ? imageUrl.trim() : undefined,
        scope: 'platform',
        audienceType: targetType === 'vendor' ? 'all_vendors' : audienceType,
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

      const res = await surveysApi.createSurvey(payload);
      const created = res?.data?.data || res?.data || res;

      if (activateImmediately && created?.id) {
        await surveysApi.changeStatus(created.id, 'active');
      }

      const msg = activateImmediately
        ? `Khảo sát cho ${targetType === 'vendor' ? 'Đối tác Nhà bán' : 'Khách hàng'} đã kích hoạt và gửi thông báo thành công!`
        : 'Đã lưu bản nháp khảo sát thành công!';
      setFeedbackMsg(msg);
      toast.success(msg);
      await loadSurveys();
      setActiveTab('list');
      setStartDate('');
      setEndDate('');
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

  const filteredSurveys = surveys.filter((s) => {
    if (searchTerm) {
      const match = s.title?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    if (targetFilter === 'vendor' && s.audienceType !== 'all_vendors') return false;
    if (targetFilter === 'client' && s.audienceType === 'all_vendors') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-[#EEF5F1] dark:bg-[#1A3A2C]/60 text-[#1A3A2C] dark:text-[#DEC47E] rounded-xl border border-[#2A5C4A]/15 dark:border-[#C9A84C]/25">
            <ClipboardList className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chiến dịch Khảo sát CRM
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản trị toàn bộ chiến dịch khảo sát Khách hàng (Client) và Đối tác bán hàng (Vendor).
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'list'
              ? 'border-[#1A3A2C] dark:border-[#C9A84C] text-[#1A3A2C] dark:text-[#DEC47E]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Tất cả khảo sát ({surveys.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'create'
              ? 'border-[#1A3A2C] dark:border-[#C9A84C] text-[#1A3A2C] dark:text-[#DEC47E]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          + Tạo khảo sát mới
        </button>
        {selectedSurveyId && (
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'results'
                ? 'border-[#1A3A2C] dark:border-[#C9A84C] text-[#1A3A2C] dark:text-[#DEC47E]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Thống kê kết quả
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{feedbackMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ──────────────── TAB 1: ALL SURVEYS ──────────────── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#2A5C4A] text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Đối tượng:</span>
                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Tất cả đối tượng</option>
                  <option value="client">Khách hàng (Client)</option>
                  <option value="vendor">Đối tác (Vendor)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="draft">Bản nháp</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#1A3A2C] dark:border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Đang tải danh sách khảo sát...</p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Không tìm thấy khảo sát nào
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Tạo khảo sát để bắt đầu thu thập dữ liệu trải nghiệm.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Tiêu đề khảo sát</th>
                      <th className="px-4 py-4">Đối tượng</th>
                      <th className="px-4 py-4">Người tạo</th>
                      <th className="px-4 py-4">Thời gian</th>
                      <th className="px-4 py-4">Trạng thái</th>
                      <th className="px-4 py-4 text-center">Phản hồi</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSurveys.map((survey) => {
                      const isVendorTarget = survey.audienceType === 'all_vendors';
                      const isCreatedByAdmin = Boolean(survey.adminId) || survey.scope === 'platform';

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
                            {isVendorTarget ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <Building2 className="w-3 h-3" /> Toàn bộ Vendor
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 text-[#1A3A2C] dark:text-[#6BB392] border border-[#2A5C4A]/20 dark:border-[#2A5C4A]/50">
                                <User className="w-3 h-3" /> Khách hàng
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs">
                            {isCreatedByAdmin ? (
                              <span className="font-semibold text-[#1A3A2C] dark:text-[#DEC47E]">
                                MIVA Admin
                              </span>
                            ) : (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {survey.vendor?.storeName || 'Shop đối tác'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {survey.startDate
                              ? new Date(survey.startDate).toLocaleDateString('vi-VN')
                              : 'Bắt đầu ngay'}
                            {' → '}
                            {survey.endDate
                              ? new Date(survey.endDate).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
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
                          <td className="px-4 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {survey._count?.responses || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenResults(survey.id)}
                                className="p-1.5 rounded-lg text-[#1A3A2C] dark:text-[#DEC47E] hover:bg-[#EEF5F1] dark:hover:bg-[#1A3A2C]/50 transition-colors"
                                title="Xem thống kê kết quả"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewSurvey(survey)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Xem trước câu hỏi"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {survey.status === 'draft' && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeStatus(survey.id, 'active')}
                                  className="px-2.5 py-1 text-xs font-semibold bg-[#1A3A2C] hover:bg-[#2A5C4A] text-white rounded-lg shadow-sm transition-colors"
                                  title="Kích hoạt và gửi thông báo"
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
                              {(survey.status === 'closed' ||
                                (survey.endDate && new Date(survey.endDate) < new Date())) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenExtendModal(survey)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                                  title="Khảo sát đã hết hạn / đã đóng - Bấm để gia hạn"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" />
                                  Gia hạn
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

      {/* ──────────────── TAB 2: CREATE SURVEY (ADMIN) ──────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Target Actor Selection */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1A3A2C] dark:text-[#C9A84C]" />
                1. Chọn đối tượng khảo sát
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('client')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    targetType === 'client'
                      ? 'border-[#1A3A2C] dark:border-[#C9A84C] bg-[#EEF5F1]/60 dark:bg-[#1A3A2C]/30 ring-2 ring-[#2A5C4A]/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      targetType === 'client'
                        ? 'bg-[#1A3A2C] text-[#C9A84C]'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Luồng 1 – Khảo sát Khách hàng (Client)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Thu thập trải nghiệm mua sắm, thanh toán, giao hàng, đề xuất tính năng mới trên MIVA.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('vendor')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    targetType === 'vendor'
                      ? 'border-[#1A3A2C] dark:border-[#C9A84C] bg-[#EEF5F1]/60 dark:bg-[#1A3A2C]/30 ring-2 ring-[#2A5C4A]/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      targetType === 'vendor'
                        ? 'bg-[#1A3A2C] text-[#C9A84C]'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Luồng 2 – Khảo sát Đối tác (Vendor)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Thu thập phản hồi về quản lý cửa hàng, đóng gói giao vận, chính sách nền tảng MIVA.
                    </p>
                  </div>
                </button>
              </div>

              {/* Preset Topics based on Target */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Chủ đề khảo sát mẫu từ hệ thống:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentTopics.map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => handleTopicSelect(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedTopic === topic
                          ? 'bg-[#1A3A2C] dark:bg-[#2A5C4A] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề khảo sát <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề khảo sát..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#2A5C4A] text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả lời mời (hiển thị trong thông báo)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ban Quản Trị MIVA trân trọng kính mời quý khách tham gia khảo sát..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#2A5C4A] text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>
            </div>

            {/* Step 2: Shared Questions Builder */}
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

          {/* Step 3: Delivery & Activation */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1A3A2C] dark:text-[#C9A84C]" />
                3. Thiết lập gửi thông báo
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cơ chế kích hoạt
                </label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="manual">Gửi thủ công ngay khi kích hoạt</option>
                  {targetType === 'client' && (
                    <>
                      <option value="after_order_completed">
                        Tự động gửi khi đơn hàng hoàn thành
                      </option>
                      <option value="after_checkout">Tự động gửi sau khi đặt hàng</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày bắt đầu (tùy chọn)
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
                  Hạn chót trả lời khảo sát
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3 bg-[#EEF5F1] dark:bg-[#1A3A2C]/40 border border-[#2A5C4A]/20 rounded-xl text-xs text-[#1A3A2C] dark:text-[#C5D6CE]">
                Khi kích hoạt, hệ thống sẽ tự động tạo thông báo gửi tới biểu tượng{' '}
                <strong>Chuông Thông báo</strong> của từng đối tượng (
                {targetType === 'vendor' ? 'Tất cả Vendor' : 'Tất cả Khách hàng'}).
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <button
                type="button"
                onClick={() => handleCreateSurvey(true)}
                disabled={submitting}
                className="w-full py-3 bg-[#1A3A2C] hover:bg-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#C9A84C]" />
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

      {/* ──────────────── TAB 3: SHARED RESULTS PANEL ──────────────── */}
      {activeTab === 'results' && (
        <SurveyResultsPanel
          loading={resultsLoading}
          surveyResults={surveyResults}
          onBack={() => setActiveTab('list')}
        />
      )}

      {/* Shared Preview Modal */}
      <SurveyPreviewModal
        survey={previewSurvey}
        onClose={() => setPreviewSurvey(null)}
      />

      {/* Shared Extend End Date Modal */}
      <ExtendEndDateModal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title={
          surveyToExtend
            ? `Gia hạn khảo sát: ${surveyToExtend.title}`
            : 'Gia hạn thời hạn khảo sát'
        }
        itemTitle={surveyToExtend?.title}
        currentEndDate={surveyToExtend?.endDate}
        onConfirm={async (isoEnd) => {
          await surveysApi.extendSurvey(surveyToExtend.id, isoEnd);
          toast.success(`Đã gia hạn khảo sát "${surveyToExtend.title}" thành công`);
          await loadSurveys();
        }}
      />

      {/* Soft-Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(surveyToDelete)}
        onClose={() => !deletingSurvey && setSurveyToDelete(null)}
        title="Xóa mềm khảo sát"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSurveyToDelete(null)}
              disabled={deletingSurvey}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteSurvey}
              disabled={deletingSurvey}
            >
              {deletingSurvey ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}
            </Button>
          </div>
        }
      >
        {surveyToDelete && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                Thao tác này thực hiện <strong>xóa mềm (Soft Delete)</strong>, không xóa vĩnh viễn bản ghi trong CSDL.
              </div>
            </div>
            <p className="leading-relaxed">
              Khảo sát <strong className="text-slate-900 dark:text-white">&ldquo;{surveyToDelete.title}&rdquo;</strong> sẽ được{' '}
              <strong>ẩn khỏi danh sách hiển thị</strong>, nhưng{' '}
              <strong>bảo toàn nguyên vẹn bộ câu hỏi và toàn bộ phản hồi lịch sử trong cơ sở dữ liệu (CSDL)</strong>.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
