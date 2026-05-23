import Link from "next/link";

import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-semibold tracking-tight text-white">
                ContractSense
              </h1>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Upload a contract, let Gemini extract clauses and risk signals, then
              review the agreement through plain-English summaries built for
              individuals, startups, and SMEs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <Button>Login to get started</Button>
                </SignInButton>
                <SignUpButton>
                  <Button variant="outline">Create an account</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button asChild>
                  <Link href="/contracts">Open contract workspace</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/tasks">Open Drizzle demo</Link>
                </Button>
                <SignOutButton>
                  <Button variant="outline">Sign out</Button>
                </SignOutButton>
              </Show>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HomeFeature
              title="Upload Area"
              description="Drag-and-drop PDF intake with validation and staged progress messaging."
            />
            <HomeFeature
              title="Clause Viewer"
              description="Accordion-based clause review with labels, original text, and plain-English explanations."
            />
            <HomeFeature
              title="Risk Badges"
              description="Color-coded High, Medium, and Low risk indicators with reasons."
            />
            <HomeFeature
              title="Summary Panel"
              description="Executive summary and next-step guidance for non-lawyers."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeFeature({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
