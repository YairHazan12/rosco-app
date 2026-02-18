import { prisma } from "@/lib/prisma";
import JobForm from "../_components/JobForm";

export default async function NewJobPage() {
  const handymen = await prisma.handyman.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Job</h1>
      <JobForm handymen={handymen} />
    </div>
  );
}
