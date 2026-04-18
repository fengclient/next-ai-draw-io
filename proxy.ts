import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { i18n } from "./lib/i18n/config"

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        negotiatorHeaders[key] = value
    })

    // @ts-expect-error locales are readonly
    const locales: string[] = i18n.locales

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales,
    )

    const locale = matchLocale(languages, locales, i18n.defaultLocale)

    return locale
}

// Public paths that don't require authentication
const PUBLIC_PATHS = [
    "/en/login",
    "/zh/login",
    "/ja/login",
    "/zh-Hant/login",
    "/api/verify-access-code",
    "/_next",
    "/favicon.ico",
    "/manifest.json",
    "/robots.txt",
    "/sitemap.xml",
]

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

function isStaticAsset(pathname: string): boolean {
    return !!pathname.match(
        /\.(js|css|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$/,
    )
}

function checkAuth(request: NextRequest, accessCodes: string[]): boolean {
    const authCookie = request.cookies.get("auth_token")

    if (!authCookie) {
        return false
    }

    const cookieValue = authCookie.value
    return accessCodes.some((code) => cookieValue === `authed_${code}`)
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip API routes, static files, and Next.js internals
    if (
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/drawio") ||
        pathname.includes("/favicon") ||
        /\.(.*)$/.test(pathname)
    ) {
        return
    }

    // Get valid access codes from env
    const accessCodes =
        process.env.ACCESS_CODE_LIST?.split(",")
            .map((code) => code.trim())
            .filter(Boolean) || []

    // If no access codes configured, allow access (development mode)
    if (accessCodes.length === 0) {
        // Continue to i18n handling
    } else if (!isPublicPath(pathname) && !isStaticAsset(pathname)) {
        // Check authentication
        if (!checkAuth(request, accessCodes)) {
            // Not authenticated, redirect to login with locale
            const locale = getLocale(request) || "zh"
            const loginUrl = new URL(`/${locale}/login`, request.url)
            loginUrl.searchParams.set("from", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // Redirect to localized path
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url,
            ),
        )
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
