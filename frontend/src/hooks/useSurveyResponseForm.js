import { useState, useEffect, useRef, useCallback } from 'react';
import { surveyService } from '../services/surveyService';

export const cleanQuestionTitle = (title) => {
  if (!title) return '';
  return title.replace(/^(\[Q\d+\]|Q\d+:|Câu\s*\d+:?)\s*/i, '').trim();
};

export function useSurveyResponseForm({
  responseId,
  enabled = true,
  countdownSeconds = 3,
  onSubmitted,
  onCountdownComplete,
  scrollOnError = false,
}) {
  const [loading, setLoading] = useState(Boolean(enabled && responseId));
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState({});
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const openedRef = useRef(null);
  const onSubmittedRef = useRef(onSubmitted);
  const onCountdownCompleteRef = useRef(onCountdownComplete);

  useEffect(() => {
    onSubmittedRef.current = onSubmitted;
  }, [onSubmitted]);

  useEffect(() => {
    onCountdownCompleteRef.current = onCountdownComplete;
  }, [onCountdownComplete]);

  const resetForm = useCallback(() => {
    setDetail(null);
    setAnswers({});
    setError(null);
    setHoverRating({});
    setJustSubmitted(false);
    setCountdown(null);
    openedRef.current = null;
  }, []);

  const loadSurveyDetail = useCallback(async () => {
    if (!responseId) return;
    try {
      setLoading(true);
      setError(null);
      if (openedRef.current !== responseId) {
        openedRef.current = responseId;
        try {
          await surveyService.openResponse(responseId);
        } catch {
          // Continue even if open call errors
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
      } else {
        setAnswers({});
      }
    } catch (err) {
      console.error('Failed to load survey detail:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải nội dung khảo sát';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  useEffect(() => {
    if (enabled && responseId) {
      setJustSubmitted(false);
      setCountdown(null);
      loadSurveyDetail();
    } else {
      resetForm();
    }
  }, [enabled, responseId, loadSurveyDetail, resetForm]);

  useEffect(() => {
    let timer;
    if (justSubmitted && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (justSubmitted && countdown === 0) {
      onCountdownCompleteRef.current?.();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [justSubmitted, countdown]);

  const handleRatingChange = useCallback((questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ratingValue: value },
    }));
  }, []);

  const handleSingleChoiceChange = useCallback((questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId },
    }));
  }, []);

  const handleMultipleChoiceChange = useCallback((questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.optionIds || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: { ...prev[questionId], optionIds: updated },
      };
    });
  }, []);

  const handleTextChange = useCallback((questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], textAnswer: text },
    }));
  }, []);

  const isQuestionAnswered = useCallback(
    (q) => {
      const ans = answers[q.id];
      if (!ans) return false;
      if (q.type === 'rating') return typeof ans.ratingValue === 'number' && ans.ratingValue > 0;
      if (q.type === 'single_choice') return Boolean(ans.optionId);
      if (q.type === 'multiple_choice') return Array.isArray(ans.optionIds) && ans.optionIds.length > 0;
      if (q.type === 'text') return typeof ans.textAnswer === 'string' && ans.textAnswer.trim().length > 0;
      return false;
    },
    [answers],
  );

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!detail || !responseId) return;

      const reportValidationError = (message) => {
        setError(message);
        if (scrollOnError) {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      };

      const questions = detail.survey?.questions || [];
      for (const q of questions) {
        if (q.required) {
          const val = answers[q.id];
          const qTitle = cleanQuestionTitle(q.question);
          if (!val) {
            reportValidationError(`Vui lòng trả lời câu hỏi bắt buộc: "${qTitle}"`);
            return;
          }
          if (q.type === 'rating' && !val.ratingValue) {
            reportValidationError(`Vui lòng đánh giá số sao cho: "${qTitle}"`);
            return;
          }
          if (q.type === 'single_choice' && !val.optionId) {
            reportValidationError(`Vui lòng chọn 1 đáp án cho: "${qTitle}"`);
            return;
          }
          if (q.type === 'multiple_choice' && (!val.optionIds || val.optionIds.length === 0)) {
            reportValidationError(`Vui lòng chọn ít nhất 1 đáp án cho: "${qTitle}"`);
            return;
          }
          if (q.type === 'text' && (!val.textAnswer || !val.textAnswer.trim())) {
            reportValidationError(`Vui lòng nhập nội dung cho: "${qTitle}"`);
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
        setCountdown(countdownSeconds);
        if (scrollOnError) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        onSubmittedRef.current?.(responseId);
      } catch (err) {
        console.error('Submit survey error:', err);
        const msg =
          err.response?.data?.message || err.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      } finally {
        setSubmitting(false);
      }
    },
    [detail, responseId, answers, countdownSeconds, scrollOnError],
  );

  const isSubmittedAlready = detail?.status === 'submitted' && !justSubmitted;
  const isSkipped = detail?.status === 'skipped';
  const isExpired = Boolean(
    (detail?.expiresAt && new Date(detail.expiresAt) < new Date()) || detail?.survey?.status === 'closed',
  );
  const canEdit = Boolean(detail) && !isSubmittedAlready && !isSkipped && !isExpired && !justSubmitted;

  const questions = detail?.survey?.questions || [];
  const answeredCount = questions.filter(isQuestionAnswered).length;
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return {
    loading,
    submitting,
    detail,
    answers,
    error,
    hoverRating,
    setHoverRating,
    justSubmitted,
    countdown,
    countdownSeconds,
    loadSurveyDetail,
    resetForm,
    handleRatingChange,
    handleSingleChoiceChange,
    handleMultipleChoiceChange,
    handleTextChange,
    isQuestionAnswered,
    handleSubmit,
    isSubmittedAlready,
    isSkipped,
    isExpired,
    canEdit,
    questions,
    answeredCount,
    progressPercentage,
  };
}
