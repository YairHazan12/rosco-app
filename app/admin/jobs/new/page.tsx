import { getHandymen } from "@/lib/db";
import JobForm from "../_components/JobForm";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const handymen = await getHandymen();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Job</h1>
      <JobForm handymen={handymen} />
    </div>
  );
}
