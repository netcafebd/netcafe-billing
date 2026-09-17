import os from "os";
import cp from "child_process";

export interface ProcessItem {
  pid: string;
  threads: number;
  memoryMB: number;
  name: string;
}

export interface SystemProcessInfo {
  platform: string;
  nodeVersion: string;
  currentPid: number;
  uptimeMinutes: number;
  memoryUsageMB: number;
  systemLoad: number[];
  totalProcesses: number;
  totalThreads: number;
  processes: ProcessItem[];
  error?: string;
}

export function getSystemProcessInfo(): SystemProcessInfo {
  const mem = process.memoryUsage();
  const info: SystemProcessInfo = {
    platform: process.platform,
    nodeVersion: process.version,
    currentPid: process.pid,
    uptimeMinutes: Math.round(process.uptime() / 60),
    memoryUsageMB: Math.round(mem.rss / (1024 * 1024)),
    systemLoad: os.loadavg().map((l) => Number(l.toFixed(2))),
    totalProcesses: 1,
    totalThreads: 1,
    processes: [],
  };

  if (process.platform === "linux") {
    try {
      // Execute ps command specifically for the current Linux user
      const stdout = cp.execSync("ps -u $(whoami) -o pid,nlwp,rss,comm --no-headers", {
        timeout: 2500,
        encoding: "utf8",
      });

      const lines = stdout.trim().split("\n").filter(Boolean);
      info.totalProcesses = lines.length;
      let sumThreads = 0;

      info.processes = lines.map((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[0] || "?";
        const threads = parseInt(parts[1], 10) || 1;
        const rssKB = parseInt(parts[2], 10) || 0;
        const comm = parts.slice(3).join(" ") || "process";
        sumThreads += threads;
        return {
          pid,
          threads,
          memoryMB: Math.round(rssKB / 1024),
          name: comm,
        };
      });

      info.totalThreads = sumThreads;
    } catch (e: any) {
      info.error = e?.message || "ps command execution restricted";
    }
  } else {
    // Development fallback (Windows/Mac)
    info.processes = [
      {
        pid: String(process.pid),
        threads: 4,
        memoryMB: info.memoryUsageMB,
        name: "node (dev)",
      },
    ];
    info.totalThreads = 4;
  }

  return info;
}

