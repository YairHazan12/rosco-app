/**
 * /api/customers
 *
 * GET  — Returns customers with optional search query.
 *         Query params: ?search=query
 *         Response: { data: Customer[] }
 * POST — Creates a new customer and revalidates the "customers" cache tag.
 */
import { NextResponse } from "next/server";
import { getCustomers, createCustomer, searchCustomers } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search");
    const companyId = await getCompanyIdFromCookie();

    let customers = await getCustomers(companyId);
    
    // Apply search filter if provided
    if (searchQuery) {
      customers = searchCustomers(customers, searchQuery);
    }

    return NextResponse.json(
      { data: customers },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = await getCompanyIdFromCookie();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const customerData = {
      companyId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    };

    const customer = await createCustomer(customerData, companyId);
    return NextResponse.json(customer, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
