interface ImageCropEditorProps {
  src: string;
  aspectRatio: number;
  zoom: number;
  positionX: number;
  positionY: number;
  onZoomChange: (value: number) => void;
  onPositionXChange: (value: number) => void;
  onPositionYChange: (value: number) => void;
  alt: string;
}

export default function ImageCropEditor({
  src,
  aspectRatio,
  zoom,
  positionX,
  positionY,
  onZoomChange,
  onPositionXChange,
  onPositionYChange,
  alt,
}: ImageCropEditorProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <div>
        <p className="text-xs font-semibold text-white">Adjust your photo</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Preview the crop before saving. Use zoom and position to frame the subject.
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black/30"
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            objectPosition: `${positionX}% ${positionY}%`,
            transform: `scale(${zoom})`,
          }}
        />
        <div className="pointer-events-none absolute inset-2 rounded-lg border border-white/50" />
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
          <label>Zoom</label>
          <span>{zoom.toFixed(1)}×</span>
        </div>
        <input
          aria-label="Photo zoom"
          type="range"
          min="1"
          max="2.5"
          step="0.1"
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
          <label>Horizontal position</label>
          <span>{positionX}%</span>
        </div>
        <input
          aria-label="Horizontal photo position"
          type="range"
          min="0"
          max="100"
          step="1"
          value={positionX}
          onChange={(event) => onPositionXChange(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
          <label>Vertical position</label>
          <span>{positionY}%</span>
        </div>
        <input
          aria-label="Vertical photo position"
          type="range"
          min="0"
          max="100"
          step="1"
          value={positionY}
          onChange={(event) => onPositionYChange(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          onZoomChange(1);
          onPositionXChange(50);
          onPositionYChange(50);
        }}
        className="text-xs text-emerald-300 hover:text-emerald-200"
      >
        Reset crop
      </button>
    </div>
  );
}
