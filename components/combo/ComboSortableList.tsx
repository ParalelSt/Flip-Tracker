'use client';

import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragIcon, TrashIcon } from '@/components/icons';
import type { TrickWithStatus } from '@/types';

interface Props {
  /** Ordered IDs currently in the combo. */
  trickIds: string[];
  /** Lookup map for trick metadata (name, category). */
  trickById: Map<string, TrickWithStatus>;
  onReorder: (next: string[]) => void;
  onRemove: (id: string) => void;
}

export function ComboSortableList({ trickIds, trickById, onReorder, onRemove }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = trickIds.indexOf(String(active.id));
    const newIndex = trickIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(trickIds, oldIndex, newIndex));
  };

  if (trickIds.length === 0) {
    return (
      <div className="rounded-2xl bg-background ring-1 ring-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
        Add tricks below to build the combo.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={trickIds} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {trickIds.map((id, i) => (
            <SortableRow
              key={id}
              id={id}
              index={i}
              trick={trickById.get(id) ?? null}
              onRemove={() => onRemove(id)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

interface RowProps {
  id: string;
  index: number;
  trick: TrickWithStatus | null;
  onRemove: () => void;
}

function SortableRow({ id, index, trick, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const name = trick?.name ?? 'Unknown trick';
  const category = trick?.category;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl bg-background ring-1 ring-border/40 px-3 py-2.5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="grid place-items-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-card cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <DragIcon className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{name}</div>
        {category && <div className="text-[11px] text-muted-foreground capitalize">{category}</div>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid place-items-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        aria-label="Remove trick"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
