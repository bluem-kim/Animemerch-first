import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { api, toFormData } from '../../utils/api';

const schema = Yup.object({
  name: Yup.string().required('Required'),
  price: Yup.number().typeError('Must be a number').min(0, '>= 0').required('Required'),
  category: Yup.string().required('Required'),
  description: Yup.string().max(2000, 'Too long')
});

export default function ProductForm({ initialValues, onSubmit, submitLabel = 'Save', isEdit = false }) {
  const [existingPhotos, setExistingPhotos] = useState([]); // { url, public_id }
  const [keepPhotoIds, setKeepPhotoIds] = useState([]); // public_id[] to keep
  const [newPreviews, setNewPreviews] = useState([]); // previews for newly selected files

  useEffect(() => {
    const init = initialValues?.photos || [];
    if (isEdit && init.length) {
      setExistingPhotos(init);
      setKeepPhotoIds(init.map(p => p.public_id));
    }
  }, [isEdit, initialValues]);

  const handleFilesChange = (files, setFieldValue) => {
    const arr = Array.from(files || []);
    setFieldValue('photos', arr);
    const urls = arr.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setNewPreviews(urls);
  };

  const toggleRemoveExisting = (public_id) => {
    setKeepPhotoIds(prev => prev.includes(public_id) ? prev.filter(id => id !== public_id) : [...prev, public_id]);
  };

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <Formik
        initialValues={{ name: '', price: '', category: '', description: '', photos: [], ...initialValues }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            await onSubmit({ ...values, keepPhotoIds });
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            {/* Name */}
            <div className="rounded-sm border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
              <Field name="name" type="text" placeholder="Enter product name" className="mt-2 block w-full" />
              <div className="text-sm text-red-600 mt-1"><ErrorMessage name="name" /></div>
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Price</label>
                <Field name="price" type="number" step="0.01" className="mt-2 block w-full" />
                <div className="text-sm text-red-600 mt-1"><ErrorMessage name="price" /></div>
              </div>
              <div className="rounded-sm border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
                <Field name="category" type="text" placeholder="e.g. Electronics" className="mt-2 block w-full" />
                <div className="text-sm text-red-600 mt-1"><ErrorMessage name="category" /></div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-sm border border-stroke bg-white p-4 dark:border-strokedark dark:border-gray-700 dark:bg-boxdark dark:bg-gray-900">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
              <Field name="description" as="textarea" rows={4} className="mt-2 block w-full" />
              <div className="text-sm text-red-600 mt-1"><ErrorMessage name="description" /></div>
            </div>

            {/* Photos */}
            <div className="rounded-sm border-2 border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Photos</label>
              {/* Existing photos (edit mode) */}
              {isEdit && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {existingPhotos.length === 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">No existing photos</span>
                  )}
                  {existingPhotos.map((p) => {
                    const kept = keepPhotoIds.includes(p.public_id);
                    return (
                      <div key={p.public_id} className={`relative h-20 w-20 rounded border ${kept ? 'border-gray-200 dark:border-gray-700' : 'border-red-400'} overflow-hidden`}>
                        <img src={p.url} alt={p.public_id} className={`h-full w-full object-cover ${kept ? '' : 'opacity-40'}`} />
                        <button type="button" onClick={() => toggleRemoveExisting(p.public_id)} className={`absolute top-1 right-1 rounded px-1 text-xs ${kept ? 'bg-gray-800/70 text-white' : 'bg-green-600 text-white'}`} title={kept ? 'Remove from product' : 'Keep photo'}>
                          {kept ? '×' : '↺'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-2 flex items-center gap-3">
                <label htmlFor="photosInput" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 0 1 5.25 6h2.086a2.25 2.25 0 0 1 1.59.659l.828.828A2.25 2.25 0 0 0 11.343 8.25H18.75A2.25 2.25 0 0 1 21 10.5v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5Z"/>
                  </svg>
                  Choose files
                </label>
                <input id="photosInput" type="file" name="photos" multiple accept="image/*" onChange={(e)=> handleFilesChange(e.target.files, setFieldValue)} className="sr-only" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{newPreviews.length ? `${newPreviews.length} selected` : 'No new files selected'}</span>
              </div>
              {!!newPreviews.length && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {newPreviews.map((p, idx) => (
                    <img key={idx} src={p.url} alt={p.name} className="h-20 w-20 object-cover rounded border border-gray-200 dark:border-gray-700" />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow-default hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                {isSubmitting ? 'Saving…' : submitLabel}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
