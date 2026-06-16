'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, validateImageFile } from '@/lib/cloudinary';
import { toast } from 'sonner';

export interface UploadedImage {
  url: string;
  cloudinary_id: string;
  is_primary: boolean;
  sort_order: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    const totalSelected = files.length;
    if (images.length + totalSelected > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    Array.from(files).forEach(async (file, idx) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        return;
      }

      const uploadKey = `${file.name}-${Date.now()}-${idx}`;
      setUploading((prev) => ({ ...prev, [uploadKey]: 0 }));

      try {
        const result = await uploadImage(file, (progress) => {
          setUploading((prev) => ({ ...prev, [uploadKey]: progress.percentage }));
        });

        const newImage: UploadedImage = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
          is_primary: images.length === 0 && idx === 0, // Mark first as primary
          sort_order: images.length + idx,
        };

        onChange([...images, newImage]);
        toast.success(`${file.name} uploaded successfully.`);
      } catch {
        toast.error(`Failed to upload ${file.name}.`);
      } finally {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[uploadKey];
          return next;
        });
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.cloudinary_id !== id);
    // Re-index sort order
    const updated = filtered.map((img, i) => ({
      ...img,
      sort_order: i,
      is_primary: i === 0 ? true : img.is_primary, // Keep one primary
    }));
    onChange(updated);
  };

  const setPrimaryImage = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      is_primary: img.cloudinary_id === id,
    }));
    onChange(updated);
  };

  const uploadingCount = Object.keys(uploading).length;

  return (
    <div className="space-y-4 font-sans text-left select-none">
      <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
        Couture Gallery ({images.length}/{maxImages} Images)
      </span>

      {/* Drag & Drop Frame */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="h-36 border-2 border-dashed border-border hover:border-champagne rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAF9F6] p-4"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Upload size={22} className="text-champagne mb-2 animate-pulse" />
          <p className="text-xs font-mono text-charcoal uppercase tracking-wider font-bold">
            Drag & Drop or Click to Upload
          </p>
          <span className="text-[9px] text-charcoal-light/60 mt-1 font-mono">
            JPG, PNG, WebP or HEIC up to 10MB
          </span>
        </div>
      )}

      {/* Uploading Status list */}
      {uploadingCount > 0 && (
        <div className="space-y-2">
          {Object.entries(uploading).map(([key, pct]) => (
            <div key={key} className="p-3 border border-border rounded bg-white flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-charcoal-light">
                <Loader2 size={13} className="animate-spin text-champagne" /> Uploading image...
              </span>
              <span className="font-bold text-champagne">{pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Gallery List Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.cloudinary_id}
              className="aspect-square border border-border rounded-lg relative overflow-hidden group bg-ivory-dark"
            >
              <img src={img.url} alt="Listing thumbnail" className="w-full h-full object-cover" />
              
              {/* Overlays on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(img.cloudinary_id)}
                    className="p-1.5 bg-white text-charcoal hover:bg-champagne hover:text-white rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.cloudinary_id)}
                  className="p-1.5 bg-white text-error hover:bg-error hover:text-white rounded transition-colors cursor-pointer"
                  title="Delete image"
                >
                  <X size={14} />
                </button>
              </div>

              {img.is_primary && (
                <span className="absolute top-2 left-2 bg-champagne text-white text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded shadow">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
