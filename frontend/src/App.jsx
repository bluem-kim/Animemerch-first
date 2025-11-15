import { Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toggleTheme, getPreferredTheme } from './utils/theme';
import './App.css';
import ProductList from './pages/products/ProductList';
import ProductCreate from './pages/products/ProductCreate';
import ProductEdit from './pages/products/ProductEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import Reviews from './pages/reviews/Reviews';
import Trash from './pages/products/Trash';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';

export default function App() {
  const [mode, setMode] = useState('light');
  useEffect(() => { setMode(getPreferredTheme()); }, []);
  const { pathname } = useLocation();
  const isDark = mode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const adminRoots = ['/admin', '/products', '/reviews', '/trash'];
  const isAdminLayout = adminRoots.some(p => pathname.startsWith(p));
  const navLink = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-2 rounded-md border border-stroke bg-white px-3 py-2 text-indigo-700 shadow-default dark:border-strokedark dark:bg-boxdark dark:text-indigo-200'
      : 'flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-gray-700 hover:border-stroke hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:border-strokedark dark:hover:bg-gray-800 dark:hover:text-white';
  if (isAdminLayout) {
    return (
      <div className="min-h-screen">
        <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
          {/* Sidebar */}
          <aside className="hidden md:flex md:flex-col border border-gray-200 border-r-0 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="text-xl font-semibold">Shop Admin</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">E-commerce Dashboard</div>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
              <NavLink to="/admin" className={navLink}>Dashboard</NavLink>
              <div className="pt-2 text-[11px] uppercase tracking-wider text-gray-400 px-3">Catalog</div>
              <NavLink to="/products" className={navLink}>Products</NavLink>
              <NavLink to="/products/new" className={navLink}>Create Product</NavLink>
              <NavLink to="/reviews" className={navLink}>Reviews</NavLink>
              <NavLink to="/trash" className={navLink}>Trash</NavLink>
            </nav>
            <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">Tailwind v4 + TailGrids</div>
          </aside>

          {/* Main content */}
          <div>
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <div className="px-4 md:px-6 py-3 flex items-center justify-between">
                <div className="md:hidden text-sm text-gray-600 dark:text-gray-300">Menu</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMode(toggleTheme())}
                    aria-label="Toggle dark mode"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {isDark ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75 9.75 9.75 0 0 1 9.607 2.41a.75.75 0 0 1 .964.964A8.25 8.25 0 0 0 20.34 14.038a.75.75 0 0 1 1.413.964z" />
                        </svg>
                        Dark
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m7-9h2M3 12H1m15.364 6.364 1.414 1.414M6.222 6.222 4.808 4.808m12.728 0 1.414 1.414M6.222 17.778l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>
                        </svg>
                        Light
                      </>
                    )}
                  </button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Admin</div>
                </div>
              </div>
            </header>
            <main className="px-4 md:px-6 py-6">
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/new" element={<ProductCreate />} />
                <Route path="/products/:id/edit" element={<ProductEdit />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/trash" element={<Trash />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Storefront layout for home and non-admin pages
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">SimpleShop</Link>
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Products</Link>
            <Link to="/admin" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Admin</Link>
            <button
              onClick={() => setMode(toggleTheme())}
              aria-label="Toggle dark mode"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {isDark ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<ProductDetails />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-200 py-6 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} SimpleShop. All rights reserved.</div>
      </footer>
    </div>
  );
}
