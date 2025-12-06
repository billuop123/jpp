export default function RecruiterApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Applications
          </p>
          <h1 className="text-3xl font-semibold">Recruiter Applications</h1>
          <p className="text-muted-foreground">
            Review and score candidates for your open roles. Select a job from
            your recruiter dashboard to see its application scoring list.
          </p>
        </header>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">How this page is used</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Navigate here after choosing a specific job to access detailed
            scoring for each applicant, including relevance, strengths, and
            weaknesses.
          </p>
        </section>
      </div>
    </div>
  );
}