 "use client";
 
 import LoadingStep from "@/components/LoadingStep";
 import { useUser } from "@/store/user";
 import AnimatedGrid from "@/components/home/AnimatedGrid";
 import JobsHeader from "./JobsHeader";
 import JobsGrid from "./JobsGrid";
 import { useJobs } from "./hooks/useJobs";
 import { useJobSource } from "./hooks/useJobSource";
 import type { JobsResponse } from "./types";
 
 interface JobsClientProps {
   initialTopViewedJobs: JobsResponse | null;
 }
 
 export default function JobsClient({ initialTopViewedJobs }: JobsClientProps) {
   const { token, role } = useUser();
 
   const {
     userQuery,
     topViewedJobsQuery,
     resumeQuery,
     jobsQuery,
     topViewedJobs,
     semanticJobs,
     canUseSemantic,
     canFetchUser,
     canFetchResume,
   } = useJobs(token, role, initialTopViewedJobs ?? undefined);
 
   const { jobSource, setJobSource } = useJobSource(canUseSemantic);
 
   const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     return date.toLocaleDateString("en-US", {
       year: "numeric",
       month: "short",
       day: "numeric",
     });
   };
 
   if (!initialTopViewedJobs && topViewedJobsQuery.isPending) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="Loading top viewed jobs..." />
       </div>
     );
   }
 
   if (canFetchUser && userQuery.isPending) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="Checking user profile..." />
       </div>
     );
   }
 
   if (userQuery.data && !userQuery.data.resumeLink) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="Redirecting to resume upload..." />
       </div>
     );
   }
 
   if (canFetchResume && resumeQuery.isPending) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="Extracting resume text..." />
       </div>
     );
   }
 
   if (jobSource === "semantic" && jobsQuery.isPending) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="Loading jobs..." />
       </div>
     );
   }
 
   if (jobSource === "semantic" && !resumeQuery.data) {
     return (
       <div className="min-h-[calc(100vh-8rem)] flex flex-col">
         <LoadingStep message="No resume data available..." />
       </div>
     );
   }
 
   const displayJobs = jobSource === "semantic" ? semanticJobs : topViewedJobs;
   const showSourceSelector = canUseSemantic && topViewedJobs.length > 0;
 
   return (
     <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
       <AnimatedGrid
         numSquares={30}
         maxOpacity={0.4}
         duration={3}
         repeatDelay={1}
         className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
       />
       <div className="relative z-10">
         <JobsHeader
           jobSource={jobSource}
           displayJobsCount={displayJobs.length}
           showSourceSelector={showSourceSelector}
           onSourceChange={setJobSource}
         />
         <JobsGrid jobs={displayJobs} formatDate={formatDate} />
       </div>
     </div>
   );
 }


