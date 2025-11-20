import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`);
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Max size is 5MB`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [photos, maxPhotos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    if (photos.length + files.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length > 0) {
      onPhotosChange([...photos, ...validFiles]);
      toast.success(`${validFiles.length} photo(s) added`);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-ekami-gold-500 bg-ekami-gold-50 dark:bg-ekami-gold-900/10'
            : 'border-ekami-silver-300 dark:border-ekami-charcoal-600 hover:border-ekami-gold-400'
        }`}
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />
        
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-16 h-16 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-ekami-gold-600" />
          </div>
          
          <p className="text-lg font-semibold text-ekami-charcoal-900 dark:text-white mb-2">
            {dragActive ? 'Drop photos here' : 'Upload Photos'}
          </p>
          
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 text-center">
            Drag and drop or click to browse
          </p>
          
          <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-2">
            Max {maxPhotos} photos • Up to 5MB each • JPG, PNG, WEBP
          </p>
          
          {photos.length >= maxPhotos && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
              Maximum number of photos reached
            </p>
          )}
        </label>
      </div>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                  <p className="text-xs text-white truncate">
                    {photo.name}
                  </p>
                  <p className="text-xs text-white/70">
                    {(photo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Photo Count */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            {photos.length} of {maxPhotos} photos uploaded
          </span>
          {photos.length < maxPhotos && (
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="text-ekami-gold-600 hover:text-ekami-gold-700 font-medium"
            >
              Add more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
