import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import Button from '../../components/common/Button/Button';
import { formatPrice } from '../../utils/formatPrice';

export default function PaymentDemo() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrderAndPayment = async () => {
      try {
        const orderRes = await apiClient.get(`/orders/${orderId}`);
        setOrder(orderRes.data);
        
        const paymentRes = await apiClient.get(`/payments/order/${orderId}`);
        // Can be an array or single object
        const paymentData = Array.isArray(paymentRes.data) ? paymentRes.data[0] : paymentRes.data;
        setPayment(paymentData);
      } catch (err) {
        console.error(err);
        alert('Không tìm thấy đơn hàng hoặc phiên thanh toán');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderAndPayment();
    }
  }, [orderId, navigate]);

  const handlePayment = async (success) => {
    if (!payment) return;
    setProcessing(true);
    try {
      await apiClient.post(`/payments/demo/${payment.id}`, { success });
      if (success) {
        alert('Thanh toán thành công! Trạng thái đơn hàng chờ xác nhận từ người bán.');
      } else {
        alert('Thanh toán thất bại! Bạn có thể thử lại từ trang Đơn hàng.');
      }
      navigate('/orders');
    } catch (err) {
      alert('Có lỗi xảy ra khi giả lập thanh toán');
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!order || !payment) return <div className="text-center py-20">Lỗi dữ liệu</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
            Cổng thanh toán giả lập
          </h1>
          <p className="text-light-muted dark:text-dark-muted">
            Dành cho đồ án MIVA - Thanh toán {payment.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 'Trả sau'}
          </p>
        </div>

        <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-4 mb-4">
            <span className="text-light-muted dark:text-dark-muted">Mã đơn hàng</span>
            <span className="font-medium text-light-text dark:text-dark-text">#{order.id.split('-')[0]}</span>
          </div>
          <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-4 mb-4">
            <span className="text-light-muted dark:text-dark-muted">Số tiền thanh toán</span>
            <span className="font-bold text-primary text-xl">{formatPrice(payment.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-light-muted dark:text-dark-muted">Người nhận</span>
            <span className="font-medium text-light-text dark:text-dark-text">{order.receiverName} - {order.receiverPhone}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => handlePayment(true)} 
            isLoading={processing}
            className="w-full h-14 text-lg"
          >
            Mô phỏng Thanh toán THÀNH CÔNG
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handlePayment(false)}
            disabled={processing}
            className="w-full text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Mô phỏng Thanh toán THẤT BẠI
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/orders')}
            disabled={processing}
            className="w-full"
          >
            Quay lại trang Đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
