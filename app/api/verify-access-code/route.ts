import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const accessCodes =
        process.env.ACCESS_CODE_LIST?.split(",")
            .map((code) => code.trim())
            .filter(Boolean) || []

    // If no access codes configured, verification always passes
    if (accessCodes.length === 0) {
        return NextResponse.json({
            success: true,
            message: "No access code required",
        })
    }

    const body = await req.json().catch(() => ({}))
    const { password } = body

    if (!password) {
        return NextResponse.json(
            { success: false, message: "Access code is required" },
            { status: 401 },
        )
    }

    if (!accessCodes.includes(password)) {
        return NextResponse.json(
            { success: false, message: "Invalid access code" },
            { status: 401 },
        )
    }

    // Set cookie with 30 days expiry
    const cookieStore = await cookies()
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds

    cookieStore.set("auth_token", `authed_${password}`, {
        path: "/",
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })

    return NextResponse.json({ success: true, message: "Access code is valid" })
}
