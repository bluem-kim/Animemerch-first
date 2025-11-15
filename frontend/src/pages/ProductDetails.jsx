import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useTGAlert } from '../components/TGAlert';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const alert = useTGAlert();

  useEffect(() => {
    let activeReq = true;
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (activeReq) setProduct(res.data);
      } catch (_e) {
        if (activeReq) setProduct(null);
      } finally {
        if (activeReq) setLoading(false);
      }
    })();
    return () => { activeReq = false; };
  }, [id]);

  const images = useMemo(() => {
    const fallbacks = [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520975922299-5c8a2c6d7d88?q=80&w=1600&auto=format&fit=crop',
    ];
    const urls = (product?.photos || []).map(p => p.url).filter(Boolean);
    return urls.length ? urls : fallbacks;
  }, [product]);

  const addToCart = async () => {
    await alert.show('Added to cart', { variant: 'success', timeout: 1600 });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-4">
            <div className="h-7 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 w-40 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Product not found</div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">It may have been removed or is unavailable.</div>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-200">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-gray-900 dark:hover:text-gray-200">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="aspect-square bg-gray-50 dark:bg-gray-800">
              <img src={images[active]} alt={product.name} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={`overflow-hidden rounded border ${active === idx ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-800'}`}
              >
                <img src={src} alt="thumb" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{product.name}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${Number(product.price).toFixed(2)}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{product.category || 'General'}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{product.description || 'A well-crafted product to enhance your daily life.'}</p>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={addToCart} className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-white shadow hover:bg-indigo-700">Add to Cart</button>
            <a href="#" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Wishlist</a>
          </div>

          <ul className="mt-8 grid gap-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> In stock</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Free shipping over $50</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
