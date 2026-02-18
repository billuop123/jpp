import { useEffect, useState } from "react";

export type JobSource = "top" | "semantic";

export function useJobSource(canUseSemantic: boolean) {
  const [jobSource, setJobSource] = useState<JobSource>("top");

  useEffect(() => {
    if (canUseSemantic) {
      setJobSource("semantic");
    } else {
      setJobSource("top");
    }
  }, [canUseSemantic]);

  return { jobSource, setJobSource };
}

