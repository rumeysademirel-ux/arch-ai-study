"use client";

interface SketchUploadProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPTED = ".png,.jpg,.jpeg,.pdf,.webp";
const MAX_BYTES = 10 * 1024 * 1024;

export function SketchUpload({ label, file, onChange }: SketchUploadProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label} <span className="text-muted font-normal">(isteğe bağlı)</span>
      </label>
      <input
        type="file"
        accept={ACCEPTED}
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null;
          if (selected && selected.size > MAX_BYTES) {
            alert("Dosya boyutu 10 MB sınırını aşıyor.");
            e.target.value = "";
            onChange(null);
            return;
          }
          onChange(selected);
        }}
        className="block w-full text-sm text-muted file:mr-3 file:rounded file:border file:border-border file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-foreground"
      />
      {file && <p className="text-xs text-muted">Seçilen dosya: {file.name}</p>}
    </div>
  );
}
