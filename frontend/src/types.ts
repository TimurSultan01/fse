export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | string[] | string;
};

export type Meetup = {
  id: number;
  creator_user_id?: number | null;
  creator_display_name?: string;
  title: string;
  spot: string;
  region: string;
  latitude?: number | null;
  longitude?: number | null;
  date: string;
  time: string;
  end_time?: string | null;
  experience_level: string;
  takeoff_direction?: string | null;
  max_participants: number;
  description: string;
  tags?: string[];
  status: string;
  participant_count: number;
  participants?: Participant[];
  free_places: number;
  can_manage?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Participant = {
  id: number;
  meetup_id: number;
  user_id?: number | null;
  pilot_name: string;
  created_at?: string;
  updated_at?: string;
};

export type MeetupDetail = Meetup & {
  participants: Participant[];
};

export type MeetupFormData = {
  title: string;
  spot: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  end_time: string;
  experience_level: string;
  takeoff_direction: string;
  max_participants: number;
  description: string;
  tags: string[];
};

export const MEETUP_TAGS = ['Thermik', 'Hike & Fly', 'Streckenflug', 'Soaring', 'Groundhandling', 'Anfängerfreundlich'] as const;

export const WIND_DIRECTIONS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'] as const;

export type MeetupFilters = {
  search: string;
  region: string;
  level: string;
  date_from: string;
  sort: string;
  tag: string;
};

export type FilterOptions = {
  regions: string[];
  levels: string[];
};

export type Group = {
  id: number;
  creator_user_id?: number | null;
  creator_display_name?: string;
  name: string;
  region: string;
  description: string;
  member_count?: number;
  members?: GroupMember[];
  can_manage?: boolean;
};

export type GroupMember = {
  id: number;
  group_id: number;
  user_id?: number | null;
  pilot_name: string;
  created_at?: string;
  updated_at?: string;
};

export type GroupDetail = Group & {
  members: GroupMember[];
  member_count: number;
};

export type GroupFormData = {
  name: string;
  region: string;
  description: string;
};

export type ChatMessage = {
  id: number;
  user_id?: number | null;
  author: string;
  text: string;
  group_id?: number | null;
  meetup_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AuthUser = {
  id: number;
  display_name: string;
  email: string;
  created_at?: string | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterData = AuthCredentials & {
  display_name: string;
};

export type ProfileUpdateData = {
  display_name: string;
  email: string;
};

export type PasswordChangeData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};
