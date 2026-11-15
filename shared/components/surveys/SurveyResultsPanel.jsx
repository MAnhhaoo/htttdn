import { AlertCircle, Star } from 'lucide-react';

const BAR_COLORS = ['#1A3A2C', '#C9A84C', '#35755B', '#D97706', '#579678', '#0D9488'];

/**
 * Bảng thống kê kết quả khảo sát dùng chung cho Admin và Vendor.
 */
export function SurveyResultsPanel({ loading, surveyResults, onBack }) {
  return (
    <div className="space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#1A3A2C] dark:text-[#8BBAA1] hover:underline flex items-center gap-1"
        >
          ← Quay lại danh sách khảo sát
        </button>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#1A3A2C] dark:border-[#8BBAA1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Đang tải số liệu thống kê...</p>
        </div>
      ) : !surveyResults ? (
        <div className="py-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có dữ liệu thống kê cho khảo sát này</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Tổng người được mời</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {surveyResults.summary?.invitedCount || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Đã mở xem</div>
              <div className="text-2xl font-bold text-[#2A5C4A] dark:text-[#8BBAA1] mt-1">
                {surveyResults.summary?.openedCount || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Đã trả lời</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {surveyResults.summary?.responseCount || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Chưa trả lời</div>
              <div className="text-2xl font-bold text-amber-500 mt-1">
                {surveyResults.summary?.pendingCount || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành</div>
              <div className="text-2xl font-bold text-[#B08A2E] dark:text-[#DEC47E] mt-1">
                {((surveyResults.summary?.completionRate || 0) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Kết quả chi tiết từng câu hỏi
            </h3>

            {surveyResults.questions?.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 text-[#1A3A2C] dark:text-[#8BBAA1] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {q.question}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Loại:{' '}
                      {q.type === 'rating'
                        ? 'Đánh giá Sao'
                        : q.type === 'single_choice'
                          ? 'Chọn 1'
                          : q.type === 'multiple_choice'
                            ? 'Chọn nhiều'
                            : 'Tự luận'}
                    </span>
                  </div>
                </div>

                {q.type === 'rating' && q.result?.distribution && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-amber-500">
                        {Number(q.result.average || 0).toFixed(1)}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${
                              s <= Math.round(q.result.average || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        ({q.result.answeredCount || 0} đánh giá)
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {q.result.distribution.map((d) => {
                        const percent = q.result.answeredCount
                          ? (d.count / q.result.answeredCount) * 100
                          : 0;
                        return (
                          <div key={d.value} className="flex items-center gap-3 text-xs">
                            <span className="w-12 text-slate-600 dark:text-slate-400 font-semibold">
                              {d.value} sao
                            </span>
                            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="w-16 text-right font-medium text-slate-700 dark:text-slate-300">
                              {d.count} ({percent.toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(q.type === 'single_choice' || q.type === 'multiple_choice') &&
                  q.result?.options && (
                    <div className="space-y-2 pt-1">
                      {q.result.options.map((opt, oIdx) => (
                        <div key={opt.id || oIdx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                            <span>{opt.content}</span>
                            <span className="font-semibold text-[#1A3A2C] dark:text-[#8BBAA1]">
                              {opt.count} lượt ({Number(opt.percentage || 0).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${opt.percentage || 0}%`,
                                backgroundColor: BAR_COLORS[oIdx % BAR_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {q.type === 'text' && q.result?.list && (
                  <div className="space-y-2 pt-1">
                    {q.result.list.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Chưa có phản hồi tự luận nào.</p>
                    ) : (
                      q.result.list.map((ans) => (
                        <div
                          key={ans.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {ans.response?.client?.fullName ||
                                ans.respondentName ||
                                'Người tham gia'}
                            </span>
                            {ans.createdAt && (
                              <span>{new Date(ans.createdAt).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                          <p className="text-slate-800 dark:text-slate-100 italic">
                            &ldquo;{ans.textAnswer}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SurveyResultsPanel;

