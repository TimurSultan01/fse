import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../lib/toast';
import { useConfirmStore } from '../stores/useConfirmStore';
import type { GroupDetail as GroupDetailType, GroupFormData } from '../types';
import ChatBox from '../components/ChatBox';

const groupSchema = z.object({
  name: z.string().trim().min(3, 'Der Gruppenname muss mindestens 3 Zeichen haben.').max(120),
  region: z.string().trim().min(2, 'Bitte gib eine Region ein.').max(80),
  description: z.string().trim().min(10, 'Die Beschreibung muss mindestens 10 Zeichen haben.').max(1000),
});

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestConfirmation = useConfirmStore((state) => state.requestConfirmation);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<boolean>(false);

  const groupQuery = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.getGroup(id!),
    enabled: Boolean(id),
  });

  const group = groupQuery.data ?? null;
  const joined = group?.members?.some((member) => member.user_id === user?.id) ?? false;
  const canManage = group?.can_manage === true;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', region: '', description: '' },
  });

  useEffect(() => {
    if (group) {
      reset({ name: group.name, region: group.region, description: group.description });
    }
  }, [group, reset]);

  function syncCaches(updated: GroupDetailType): void {
    queryClient.setQueryData(['group', id], updated);
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
  }

  const updateMutation = useMutation({
    mutationFn: (data: GroupFormData) => api.updateGroup(id!, data),
    onSuccess(updated) {
      syncCaches(updated);
      setEditing(false);
      toast('Gruppe wurde gespeichert.', 'success');
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Gruppe konnte nicht gespeichert werden.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteGroup(id!),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.removeQueries({ queryKey: ['group', id] });
      toast('Gruppe wurde gelöscht.', 'success');
      navigate('/gruppen');
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Gruppe konnte nicht gelöscht werden.', 'error');
    },
  });

  const membershipMutation = useMutation({
    mutationFn: () => (joined ? api.leaveGroup(id!) : api.joinGroup(id!)),
    onSuccess(updated) {
      syncCaches(updated);
      toast(joined ? 'Du bist aus der Gruppe ausgetreten.' : 'Du bist der Gruppe beigetreten.', 'success');
    },
    onError(err) {
      toast(err instanceof Error ? err.message : 'Mitgliedschaft konnte nicht geändert werden.', 'error');
    },
  });

  function requestSaveGroup(data: GroupFormData): void {
    requestConfirmation({
      title: 'Gruppe speichern?',
      message: 'Die Änderungen werden für alle Mitglieder sichtbar.',
      confirmLabel: 'Speichern',
      onConfirm: () => updateMutation.mutate(data),
    });
  }

  function requestDeleteGroup(): void {
    requestConfirmation({
      title: 'Gruppe löschen?',
      message: 'Diese Aktion entfernt die Gruppe, Mitgliedschaften und zugehörige Gruppenchats dauerhaft.',
      confirmLabel: 'Löschen',
      tone: 'danger',
      onConfirm: () => deleteMutation.mutate(),
    });
  }

  function toggleMembership(): void {
    if (!user) {
      toast('Bitte melde dich zuerst an.', 'error');
      return;
    }
    membershipMutation.mutate();
  }

  if (groupQuery.isError) {
    return (
      <p className="message error">
        {groupQuery.error instanceof Error ? groupQuery.error.message : 'Unbekannter Fehler'}
      </p>
    );
  }

  if (!group) {
    return <p className="loading-note">Lade Gruppe...</p>;
  }

  return (
    <section>
      <article className="detail">
        {editing ? (
          <form className="inline-edit" onSubmit={(event) => void handleSubmit(requestSaveGroup)(event)}>
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

            <div className="actions">
              <button disabled={isSubmitting || updateMutation.isPending}>Speichern</button>
              <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <>
            <h1>{group.name}</h1>
            <p className="detail-lead">{group.description}</p>
          </>
        )}

        <dl className="facts detail-facts">
          <div><dt>Region</dt><dd>{group.region}</dd></div>
          <div><dt>Mitglieder</dt><dd>{group.member_count}</dd></div>
        </dl>

        <h2>Mitglieder</h2>
        {group.members.length > 0 ? (
          <ul className="compact-list">
            {group.members.map((member) => (
              <li key={member.id}>{member.pilot_name}</li>
            ))}
          </ul>
        ) : (
          <p>Noch keine Mitglieder.</p>
        )}

        <div className="join-box">
          <div>
            <strong>{user ? user.display_name : 'Nicht eingeloggt'}</strong>
            <p>{user ? 'Deine Mitgliedschaft wird mit deinem Account gespeichert.' : 'Melde dich an, um Gruppen beizutreten.'}</p>
          </div>

          <button onClick={toggleMembership} disabled={!user || membershipMutation.isPending}>
            {joined ? 'Gruppe verlassen' : 'Gruppe beitreten'}
          </button>
        </div>

        {canManage && !editing && (
          <div className="actions">
            <button className="secondary-button" onClick={() => setEditing(true)}>Bearbeiten</button>
            <button className="danger-button" onClick={requestDeleteGroup} disabled={deleteMutation.isPending}>Löschen</button>
          </div>
        )}
      </article>

      <ChatBox groupId={group.id} title={`Gruppenchat: ${group.name}`} />
    </section>
  );
}
