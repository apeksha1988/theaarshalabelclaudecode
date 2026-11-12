import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import api from '../lib/api';

// Downscale + re-encode the chosen photo in the browser so the upload stays small.
function compressImage(file, maxDim = 1000, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReturnRequestModal({ order, onClose, onDone }) {
  const [photo, setPhoto] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    setError('');
    try {
      setPhoto(await compressImage(file));
    } catch {
      setError('Could not read that image — please try another.');
    }
  };

  const submit = async () => {
    if (!photo) { setError('Please add a photo of the damage.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/orders/${order.order_id}/return`, { photo, note });
      onDone();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not submit your request. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-auto p-4" data-testid="return-modal">
      <div className="bg-white max-w-md w-full my-8 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-serif font-medium text-[#1A1A1A]">Report a damaged item</h3>
          <button onClick={onClose} aria-label="Close" className="text-[#666666] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#666666] mb-1">Order #{order.order_id}</p>
        <p className="text-sm text-[#666666] mb-4">
          Returns are accepted within 2 days of delivery if your piece arrived <b>damaged</b>.
          Please add a clear photo of the damage so we can make it right.
        </p>

        <label className="block border-2 border-dashed border-[#D8CFC0] p-4 text-center cursor-pointer hover:border-[#7A1F3D] transition-colors mb-4">
          {photo ? (
            <img src={photo} alt="Damage" className="max-h-48 mx-auto" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-[#666666] text-sm py-4">
              <Camera className="w-6 h-6" /> Tap to add a photo of the damage
            </span>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" data-testid="return-photo-input" />
        </label>
        {photo && (
          <button onClick={() => setPhoto('')} className="text-xs text-[#7A1F3D] underline mb-4 -mt-2">
            Choose a different photo
          </button>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Tell us what's wrong (optional)"
          className="w-full border border-[#D8CFC0] p-3 text-sm mb-4"
          data-testid="return-note"
        />

        {error && <p className="text-sm text-[#D32F2F] mb-3" data-testid="return-error">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-60"
          data-testid="submit-return"
        >
          {submitting ? 'Submitting…' : 'Submit return request'}
        </button>
      </div>
    </div>
  );
}
