import type { ReactNode } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

type SortableCardProps = {
  id: string | number;
  children: ReactNode;
};

export default function SortableCard({ id, children }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <article
      className={`card sortable-card ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        className="drag-handle"
        type="button"
        aria-label="Card verschieben"
        title="Card verschieben"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      {children}
    </article>
  );
}
