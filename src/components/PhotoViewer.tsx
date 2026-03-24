import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PhotoViewerProps {
  url: string | null;
  open: boolean;
  onClose: () => void;
}

export function PhotoViewer({ url, open, onClose }: PhotoViewerProps) {
  if (!url) return null;
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 sm:p-4">
        <VisuallyHidden><DialogTitle>Foto Paket</DialogTitle></VisuallyHidden>
        <img src={url} alt="Foto Paket" className="w-full h-auto max-h-[80vh] object-contain rounded-md" />
      </DialogContent>
    </Dialog>
  );
}
