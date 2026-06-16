import type {
  ApiResponse,
  ChatMessage,
  Group,
  Meetup,
  MeetupDetail,
  MeetupFilters,
  MeetupFormData,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message ?? 'API-Fehler');
  }

  if (!json) {
    throw new Error('Leere API-Antwort');
  }

  return json.data;
}

export const api = {
  getMeetups(params: Partial<MeetupFilters> = {}): Promise<Meetup[]> {
    const search = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => Boolean(value))
      )
    );

    return request<Meetup[]>(`/meetups${search.toString() ? `?${search}` : ''}`);
  },

  getMeetup(id: string | number): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}`);
  },

  createMeetup(data: MeetupFormData): Promise<Meetup> {
    return request<Meetup>('/meetups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  joinMeetup(id: string | number, pilotName: string): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ pilot_name: pilotName }),
    });
  },

  leaveMeetup(id: string | number, pilotName: string): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}/leave`, {
      method: 'POST',
      body: JSON.stringify({ pilot_name: pilotName }),
    });
  },

  getGroups(): Promise<Group[]> {
    return request<Group[]>('/groups');
  },

  getMessages(): Promise<ChatMessage[]> {
    return request<ChatMessage[]>('/messages');
  },

  sendMessage(author: string, text: string): Promise<ChatMessage> {
    return request<ChatMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify({ author, text }),
    });
  },
};
