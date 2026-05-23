"use client";

import { FileOutput } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContractReportExportButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        window.print();
      }}
    >
      <FileOutput className="size-4" />
      Export PDF
    </Button>
  );
}
