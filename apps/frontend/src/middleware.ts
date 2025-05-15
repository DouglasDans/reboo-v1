import { jwtDecode } from "@/lib/jwt.control"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

const isPublicRoute = (pathname: string) => {
  return pathname === "/" || pathname === "/demo"
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Se a rota for pública, segue com a requisição
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = cookies().get("access_token") || null

  if (pathname === "/login" || pathname === "/register") {
    if (!token) {
      return NextResponse.next()
    }

    const tokenPayload = await jwtDecode(token.value)

    if (!tokenPayload) {
      const url = request.nextUrl.clone()
      url.pathname = "/logout"

      const params = new URLSearchParams(url.search)
      params.append("redirect", pathname)

      url.search = params.toString()
      return NextResponse.redirect(url)
    }

    if (tokenPayload.exp <= Date.now() / 1000) {
      const url = request.nextUrl.clone()
      url.pathname = "/logout"

      const params = new URLSearchParams(url.search)
      params.append("redirect", pathname)

      url.search = params.toString()
      return NextResponse.redirect(url)
    }

    return NextResponse.redirect(
      new URL(`${tokenPayload.userId}/dashboard`, request.url),
    )
  }

  if (pathname.match(/^\/\d+\/.*$/)) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/logout"

      const params = new URLSearchParams(url.search)
      params.append("redirect", "/login")

      url.search = params.toString()
      return NextResponse.redirect(url)
    }

    const tokenPayload = await jwtDecode(token.value)
    const urlUserId = pathname.split("/")[1] as unknown as number

    if (!tokenPayload) {
      const url = request.nextUrl.clone()
      url.pathname = "/logout"

      const params = new URLSearchParams(url.search)
      params.append("redirect", "/login")

      url.search = params.toString()
      return NextResponse.redirect(url)
    }

    if (tokenPayload.exp <= Date.now() / 1000) {
      const url = request.nextUrl.clone()
      url.pathname = "/logout"

      const params = new URLSearchParams(url.search)
      params.append("redirect", "/login")

      url.search = params.toString()
      return NextResponse.redirect(url)
    }

    if (tokenPayload.userId != urlUserId) {
      const url = request.nextUrl.clone()
      url.pathname = "/not-found"
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/:userId*",
    "/login",
    "/register",
    "/((?!/|api|_next/static|_next/image|.*\\.png$).*)",
  ],
}
