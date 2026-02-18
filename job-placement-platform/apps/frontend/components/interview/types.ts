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
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export type RecruiterApplicationsData=Pick<ApplicationData,'id' | 'relevanceScore' | 'relevancecomment' | 'technicalScore' | 'communicationScore' | 'problemSolvingScore' | 'jobRelevanceScore' | 'depthOfKnowledgeScore' | 'strengths' | 'weaknesses' >
export type ScoringListData=Pick<ApplicationData,'id'|'relevanceScore'|'user'>