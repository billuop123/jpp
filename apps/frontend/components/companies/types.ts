export interface Company {
  id: string;
  name: string;
  email: string;
  website?: string;
  logo?: string;
  postlimit: number;
  companytypeId: string;
  userId: string;
  blacklisted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

