export interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string;
  isRemote: boolean;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  applicationurl: string | null;
  contactEmail: string | null;
  experienceLevel: string | null;
  skills: string[];
  deadline: string;
  createdAt: string;
  views: number;
  applicationCount: number;
  isfeatured: boolean;
}

