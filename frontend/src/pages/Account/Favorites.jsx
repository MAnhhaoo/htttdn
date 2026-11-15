import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useVoucherOffers } from '../../hooks/useVoucherOffers';
import { isOfferApplicableToProduct } from '../../utils/voucherPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites = [], isLoading } = useFavorites();

  const rawProducts = useMemo(
    () => favorites.map((fav) => fav?.product || fav).filter((p) => p?.id),
    [favorites],
  );
  const offers = useVoucherOffers(rawProducts.map((p) => p.id));

  const favoriteProducts = useMemo(
    () =>
      rawProducts.map((product) => ({
        ...product,
        voucherOffers: offers.filter((offer) => isOfferApplicableToProduct(offer, product.id)),
      })),
    [rawProducts, offers],
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-12">
        <Loading text="Đang tải danh sách yêu thích..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            Sản phẩm yêu thích
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Danh sách các sản phẩm bạn đã lưu để theo dõi và mua sắm nhanh ({favoriteProducts.length} sản phẩm)
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl py-10">
          <EmptyState
            icon={Heart}
            title="Chưa có sản phẩm yêu thích"
            description="Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá bộ sưu tập MIVA nhé!"
            actionText="Khám phá sản phẩm"
            onAction={() => navigate('/products')}
          />
        </div>
      ) : (
        <ProductGrid products={favoriteProducts} columns={4} />
      )}
    </div>
  );
}
