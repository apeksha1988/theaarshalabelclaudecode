import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Camera, RotateCcw } from 'lucide-react';

export default function TryOnModal({ product, onClose }) {
  const [photo, setPhoto] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rot: 0 });
  const [opacity, setOpacity] = useState(1);
  const [blend, setBlend] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const dragState = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  useEffect(() => () => stopCamera(), []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setPhoto(URL.createObjectURL(file));
    resetOverlay();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraOn(true);
      setPhoto(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      alert('Could not access the camera. Please allow camera access or upload a photo instead.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    resetOverlay();
  };

  const resetOverlay = () => setTransform({ x: 0, y: 0, scale: 1, rot: 0 });

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { sx: e.clientX, sy: e.clientY, bx: transform.x, by: transform.y };
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.sx;
    const dy = e.clientY - dragState.current.sy;
    setTransform((t) => ({ ...t, x: dragState.current.bx + dx, y: dragState.current.by + dy }));
  };
  const onPointerUp = () => {
    dragState.current = null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" data-testid="tryon-modal">
      <div className="bg-white max-w-lg w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5D9]">
          <h3 className="font-serif text-lg text-[#1A1A1A]">Try On — {product.name}</h3>
          <button onClick={onClose} aria-label="Close" data-testid="tryon-close">
            <X className="w-5 h-5 text-[#666666]" />
          </button>
        </div>

        <div className="p-5">
          {/* Stage */}
          <div className="relative w-full bg-[#F5F0E6] overflow-hidden rounded" style={{ aspectRatio: '3 / 4' }}>
            {cameraOn ? (
              <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            ) : photo ? (
              <img src={photo} alt="Your photo" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-[#666666]">
                <Camera className="w-10 h-10 mb-3 text-[#7A1F3D]" strokeWidth={1.3} />
                <p className="text-sm">Upload a photo or use your camera, then drag the jewellery to position it.</p>
              </div>
            )}

            {/* Jewellery overlay */}
            {photo && (
              <img
                src={product.images[0]}
                alt={product.name}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '45%',
                  transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) rotate(${transform.rot}deg) scale(${transform.scale})`,
                  opacity,
                  mixBlendMode: blend ? 'multiply' : 'normal',
                  touchAction: 'none',
                  cursor: 'grab',
                  userSelect: 'none',
                }}
                data-testid="tryon-overlay"
              />
            )}
          </div>

          {/* Photo source buttons */}
          <div className="flex gap-3 mt-4">
            <label className="flex-1 flex items-center justify-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-xs uppercase tracking-wide cursor-pointer hover:bg-[#7A1F3D] hover:text-white transition-colors">
              <Upload className="w-4 h-4" /> Upload photo
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            {cameraOn ? (
              <button onClick={capture} className="flex-1 flex items-center justify-center gap-2 bg-[#7A1F3D] text-white py-2.5 text-xs uppercase tracking-wide hover:bg-[#5C172E] transition-colors">
                <Camera className="w-4 h-4" /> Capture
              </button>
            ) : (
              <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-xs uppercase tracking-wide hover:bg-[#7A1F3D] hover:text-white transition-colors">
                <Camera className="w-4 h-4" /> Use camera
              </button>
            )}
          </div>

          {/* Adjustments */}
          {photo && (
            <div className="mt-5 space-y-4">
              <Slider label="Size" min={0.2} max={2} step={0.01} value={transform.scale}
                onChange={(v) => setTransform((t) => ({ ...t, scale: v }))} />
              <Slider label="Rotate" min={-180} max={180} step={1} value={transform.rot}
                onChange={(v) => setTransform((t) => ({ ...t, rot: v }))} />
              <Slider label="Opacity" min={0.3} max={1} step={0.01} value={opacity}
                onChange={setOpacity} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                  <input type="checkbox" checked={blend} onChange={(e) => setBlend(e.target.checked)} />
                  Blend with photo (hides light background)
                </label>
                <button onClick={resetOverlay} className="flex items-center gap-1 text-xs text-[#7A1F3D] hover:underline">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-[#999999] text-center">
            Tip: drag the jewellery to position it. Your photo stays on your device — it is never uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#7A1F3D]"
      />
    </div>
  );
}
