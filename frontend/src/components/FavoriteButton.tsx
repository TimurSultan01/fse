import { useFavoritesStore } from '../stores/useFavoritesStore';

type FavoriteButtonProps = {
  meetupId: number;
  withText?: boolean;
};

export default function FavoriteButton({ meetupId, withText = false }: FavoriteButtonProps) {
  const favorite = useFavoritesStore((state) => state.ids.includes(meetupId));
  const toggle = useFavoritesStore((state) => state.toggle);

  return (
    <button
      type="button"
      className={`favorite-button ${favorite ? 'is-active' : ''}`}
      aria-pressed={favorite}
      aria-label={favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(meetupId);
      }}
    >
      <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
      {withText && <span>{favorite ? 'Favorit' : 'Merken'}</span>}
    </button>
  );
}
