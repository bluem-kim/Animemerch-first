import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function ProductCard({ product }) {
  const img = product?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop';
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img src={img} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</h3>
          <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">${Number(product.price).toFixed(2)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description || 'Beautiful hand-crafted item.'}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wide text-gray-400">{product.category || 'General'}</span>
          <Link to={`/p/${product._id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get('/products', { params: { page: 1, limit: 100 } });
        const items = res.data.items || [];
        if (active) {
          setFeatured(items.slice(0, 8));
          const byCat = new Map();
          for (const p of items) {
            const key = p.category || 'General';
            if (!byCat.has(key)) byCat.set(key, { name: key, count: 0, img: null });
            const entry = byCat.get(key);
            entry.count += 1;
            if (!entry.img && p.photos?.[0]?.url) entry.img = p.photos[0].url;
          }
          const list = Array.from(byCat.values())
            .sort((a, b) => b.count - a.count)
            .map(c => ({ ...c, img: c.img || 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1200&auto=format&fit=crop' }));
          setCategories(list);
        }
      } catch (_e) {
        if (active) { setFeatured([]); setCategories([]); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">New Season</span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">Elevate your everyday style</h1>
              <p className="mt-3 text-gray-600 dark:text-gray-300">Discover curated essentials and fresh arrivals designed for comfort and confidence.</p>
              <div className="mt-6 flex items-center gap-3">
                <a href="#featured" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700">Shop Now</a>
                <a href="#categories" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Browse Categories</a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-lg dark:bg-gray-800">
                <img
                  src="/hero.jpg"
                  alt="Hero"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories (dynamic) */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shop by Category</h2>
          <Link to="/shop" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View all</Link>
        </div>
        {loading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="aspect-[4/3] rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="group relative block overflow-hidden rounded-lg">
                <img src={c.img} alt={c.name} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded bg-white/90 px-3 py-1 text-sm font-medium text-gray-900 backdrop-blur dark:bg-gray-900/80 dark:text-white">
                  {c.name} <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{c.count}</span>
                </div>
              </Link>
            ))}
            {!categories.length && (
              <div className="col-span-full rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">No categories yet.</div>
            )}
          </div>
        )}
      </section>

      {/* Featured */}
      <section id="featured" className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h2>
          <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">See more</Link>
        </div>
        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="aspect-[4/3] rounded bg-gray-100 dark:bg-gray-800" />
                <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="mt-2 h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
            {!featured.length && (
              <div className="col-span-full rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">No products yet. Add some in Admin &gt; Products.</div>
            )}
          </div>
        )}
      </section>

      {/* Newsletter / CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-center gap-6 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white md:grid-cols-2 md:p-10">
          <div>
            <h3 className="text-2xl font-semibold">Get 10% off your first order</h3>
            <p className="mt-1 text-white/80">Join our newsletter for exclusive drops and early access.</p>
          </div>
          <form className="flex gap-3">
            <input required type="email" placeholder="you@example.com" className="min-w-0 flex-1 rounded-md px-3 py-2 text-gray-900 focus:outline-none" />
            <button className="shrink-0 rounded-md bg-black/10 px-4 py-2 font-medium backdrop-blur hover:bg-black/20">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
