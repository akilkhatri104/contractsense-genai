"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ContractDeleteButtonProps = {
  action: () => Promise<void>;
  contractTitle?: string;
  size?: "default" | "sm" | "xs";
};

export function ContractDeleteButton({
  action,
  contractTitle,
  size = "default",
}: ContractDeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={size}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete contract?</AlertDialogTitle>
          <AlertDialogDescription>
            {contractTitle
              ? `This will permanently remove ${contractTitle} and its stored document from Supabase.`
              : "This will permanently remove the contract and its stored document from Supabase."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
