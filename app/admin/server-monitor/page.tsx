import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, Activity, Server, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { ProcessCleanupButton } from "../dashboard/process-actions";
import { getSystemProcessInfo } from "@/lib/services/system.service";

export const dynamic = "force-dynamic";

export default async function ServerMonitorPage() {
  await requireAdmin();

  // Fetches info and automatically triggers auto-cleanup if any zombie processes exist
  const sysInfo = getSystemProcessInfo(true);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Server & Process Monitor"
        description="Real-time cPanel CloudLinux process monitoring and automated zombie process protection."
      >
        <div className="flex items-center gap-3">
          <ProcessCleanupButton />
          <a
            href="/api/debug"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
          >
            Raw Diagnostics (JSON)
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </AdminHeader>

      {/* Auto-Clean Guard Status Alert */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-emerald-950">Auto-Clean Guard Active</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] px-2 py-0.5 font-bold">
                <Zap className="h-3 w-3 fill-emerald-600 text-emerald-600" /> Auto-Kill Enabled
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Zombie & duplicate background Node/Next.js processes are automatically detected and terminated to protect CloudLinux LVE thread limits.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-killed Notification if any zombie process was auto-terminated */}
      {sysInfo.autoKilledPids && sysInfo.autoKilledPids.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-xs">
          <p className="font-bold text-sm flex items-center gap-2 text-blue-950">
            <Zap className="h-4 w-4 text-blue-600" />
            Automatic Cleanup Triggered
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Auto-terminated {sysInfo.autoKilledPids.length} zombie process(es):{" "}
            <span className="font-mono font-bold">PID {sysInfo.autoKilledPids.join(", ")}</span>
          </p>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Running Processes</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {sysInfo.totalProcesses}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active OS processes for cPanel user</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Threads (NLWP)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Activity
                  className={`h-4 w-4 ${
                    sysInfo.totalThreads > 80
                      ? "text-red-500"
                      : sysInfo.totalThreads > 50
                      ? "text-amber-500"
                      : "text-emerald-600"
                  }`}
                />
              </div>
            </div>
            <div
              className={`mt-2 text-3xl font-bold ${
                sysInfo.totalThreads > 80
                  ? "text-red-600"
                  : sysInfo.totalThreads > 50
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {sysInfo.totalThreads}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {sysInfo.totalThreads <= 50 ? "Healthy (Under LVE limit)" : "High thread count"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Node RSS Memory</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">PID {sysInfo.currentPid}</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {sysInfo.memoryUsageMB} <span className="text-sm font-normal text-slate-500">MB</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Resident set memory size</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Runtime & Uptime</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{sysInfo.platform}</span>
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900 truncate">
              {sysInfo.nodeVersion}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Uptime: {sysInfo.uptimeMinutes} min{sysInfo.uptimeMinutes === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Process Details Table */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                <Server className="h-5 w-5 text-indigo-600" />
                Detailed Account Process Table
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Breakdown of active PIDs, NLWP thread counts, and memory allocation.
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              ps -u $(whoami) -o pid,nlwp,rss,comm
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {sysInfo.processes && sysInfo.processes.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">PID</th>
                      <th className="py-2.5 px-4 font-semibold">Threads (NLWP)</th>
                      <th className="py-2.5 px-4 font-semibold">RSS Memory</th>
                      <th className="py-2.5 px-4 font-semibold">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sysInfo.processes.map((p, idx) => (
                      <tr
                        key={`${p.pid}-${idx}`}
                        className={`hover:bg-slate-50 transition-colors ${
                          Number(p.pid) === sysInfo.currentPid ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {p.pid}
                          {Number(p.pid) === sysInfo.currentPid && (
                            <span className="ml-2 text-[10px] font-sans rounded bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5">
                              Current Node Process
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">{p.threads}</td>
                        <td className="py-2.5 px-4 text-slate-700">{p.memoryMB} MB</td>
                        <td className="py-2.5 px-4 text-slate-600 truncate max-w-sm">{p.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No process details available or single dev thread active.
            </p>
          )}

          {sysInfo.error && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200 mt-3">
              Note: Process listing info: {sysInfo.error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

