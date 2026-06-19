export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | string[] | string;
};

export type Meetup = {
  id: number;
  title: string;
  spot: string;
  region: string;
  date: string;
  time: string;
  experience_level: string;
  max_participants: number;
  description: string;
  status: string;
  participant_count: number;
  free_places: number;
  created_at?: string;
  updated_at?: string;
};

export type Participant = {
  id: number;
  meetup_id: number;
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
  date: string;
  time: string;
  experience_level: string;
  max_participants: number;
  description: string;
};

export type MeetupFilters = {
  search: string;
  region: string;
  level: string;
  date_from: string;
  sort: string;
};

export type FilterOptions = {
  regions: string[];
  levels: string[];
};

export type Group = {
  id: number;
  name: string;
  region: string;
  description: string;
  member_count?: number;
};

export type GroupMember = {
  id: number;
  group_id: number;
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
  author: string;
  text: string;
  group_id?: number | null;
  meetup_id?: number | null;
  created_at?: string;
  updated_at?: string;
};
