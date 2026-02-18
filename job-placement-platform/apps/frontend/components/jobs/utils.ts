export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatSalary = (
  min: string | null,
  max: string | null,
  currency: string | null
) => {
  if (!min && !max) return "Not specified";
  const curr = currency || "NPR";
  if (min && max) return `${curr} ${min} - ${curr} ${max}`;
  if (min) return `From ${curr} ${min}`;
  if (max) return `Up to ${curr} ${max}`;
  return "Not specified";
};

