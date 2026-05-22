import { DocumentUpload } from "@/components/document-upload";
import { Button } from "@/components/ui/button";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen min-h-screen bg-linear-to-r from-[#0f172a]  to-[#334155]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <h1 className="text-4xl font-bold text-center p-2">ContractSense</h1>
            <Show when='signed-in'>
              <UserButton />
            </Show>
          </div>
          <p>
            Individuals, Startups & SMEs often sign contracts without
            understanding legal risks. ContractSense uses Generative AI to
            extract clauses, flag risky terms and explain contracts in plain
            English which makes legal review accessible and affordable
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Show when='signed-out'>
            <SignInButton>
              <Button>
                Login to get started
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">
                Create an account
              </Button>
            </SignUpButton>
          </Show>
          <Show when='signed-in'>
            <Button asChild>
              <Link href="/tasks">Open Drizzle demo</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/documents">Open document vault</Link>
            </Button>
            <SignOutButton>
              <Button variant="outline">Sign out</Button>
            </SignOutButton>
            <DocumentUpload />
          </Show>
        </div>
      </div>
    </div>
  );
}
