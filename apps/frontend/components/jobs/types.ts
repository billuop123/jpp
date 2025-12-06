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
  company:{
    userId:string
  }
}

export interface JobListItem {
  id: string;
  title: string;
  location: string;
  isRemote: boolean;
  isfeatured: boolean;
  deadline: string;
  createdAt: string;
  company: {
    name: string;
    logo: string;
  };
  jobtype: {
    name: string;
  };
}

export interface JobsResponse {
  jobs?: JobListItem[];
}

