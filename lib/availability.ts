/**
 * Worker availability utilities for ROSCO job scheduling.
 */
import type { Handyman, Job } from "./types";

export interface AvailabilityResult {
  available: Handyman[];
  busy: { handyman: Handyman; busyUntil: Date }[];
}

/**
 * Returns which handymen are available (no overlapping jobs) for a given time slot.
 *
 * Overlap condition:
 *   job.startTime < requestedEnd  AND  job.endTime > requestedStart
 *
 * @param startTime  Requested job start time
 * @param durationMinutes  Requested job duration in minutes
 * @param allHandymen  All handymen in the company
 * @param allJobs  All jobs in the company (used for overlap detection)
 */
export function getAvailableHandymen(
  startTime: Date,
  durationMinutes: number,
  allHandymen: Handyman[],
  allJobs: Job[],
): AvailabilityResult {
  const requestedStart = startTime.getTime();
  const requestedEnd = requestedStart + durationMinutes * 60 * 1000;

  const busyMap = new Map<string, Date>(); // handymanId → latest busy-until time

  for (const job of allJobs) {
    if (!job.handymanId) continue;
    // Only consider active jobs (not completed/cancelled)
    if (job.status === "Completed") continue;

    const jobStart = new Date(job.date).getTime();
    const jobDurationMs = (job.durationHours ?? 1) * 60 * 60 * 1000;
    const jobEnd = jobStart + jobDurationMs;

    // Check overlap
    if (jobStart < requestedEnd && jobEnd > requestedStart) {
      const existing = busyMap.get(job.handymanId);
      const jobEndDate = new Date(jobEnd);
      if (!existing || jobEndDate > existing) {
        busyMap.set(job.handymanId, jobEndDate);
      }
    }
  }

  const available: Handyman[] = [];
  const busy: { handyman: Handyman; busyUntil: Date }[] = [];

  for (const handyman of allHandymen) {
    const busyUntil = busyMap.get(handyman.id);
    if (busyUntil) {
      busy.push({ handyman, busyUntil });
    } else {
      available.push(handyman);
    }
  }

  return { available, busy };
}
