"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";

export function ProcessCleanupButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleCleanup() {
    if (!confirm("Are you sure you want to terminate any zombie or duplicate processes?")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/system/cleanup", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        if (data.killedPids && data.killedPids.length > 0) {
          setMessage(`Terminated ${data.killedPids.length} zombie process(es): PID ${data.killedPids.join(", ")}`);
        } else {
          setMessage("No zombie processes found. All clean!");
        }
        router.refresh();
      } else {
        alert(data.error || "Failed to terminate zombie processes.");
      }
    } catch (err: any) {
      alert("Error calling cleanup API: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          {message}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleCleanup}
        className="text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            Cleaning...
          </>
        ) : (
          <>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clean Zombie Processes
          </>
        )}
      </Button>
    </div>
  );
}

