'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ComplianceReportProps {
  violations: any[];
}

export function ComplianceReport({ violations }: ComplianceReportProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-t h-64 overflow-y-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          Agent Reasoning Log
          <Badge variant={violations.length > 0 ? "destructive" : "outline"}>
            {violations.length} Issues Found
          </Badge>
        </h3>
        {violations.length === 0 && (
          <div className="text-green-600 flex items-center gap-1 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Environment Compliant
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {violations.map((v, i) => (
          <Alert key={i} variant="destructive" className="bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs uppercase tracking-wider font-bold">
              Logic Violation: {v.id}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {v.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}