export interface JobFormData {
  title: string;
  description: string;
  jobtype: string;
  location: string;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  applicationurl: string;
  contactEmail: string;
  experienceLevel: string;
  deadline: string;
}

export const initialFormState: JobFormData = {
  title: "",
  description: "",
  jobtype: "",
  location: "",
  isRemote: false,
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "NPR",
  requirements: "",
  responsibilities: "",
  benefits: "",
  applicationurl: "",
  contactEmail: "",
  experienceLevel: "",
  deadline: "",
};

