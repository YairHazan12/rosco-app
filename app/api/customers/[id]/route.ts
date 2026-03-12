/**
 * /api/customers/[id]
 *
 * GET    — Returns a single customer by ID
 * PUT    — Updates a customer
 * DELETE — Deletes a customer
 */
import { NextResponse } from "next/server";
import { getCustomer, updateCustomer, deleteCustomer } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = await getCompanyIdFromCookie();
    const customer = await getCustomer(id, companyId);
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const companyId = await getCompanyIdFromCookie();
    
    // Build update data, only include provided fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.notes !== undefined) updateData.notes = body.notes;
    
    await updateCustomer(id, updateData, companyId);
    
    // Fetch and return updated customer
    const customer = await getCustomer(id, companyId);
    return NextResponse.json(customer);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = await getCompanyIdFromCookie();
    await deleteCustomer(id, companyId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
