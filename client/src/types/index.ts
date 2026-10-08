export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SkillType = 'TEACH' | 'LEARN';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
export type ExchangeStatus = 'PROPOSED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type GroupRole = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NotificationType =
  | 'CONNECTION_REQUEST'
  | 'CONNECTION_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'GROUP_INVITE'
  | 'GROUP_ACTIVITY'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'ROOM_INVITE'
  | 'EXCHANGE_PROPOSAL'
  | 'EXCHANGE_ACCEPTED'
  | 'EXCHANGE_COMPLETED';

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  type: SkillType;
  level: SkillLevel;
  skill: {
    id: string;
    name: string;
    category: string;
  };
}

export interface UserInterest {
  id: string;
  userId: string;
  interestId: string;
  interest: {
    id: string;
    name: string;
    category?: string | null;
  };
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: string;
  timeSlot: string;
  preference: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  college: string;
  course: string;
  yearOfStudy: string;
  bio?: string | null;
  headline?: string | null;
  learningFormat?: string | null;
  learningStyle?: string | null;
  privacySetting: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  skills: UserSkill[];
  interests: UserInterest[];
  availabilities: Availability[];
  _count?: {
    sentConnections?: number;
    receivedConnections?: number;
    groupMemberships?: number;
    receivedReviews?: number;
  };
  ratingSummary?: {
    average: number | null;
    count: number;
  };
}

export interface CompatibilityInfo {
  score: number;
  reasons: string[];
  mutualSkills: {
    youTeachTheyLearn: string[];
    theyTeachYouLearn: string[];
  };
  sharedInterests: string[];
  sharedAvailability: string[];
  compatibleFormat: boolean;
}

export interface DiscoverUser extends User {
  compatibility: CompatibilityInfo;
  connection?: {
    id: string;
    status: ConnectionStatus;
    isSender: boolean;
  } | null;
}

export interface ConnectionRecord {
  connectionId: string;
  connectedSince: string;
  peer: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    college: string;
    course: string;
    yearOfStudy: string;
    headline?: string | null;
    skills: UserSkill[];
  };
}

export interface PendingConnection {
  id: string;
  senderId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    college: string;
    course: string;
    yearOfStudy: string;
    headline?: string | null;
    skills: UserSkill[];
  };
  receiver?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    college: string;
    course: string;
    yearOfStudy: string;
    headline?: string | null;
    skills: UserSkill[];
  };
}

export interface SkillExchange {
  id: string;
  initiatorId: string;
  partnerId: string;
  teachSkill: string;
  learnSkill: string;
  schedule: string;
  format: string;
  status: ExchangeStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  initiator: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college: string;
    course: string;
  };
  partner: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college: string;
    course: string;
  };
  reviews?: Review[];
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  creatorId: string;
  isPrivate: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college?: string;
  };
  members: Array<{
    id: string;
    groupId: string;
    userId: string;
    role: GroupRole;
    joinedAt: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
      college: string;
      headline?: string | null;
    };
  }>;
  tasks?: Task[];
  resources?: Resource[];
  messages?: Message[];
  isMember?: boolean;
  _count?: {
    members: number;
    tasks: number;
    resources: number;
    messages: number;
  };
}

export interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  creatorId: string;
  isPrivate: boolean;
  activeTimer: number;
  isTimerOn: boolean;
  sharedNotes: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college?: string;
  };
  members: Array<{
    id: string;
    roomId: string;
    userId: string;
    joinedAt: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
      college: string;
      headline?: string | null;
    };
  }>;
  tasks?: Task[];
  resources?: Resource[];
  messages?: Message[];
  isMember?: boolean;
  _count?: {
    members: number;
    tasks: number;
    messages: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: string;
  assigneeId?: string | null;
  groupId?: string | null;
  roomId?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  assignee?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  } | null;
  group?: {
    id: string;
    name: string;
  } | null;
  room?: {
    id: string;
    name: string;
  } | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string | null;
  groupId?: string | null;
  roomId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number | null;
  uploaderId: string;
  groupId?: string | null;
  roomId?: string | null;
  createdAt: string;
  uploader: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

export interface Review {
  id: string;
  exchangeId?: string | null;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  feedback: string;
  createdAt: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}
