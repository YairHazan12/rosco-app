/**
 * /api/jobs
 *
 * GET  — Returns jobs with optional pagination.
 *         Query params: ?page=1&limit=10 (defaults: page=1, limit=10)
 *         Response: { data: Job[], total: number, page: number, totalPages: number }
 * POST — Creates a new job (and recurring series if requested) and revalidates cache.
 */
import { NextResponse } from "next/server";
import { getJobs, createJob, getHandyman } from "@/lib/db";
import { getCompanyIdFromCookie, getUserUidFromCookie, getUserRoleFromCookie } from "@/lib/server-auth";
import { notifyJobAssigned } from "@/lib/notifications";
import type { RecurringSchedule } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam  = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const companyId = await getCompanyIdFromCookie();
  const userRole = await getUserRoleFromCookie();
  const userUid = await getUserUidFromCookie();

  let allJobs = await getJobs(companyId);
  if (userRole === "handyman" && userUid) {
    allJobs = allJobs.filter(job => job.handymanId === userUid);
  }
  const total = allJobs.length;

  const page  = Math.max(1, parseInt(pageParam  ?? "1",  10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitParam ?? "10", 10) || 10));

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage   = Math.min(page, totalPages);
  const startIdx   = (safePage - 1) * limit;
  const data       = allJobs.slice(startIdx, startIdx + limit);

  return NextResponse.json(
    { data, total, page: safePage, totalPages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    },
  );
}

/** Generate future occurrences of a recurring job series */
function generateRecurringDates(
  baseDate: Date,
  schedule: RecurringSchedule,
): Date[] {
  const dates: Date[] = [];
  const start = new Date(schedule.startDate);
  const end = schedule.endDate ? new Date(schedule.endDate) : null;

  // Generate up to 52 occurrences (safety cap)
  const MAX_OCCURRENCES = 52;
  let current = new Date(baseDate);

  // Advance to next occurrence
  const advance = (d: Date) => {
    const next = new Date(d);
    if (schedule.frequency === "daily") {
      next.setDate(next.getDate() + 1);
    } else if (schedule.frequency === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (schedule.frequency === "monthly") {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  };

  current = advance(current); // skip the first (already created)
  let count = 0;
  while (count < MAX_OCCURRENCES) {
    if (end && current > end) break;
    dates.push(new Date(current));
    current = advance(current);
    count++;
  }
  return dates;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = await getCompanyIdFromCookie();

    let handymanName: string | undefined;
    if (body.handymanId) {
      const handyman = await getHandyman(body.handymanId, companyId);
      handymanName = handyman?.name || undefined;
    }

    const jobData: Parameters<typeof createJob>[0] = {
      companyId,
      clientName: body.clientName,
      title: body.title,
      date: new Date(body.date).toISOString(),
      location: body.location,
      status: body.status || "Pending",
    };
    if (body.clientPhone) jobData.clientPhone = body.clientPhone;
    if (body.clientEmail) jobData.clientEmail = body.clientEmail;
    if (body.description) jobData.description = body.description;
    if (body.handymanId) jobData.handymanId = body.handymanId;
    if (handymanName) jobData.handymanName = handymanName;
    if (body.durationHours !== undefined && body.durationHours !== null) {
      jobData.durationHours = Number(body.durationHours);
    }
    if (body.jobPhotos && Array.isArray(body.jobPhotos) && body.jobPhotos.length > 0) {
      jobData.jobPhotos = body.jobPhotos;
    }
    if (body.isRecurring) {
      jobData.isRecurring = true;
      jobData.recurringSchedule = body.recurringSchedule;
    }

    const { syncCustomerFromJob } = await import("@/lib/db");
    const customerId = await syncCustomerFromJob({
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      date: jobData.date,
    }, companyId);

    if (customerId) {
      jobData.customerId = customerId;
    }

    const job = await createJob(jobData);

    // Generate recurring occurrences
    if (body.isRecurring && body.recurringSchedule) {
      const futureDates = generateRecurringDates(
        new Date(job.date),
        body.recurringSchedule as RecurringSchedule,
      );
      for (const d of futureDates) {
        const childData = {
          ...jobData,
          date: d.toISOString(),
          isRecurring: false, // children are not independently recurring
          recurringParentId: job.id,
          recurringSchedule: undefined,
        };
        await createJob(childData);
      }
    }

    if (body.handymanId) {
      notifyJobAssigned(
        body.handymanId,
        body.title,
        body.clientName,
        jobData.date
      ).catch(() => {});
    }

    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
