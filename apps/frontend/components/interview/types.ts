export interface ApplicationData {
  id: string;
  relevanceScore: number | null;
  relevancecomment: string | null;
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  jobRelevanceScore: number | null;
  depthOfKnowledgeScore: number | null;
  strengths: string | null;
  weaknesses: string | null;
  job: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    company: {
      name: string;
      logo: string | null;
    } | null;
    jobtype: {
      name: string;
    } | null;
    salaryMin: string | null;
    salaryMax: string | null;
    salaryCurrency: string | null;
  };
}

