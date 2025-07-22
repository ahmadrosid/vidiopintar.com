export interface RetentionCohort {
  cohortPeriod: string;
  totalUsers: number;
  day1Retained: number;
  day3Retained: number;
  day5Retained: number;
  day7Retained: number;
  day1Percentage: number;
  day3Percentage: number;
  day5Percentage: number;
  day7Percentage: number;
}

export interface RetentionMetrics {
  mau: number;
  wau: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  newUsersToday: number;
  totalUsers: number;
  stickinessRatio: number;
  cohorts: RetentionCohort[];
}

export interface UserActivityData {
  activityDate: string;
  activeUsers: number;
  videosProcessed: number;
}

export interface UserSegmentData {
  activeUsers: number;
  inactiveUsers: number;
}

export interface RetentionDashboardData {
  metrics: RetentionMetrics;
  activityData: UserActivityData[];
  segments: UserSegmentData;
}