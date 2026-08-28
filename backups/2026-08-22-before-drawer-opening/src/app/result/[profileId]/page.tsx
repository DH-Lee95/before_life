import { ResultView } from "@/components/ResultView";

type ResultPageProps = {
  params: Promise<{
    profileId: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { profileId } = await params;
  const { token = "" } = await searchParams;

  return (
    <main className="min-h-dvh px-5 py-6 text-archive-text">
      <div className="mx-auto w-full max-w-md">
        <ResultView profileId={profileId} token={token} />
      </div>
    </main>
  );
}
