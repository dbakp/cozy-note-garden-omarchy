import React, { useCallback, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface ImageHandlerProps {
  editor: Editor;
  src: string;
  alt?: string;
}

export default function ImageHandler({ editor, src, alt }: ImageHandlerProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  const startResizing = useCallback((e: MouseEvent | TouchEvent, corner: string) => {
    e.preventDefault();
    const image = imageRef.current;
    if (!image) return;

    const startWidth = image.width;
    const startHeight = image.height;
    const startX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const startY = 'touches' in e ? e.touches[0].pageY : e.pageY;

    const handleResize = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].pageX : moveEvent.pageX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].pageY : moveEvent.pageY;

      const diffX = currentX - startX;
      const diffY = currentY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'bottom-right':
          newWidth = startWidth + diffX;
          newHeight = startHeight + diffY;
          break;
        case 'bottom-left':
          newWidth = startWidth - diffX;
          newHeight = startHeight + diffY;
          break;
        case 'top-right':
          newWidth = startWidth + diffX;
          newHeight = startHeight - diffY;
          break;
        case 'top-left':
          newWidth = startWidth - diffX;
          newHeight = startHeight - diffY;
          break;
      }

      image.style.width = `${Math.max(100, newWidth)}px`;
      image.style.height = `${Math.max(100, newHeight)}px`;
    };

    const stopResizing = () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', handleResize);
      window.removeEventListener('touchend', stopResizing);
    };

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResizing);
    window.addEventListener('touchmove', handleResize);
    window.addEventListener('touchend', stopResizing);
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(corner => {
      const resizer = document.createElement('div');
      resizer.className = `image-resizer ${corner}`;
      resizer.addEventListener('mousedown', (e) => startResizing(e, corner));
      resizer.addEventListener('touchstart', (e) => startResizing(e, corner));
      image.parentElement?.appendChild(resizer);
    });

    return () => {
      const resizers = image.parentElement?.querySelectorAll('.image-resizer');
      resizers?.forEach(resizer => resizer.remove());
    };
  }, [startResizing]);

  return (
    <div className="relative inline-block">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="max-w-full h-auto my-4 rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
      />
    </div>
  );
}