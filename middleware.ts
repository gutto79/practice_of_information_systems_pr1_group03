import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 認証が不要なパス
const publicPaths = ["/", "/auth/callback"];

export async function middleware(request: NextRequest) {
  // URLからパスを取得
  const path = request.nextUrl.pathname;

  // 認証が不要なパスの場合はスキップ
  if (
    publicPaths.some(
      (publicPath) => path === publicPath || path.startsWith("/auth/")
    )
  ) {
    return NextResponse.next();
  }

  // Cookieからセッショントークンを取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Cookieからセッション情報を取得
  // Supabaseは複数のCookieを使用するため、すべてのCookieを転送
  const cookieHeader = request.headers.get("cookie") || "";

  // Cookieヘッダーがない場合はログインページにリダイレクト
  if (!cookieHeader.includes("sb-")) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // サーバーサイドでSupabaseクライアントを初期化（Cookieヘッダーを渡す）
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          cookie: cookieHeader,
        },
      },
    });

    // セッション情報を取得
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // セッションの取得に失敗した場合はログインページにリダイレクト
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // セッションからユーザー情報を取得
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      // エラーが発生した場合やユーザーが取得できない場合はログインページにリダイレクト
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // 認証成功の場合は次のハンドラに進む
    return NextResponse.next();
  } catch (error) {
    console.error("認証エラー:", error);
    // エラーが発生した場合はログインページにリダイレクト
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスに対してミドルウェアを適用:
     * - /home, /calendar, /list, /search, /register などのアプリケーションパス
     * - ただし、/, /login, /auth/* は除外
     */
    "/home/:path*",
    "/calendar/:path*",
    "/list/:path*",
    "/search/:path*",
    "/register/:path*",
  ],
};
