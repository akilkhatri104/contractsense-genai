import Link from "next/link";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(180deg,oklch(0.2_0.015_240)_0%,oklch(0.18_0.015_240)_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border/70 bg-card/45 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/85">ContractSense</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            Welcome back.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
            Sign in to continue contract analysis, open your latest reports, and ask
            questions from your extracted clauses.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Secure auth powered by Clerk
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex text-sm text-foreground/80 underline underline-offset-4 transition hover:text-foreground"
          >
            Back to landing page
          </Link>
        </section>

        <section className="flex justify-center lg:justify-end">
          <SignIn
            appearance={{
              elements: {
                card: "border border-border/70 bg-card/85 shadow-xl",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "border-border/70 bg-card text-foreground hover:bg-accent",
                formButtonPrimary:
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                formFieldInput:
                  "border-border/70 bg-background text-foreground placeholder:text-muted-foreground",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}
