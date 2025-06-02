import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get user from Authorization header
function getUserFromRequest(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}

export async function PATCH(request) {
  try {
    const payload = getUserFromRequest(request);

    if (!payload) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, mobile } = body;

    if (!fullName && !mobile) {
      return NextResponse.json(
        { message: "No data provided to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: {
        fullName: fullName || undefined,
        mobile: mobile || undefined,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}