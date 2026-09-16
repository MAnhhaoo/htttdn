import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { addToCart } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/userSlice';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button/Button';
import Loading from '../../components/common/Loading/Loading';
import ProductCard from '../../components/product/ProductCard/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { products, loading } = useProducts();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { wishlist } = useSelector(state => state.user);
  const isWishlisted = product ? wishlist.some(item => item.id === product.id) : false;

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === parseInt(id));
      if (found) {
        setProduct(found);
        setActiveImage(0);
        setQuantity(1);
      } else {
        navigate('/products'); // Not found
      }
    }
  }, [id, products, navigate]);

  if (loading || !product) {
    return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    // Optional: show toast here
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity }));
    navigate('/checkout');
  };

  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-light-text dark:text-dark-text font-medium truncate max-w-xs">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg border border-light-border dark:border-dark-border">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, index) => (
              <button 
                key={index}
                onClick={() => setActiveImage(index)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-primary shadow-md' : 'border-transparent hover:border-light-border'}`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text leading-tight">
              {product.name}
            </h1>
            <button 
              onClick={() => dispatch(toggleWishlist(product))}
              className={`p-3 rounded-full border transition-colors flex-shrink-0 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-light-border text-light-muted hover:text-red-500 hover:border-red-500'}`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center text-primary font-bold">
              <Star className="w-4 h-4 fill-current mr-1" /> {product.rating}
            </div>
            <span className="text-light-muted">({product.reviewCount} Reviews)</span>
            <span className="text-light-muted">|</span>
            <span className="font-semibold text-light-text dark:text-dark-text">{product.sold} Sold</span>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-black text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xl text-light-muted dark:text-dark-muted line-through mb-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.discount > 0 && (
              <span className="ml-2 mb-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discount}%
              </span>
            )}
          </div>

          <p className="text-light-muted dark:text-dark-muted mb-8 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-light-border dark:border-dark-border">
            <span className="font-semibold text-light-text dark:text-dark-text">Quantity</span>
            <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-light-muted hover:text-primary transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-bold text-light-text dark:text-dark-text">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 text-light-muted hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-light-muted dark:text-dark-muted">
              {product.stock} pieces available
            </span>
          </div>

          <div className="flex gap-4 mb-10">
            <Button 
              variant="outline" 
              className="flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 border-2 hover:bg-primary/5"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 py-4 text-base font-bold shadow-luxury"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-light-muted dark:text-dark-muted">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" /> Free Delivery Available
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-primary" /> 30-Day Returns
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" /> 100% Genuine
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
        <div className="flex gap-8 border-b border-light-border dark:border-dark-border mb-8">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-lg font-bold transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-light-muted hover:text-light-text dark:hover:text-dark-text'}`}
            >
              <span className="capitalize">{tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-4xl text-light-text dark:text-dark-text">
          {activeTab === 'description' && (
            <div className="leading-loose">
              <p>{product.description}</p>
              <p className="mt-4">Elevate your lifestyle with this premium product, designed with the highest standards of quality and craftsmanship. Experience the difference today.</p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <ul className="space-y-2">
              <li className="flex"><span className="font-bold w-40">Brand:</span> {product.brand}</li>
              <li className="flex"><span className="font-bold w-40">Category:</span> <span className="capitalize">{product.category}</span></li>
              <li className="flex"><span className="font-bold w-40">Stock:</span> {product.stock} units</li>
              <li className="flex"><span className="font-bold w-40">Weight:</span> 0.5 kg (Approx)</li>
            </ul>
          )}
          {activeTab === 'reviews' && (
            <div>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {similarProducts.map(p => (
              <ProductCard key={`similar-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
