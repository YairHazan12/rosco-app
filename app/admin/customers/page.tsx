import { getCustomers } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import CustomersList from "./_components/CustomersList";

export default async function CustomersPage() {
  const companyId = await getCompanyIdFromCookie();
  const customers = await getCustomers(companyId);

  return (
    <div className="ios-page">
      <header className="ios-header">
        <h1 className="ios-page-title">Customers</h1>
      </header>

      <CustomersList initialCustomers={customers} />
    </div>
  );
}
