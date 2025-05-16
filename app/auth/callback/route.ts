import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);

    try {
      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Userテーブルにユーザー情報があるか確認
        const { error: userError } = await supabase
          .from("User")
          .select("*")
          .eq("uid", user.id)
          .single();

        if (!userError) {
          // ユーザー情報がある場合はホーム画面へ
          return NextResponse.redirect(new URL("/home", request.url));
        } else if (userError.code === "PGRST116") {
          // ユーザー情報がない場合は登録画面へ
          return NextResponse.redirect(new URL("/register", request.url));
        }
      }
    } catch (error) {
      console.error("Auth callback error:", error);
    }
  }

  // デフォルトはログイン画面へリダイレクト
  return NextResponse.redirect(new URL("/", request.url));
}
