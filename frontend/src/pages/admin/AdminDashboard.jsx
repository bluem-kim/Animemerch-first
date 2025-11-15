import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useTGAlert } from '../../components/TGAlert';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, trashed: 0, reviews: 0 });
  const alertApi = useTGAlert();

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, t, r] = await Promise.all([
        api.get('/products', { params: { page: 1, limit: 1 } }),
        api.get('/products', { params: { page: 1, limit: 1, deleted: true } }),
        api.get('/reviews', { params: { page: 1, limit: 1 } })
      ]);
      if (!active) return;
      setStats({ products: p.data.total || 0, trashed: t.data.total || 0, reviews: r.data.total || 0 });
    })();
    return () => { active = false; };
  }, []);

  const Card = ({ title, value, color }) => (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="text-sm text-gray-500 dark:text-gray-300">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      <div className={`mt-4 h-1 rounded ${color}`}></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Products" value={stats.products} color="bg-indigo-500" />
        <Card title="Reviews" value={stats.reviews} color="bg-emerald-500" />
        <Card title="In Trash" value={stats.trashed} color="bg-rose-500" />
      </div>
      <div className="rounded-sm border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        Welcome to your e-commerce admin. Use the navigation to manage products, reviews, and trash.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => alertApi.alert('This is a TailGrids-styled alert box.', { title: 'localhost says' })}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Test Alert
          </button>
          <button
            type="button"
            onClick={async () => {
              const ok = await alertApi.confirm('Do you want to proceed?', { title: 'localhost says', confirmText: 'Yes', cancelText: 'No', variant: 'warning' });
              if (ok) {
                await alertApi.alert('Confirmed!', { title: 'localhost says', variant: 'success' });
              }
            }}
            className="ml-2 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Test Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
