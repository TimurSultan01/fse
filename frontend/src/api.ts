import type {
  ApiResponse,
  AuthCredentials,
  AuthUser,
  ChatMessage,
  FilterOptions,
  Group,
  GroupDetail,
  GroupFormData,
  Meetup,
  MeetupDetail,
  MeetupFilters,
  MeetupFormData,
  PasswordChangeData,
  ProfileUpdateData,
  RegisterData,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://team16.wi1cm.uni-trier.de/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
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

function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export const api = {
  getCurrentUser(): Promise<AuthUser | null> {
    return request<AuthUser | null>('/auth/me');
  },

  login(data: AuthCredentials): Promise<AuthUser> {
    return request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register(data: RegisterData): Promise<AuthUser> {
    return request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout(): Promise<null> {
    return request<null>('/auth/logout', {
      method: 'POST',
    });
  },

  updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
    return request<AuthUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword(data: PasswordChangeData): Promise<null> {
    return request<null>('/auth/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMeetups(params: Partial<MeetupFilters> = {}): Promise<Meetup[]> {
    const query = toQuery(params);
    return request<Meetup[]>(`/meetups${query ? `?${query}` : ''}`);
  },

  getMeetupFilters(): Promise<FilterOptions> {
    return request<FilterOptions>('/meetups/filters');
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

  updateMeetup(id: string | number, data: MeetupFormData): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMeetup(id: string | number): Promise<null> {
    return request<null>(`/meetups/${id}`, {
      method: 'DELETE',
    });
  },

  joinMeetup(id: string | number): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}/join`, {
      method: 'POST',
    });
  },

  leaveMeetup(id: string | number): Promise<MeetupDetail> {
    return request<MeetupDetail>(`/meetups/${id}/leave`, {
      method: 'POST',
    });
  },

  getGroups(): Promise<Group[]> {
    return request<Group[]>('/groups');
  },

  getGroup(id: string | number): Promise<GroupDetail> {
    return request<GroupDetail>(`/groups/${id}`);
  },

  createGroup(data: GroupFormData): Promise<Group> {
    return request<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGroup(id: string | number, data: GroupFormData): Promise<GroupDetail> {
    return request<GroupDetail>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGroup(id: string | number): Promise<null> {
    return request<null>(`/groups/${id}`, {
      method: 'DELETE',
    });
  },

  joinGroup(id: string | number): Promise<GroupDetail> {
    return request<GroupDetail>(`/groups/${id}/join`, {
      method: 'POST',
    });
  },

  leaveGroup(id: string | number): Promise<GroupDetail> {
    return request<GroupDetail>(`/groups/${id}/leave`, {
      method: 'POST',
    });
  },

  getMessages(params: { group_id?: number | string; meetup_id?: number | string } = {}): Promise<ChatMessage[]> {
    const query = toQuery(params);
    return request<ChatMessage[]>(`/messages${query ? `?${query}` : ''}`);
  },

  sendMessage(text: string, options: { group_id?: number; meetup_id?: number } = {}): Promise<ChatMessage> {
    return request<ChatMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify({ text, ...options }),
    });
  },

  deleteMessage(id: string | number): Promise<null> {
    return request<null>(`/messages/${id}`, {
      method: 'DELETE',
    });
  },
};
