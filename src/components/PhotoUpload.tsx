import { useRef } from "react";
import { Camera, X } from "lucide-react";

interface PhotoUploadProps {
  photoUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  onPhotoChange: (base64: string | null) => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .replace(/^(Pr\.|Dr\.|Pas\.?)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

const sizeMap = {
  sm: { container: "w-10 h-10", text: "text-sm", icon: 12, badge: "w-4 h-4 -bottom-0.5 -right-0.5" },
  md: { container: "w-14 h-14", text: "text-lg", icon: 14, badge: "w-5 h-5 -bottom-1 -right-1" },
  lg: { container: "w-20 h-20", text: "text-2xl", icon: 16, badge: "w-6 h-6 -bottom-1 -right-1" },
  xl: { container: "w-28 h-28", text: "text-4xl", icon: 20, badge: "w-8 h-8 -bottom-1 -right-1" },
};

export default function PhotoUpload({
  photoUrl,
  name,
  size = "md",
  onPhotoChange,
  className = "",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sz = sizeMap[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      onPhotoChange(base64);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className={`relative inline-block shrink-0 group cursor-pointer ${className}`}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Avatar circle */}
      <div
        onClick={() => inputRef.current?.click()}
        className={`${sz.container} rounded-full overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-all duration-200 relative`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className={`font-extrabold text-white ${sz.text}`}>{getInitials(name) || "?"}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={sz.icon} className="text-white" />
        </div>
      </div>

      {/* Camera badge */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`absolute ${sz.badge} rounded-full bg-purple-600 hover:bg-purple-500 border-2 border-zinc-950 flex items-center justify-center transition-all shadow-lg`}
        title="Alterar foto"
      >
        <Camera size={Math.floor(sz.icon * 0.65)} className="text-white" />
      </button>

      {/* Remove photo button (only when photo exists) */}
      {photoUrl && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPhotoChange(null); }}
          className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 border-2 border-zinc-950 flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
          title="Remover foto"
        >
          <X size={9} className="text-white" />
        </button>
      )}
    </div>
  );
}
