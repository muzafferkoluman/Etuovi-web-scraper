export interface DashboardStats {
  activeSearches: number;
  checkedToday: number;
  newListings: number;
  priceDrops: number;
  highMatchCount: number;
  bestMatchScore: number;
  recentRuns: Array<{
    id: string;
    savedSearchName: string;
    completedAt: string;
    totalFound: number;
    newProperties: number;
    priceChanges: number;
  }>;
}
