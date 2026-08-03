'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { Video } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { questionService } from '@/services/questionService';
import type { ApiErrorResponse } from '@/types/academic';

interface BulkVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export default function BulkVideoModal({
  isOpen,
  onClose,
  selectedIds,
  onSuccess,
}: BulkVideoModalProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!videoUrl && !videoFile) {
      toast.error('Provide a video link or upload a video file');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('questionIds', JSON.stringify(selectedIds));
      if (videoFile) {
        formData.append('explanationVideoFile', videoFile);
      } else if (videoUrl) {
        formData.append('explanationVideoUrl', videoUrl);
      }

      const res = await questionService.bulkAssignVideo(formData);
      toast.success(res.message);
      setVideoUrl('');
      setVideoFile(null);
      onClose();
      onSuccess();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || 'Failed to attach video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attach Video to Selected Questions">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          This video will be attached to{' '}
          <span className="font-medium text-slate-900">{selectedIds.length}</span> selected
          question(s). Useful when one video explains a whole chapter's worth of questions.
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Video Link (YouTube or other URL)
          </label>
          <input
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              if (e.target.value) setVideoFile(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="https://youtube.com/watch?v=..."
            disabled={!!videoFile}
          />
        </div>

        <div className="text-center text-xs text-slate-400">— OR —</div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Upload Video File
          </label>
          <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 w-fit">
            <Video size={16} />
            {videoFile ? videoFile.name : 'Choose video file'}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={!!videoUrl}
              onChange={(e) => {
                setVideoFile(e.target.files?.[0] || null);
                if (e.target.files?.[0]) setVideoUrl('');
              }}
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedIds.length === 0}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Attaching...' : `Attach to ${selectedIds.length} Question(s)`}
        </button>
      </div>
    </Modal>
  );
}