import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebase-admin";
import type { User } from "@/lib/auth-types";

/**
 * PUT /api/users/[id]
 * Update user profile (display name, etc.)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const updates = await req.json();
    
    // Get current user data
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Validate display name if provided
    if (updates.displayName !== undefined) {
      const trimmed = updates.displayName.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { error: "Display name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updates.displayName = trimmed;
    }
    
    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();
    
    // Update user document
    await userRef.update(updates);
    
    // Fetch and return updated data
    const updatedDoc = await userRef.get();
    const updatedData = { uid: updatedDoc.id, ...updatedDoc.data() } as User;
    
    return NextResponse.json({
      success: true,
      data: updatedData,
    });
    
  } catch (error: any) {
    console.error("Failed to update user:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to update user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]
 * Get user details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const userData = { uid: userDoc.id, ...userDoc.data() } as User;
    
    return NextResponse.json({
      success: true,
      data: userData,
    });
    
  } catch (error: any) {
    console.error("Failed to fetch user:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
