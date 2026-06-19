import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { closestCenter, DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import Fuse from 'fuse.js';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../api';
import SortableCard from '../components/SortableCard';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { Group, GroupFormData } from '../types';

const groupSchema = z.object({
  name: z.string().trim().min(3, 'Der Gruppenname muss mindestens 3 Zeichen haben.').max(120),
  region: z.string().trim().min(2, 'Bitte gib eine Region ein.').max(80),
  description: z.string().trim().min(10, 'Die Beschreibung muss mindestens 10 Zeichen haben.').max(1000),
});

export default function Groups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cardOrder, setCardOrder] = useState<number[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      region: '',
      description: '',
    },
  });

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.getGroups(),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: GroupFormData) => api.createGroup(data),
    onSuccess() {
      reset();
      setShowForm(false);
      toast('Gruppe wurde erstellt.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Gruppe konnte nicht erstellt werden.', 'error');
    },
  });

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const visibleGroups = useMemo(() => {
    const term = search.trim();

    if (!term) return groups;

    return new Fuse(groups, {
      keys: ['name', 'region', 'description', 'creator_display_name'],
      threshold: 0.35,
    }).search(term).map((result) => result.item);
  }, [groups, search]);

  const orderedGroups = useMemo(() => {
    const visibleIds = visibleGroups.map((group) => group.id);
    const orderedIds = [
      ...cardOrder.filter((id) => visibleIds.includes(id)),
      ...visibleIds.filter((id) => !cardOrder.includes(id)),
    ];

    return orderedIds
      .map((id) => visibleGroups.find((group) => group.id === id))
      .filter((group): group is Group => Boolean(group));
  }, [cardOrder, visibleGroups]);

  function reorderCards(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = orderedGroups.map((group) => group.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));

    if (oldIndex < 0 || newIndex < 0) return;

    setCardOrder(arrayMove(ids, oldIndex, newIndex));
  }

  function toggleForm(): void {
    if (!user) {
      setError('Bitte melde dich zuerst an.');
      return;
    }

    setError('');
    setShowForm((value) => !value);
  }

  function requestCreateGroup(data: GroupFormData): void {
    requestConfirmation({
      title: 'Gruppe speichern?',
      message: `Die Gruppe "${data.name}" wird erstellt und deinem Account zugeordnet.`,
      confirmLabel: 'Speichern',
      onConfirm: () => createGroupMutation.mutate(data),
    });
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Gruppen</h1>
          <p>Finde Community-Gruppen nach Region und Interesse oder erstelle eine neue Gruppe.</p>
        </div>
        <button onClick={toggleForm}>
          {showForm ? 'Formular schließen' : 'Neue Gruppe'}
        </button>
      </div>

      <div className="filter-bar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Suche nach Name, Region, Beschreibung oder Ersteller"
        />
      </div>

      {showForm && (
        <form className="form-card" onSubmit={(event) => void handleSubmit(requestCreateGroup)(event)}>
          <label>
            Gruppenname
            <input {...register('name')} />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>

          <label>
            Region
            <input {...register('region')} />
            {errors.region && <small className="field-error">{errors.region.message}</small>}
          </label>

          <label>
            Beschreibung
            <textarea {...register('description')} rows={4} />
            {errors.description && <small className="field-error">{errors.description.message}</small>}
          </label>

          <button disabled={isSubmitting || createGroupMutation.isPending}>Gruppe speichern</button>
        </form>
      )}

      {groupsQuery.isLoading && <p>Lade Gruppen...</p>}
      {error && <p className="message error">{error}</p>}
      {groupsQuery.error && <p className="message error">{groupsQuery.error instanceof Error ? groupsQuery.error.message : 'Unbekannter Fehler'}</p>}

      <DndContext collisionDetection={closestCenter} onDragEnd={reorderCards}>
        <SortableContext items={orderedGroups.map((group) => group.id)} strategy={rectSortingStrategy}>
          <div className="grid">
            {orderedGroups.map((group: Group) => (
              <SortableCard key={group.id} id={group.id}>
            <h2>{group.name}</h2>
            <p>{group.description}</p>
            <p className="meta-line">Erstellt von {group.creator_display_name ?? 'Unbekannt'}</p>
            <dl className="facts">
              <div><dt>Region</dt><dd>{group.region}</dd></div>
              <div><dt>Mitglieder</dt><dd>{group.member_count ?? 0}</dd></div>
            </dl>

            <details className="card-details">
              <summary>Mitglieder anzeigen</summary>
              {(group.members?.length ?? 0) > 0 ? (
                <ul className="compact-list">
                  {group.members?.map((member) => (
                    <li key={member.id}>{member.pilot_name}</li>
                  ))}
                </ul>
              ) : (
                <p>Noch keine Mitglieder.</p>
              )}
            </details>

            <Link className="button secondary card-action" to={`/gruppen/${group.id}`}>Details öffnen</Link>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!groupsQuery.isLoading && orderedGroups.length === 0 && (
        <p className="message">Keine passenden Gruppen gefunden.</p>
      )}
    </section>
  );
}
