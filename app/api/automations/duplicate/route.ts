import { NextResponse } from "next/server";

/**
 * Campaign cloning has been retired. Keeping this explicit response prevents
 * old browser sessions from treating the removed endpoint as a server error.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Campaign cloning is no longer available" },
    { status: 410 }
  );
}
