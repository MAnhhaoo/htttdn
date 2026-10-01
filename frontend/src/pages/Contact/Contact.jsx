import { useState } from 'react';
import { Send, Clock, MessageCircle, Mail } from 'lucide-react';
import { useToast } from '../../components/common/Toast/Toast';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập họ và tên';
    if (!form.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email không hợp lệ';
    if (!form.subject.trim()) newErrors.subject = 'Vui lòng nhập chủ đề';
    if (!form.message.trim()) newErrors.message = 'Vui lòng nhập nội dung';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // No backend Contact API exists — inform user gracefully
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSubmitting(false);
    toast.info('Tính năng gửi tin nhắn đang được phát triển. Cảm ơn bạn đã quan tâm!');
  };

  const inputClasses = (field) => `
    w-full px-4 py-3 bg-white dark:bg-dark-surface border rounded-xl text-sm outline-none transition-all
    text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted
    ${errors[field]
      ? 'border-red-400 dark:border-red-500 focus:border-red-500'
      : 'border-light-border dark:border-dark-border focus:border-primary'}
  `;

  return (
    <div className="pb-16 bg-light-bg dark:bg-dark-bg transition-colors duration-500">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent dark:from-primary/10 dark:via-dark-bg dark:to-dark-bg" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-semibold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Liên hệ
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-light-text dark:text-dark-text leading-tight mb-6">
            Liên hệ với <span className="text-primary italic">MIVA</span>
          </h1>
          <p className="text-base sm:text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto leading-relaxed font-light">
            Có câu hỏi hoặc phản hồi? Hãy gửi lời nhắn cho chúng tôi.
            Đội ngũ MIVA luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-surface rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                Thông tin hỗ trợ
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Gửi phản hồi</h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
                      Sử dụng form liên hệ để gửi câu hỏi, góp ý hoặc yêu cầu hỗ trợ.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Thời gian phản hồi</h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
                      Chúng tôi sẽ cố gắng phản hồi trong thời gian sớm nhất có thể.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Hỗ trợ trực tuyến</h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
                      Đội ngũ MIVA luôn sẵn sàng giải đáp mọi thắc mắc của bạn về sản phẩm và đơn hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 shadow-xl" noValidate>
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                Gửi tin nhắn
              </h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Nhập họ và tên" className={inputClasses('name')} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className={inputClasses('email')} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                      Số điện thoại <span className="text-light-muted dark:text-dark-muted font-normal">(tuỳ chọn)</span>
                    </label>
                    <input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0xxx xxx xxx" className={inputClasses('phone')} />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <input id="contact-subject" name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="Chủ đề liên hệ" className={inputClasses('subject')} />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea id="contact-message" name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Nhập nội dung tin nhắn..." className={`${inputClasses('message')} resize-none`} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
