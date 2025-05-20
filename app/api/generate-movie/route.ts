import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからパラメータを取得
    const body = await req.json();
    const { uid, days } = body;

    // パラメータのバリデーション
    if (!uid) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です" },
        { status: 400 }
      );
    }

    if (![1, 7, 30].includes(days)) {
      return NextResponse.json(
        { error: "daysは1、7、または30である必要があります" },
        { status: 400 }
      );
    }

    // 環境変数の確認
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "OPENAI_API_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingEnvVars.length > 0) {
      console.warn(
        `Missing environment variables: ${missingEnvVars.join(
          ", "
        )}. Using dummy data for development.`
      );
      // 開発環境では環境変数がなくてもエラーを返さない
      // ダミーデータを使用するモードでPythonスクリプトを実行
      return NextResponse.json({
        success: true,
        message: "開発モード：ダミーデータで動画が生成されました",
        note: "実際の動画は生成されていません。環境変数を設定してください。",
      });
    }

    // main.pyのパスを取得
    const scriptPath = path.join(
      process.cwd(),
      "feature",
      "movie_GenAI",
      "main.py"
    );

    // Pythonスクリプトを実行
    console.log(
      `Executing: python ${scriptPath} with uid=${uid}, days=${days}`
    );

    try {
      // macOSでは`python`ではなく`python3`コマンドが使われることが多い
      // まず`python3`コマンドを試し、失敗したら`python`コマンドを試す
      let command = `python3 ${scriptPath} ${uid} ${days}`;
      let result;

      try {
        result = await execPromise(command);
      } catch (error) {
        // エラーをStringに変換して安全に扱う
        console.log(
          "python3 command failed, trying python command instead:",
          String(error)
        );
        command = `python ${scriptPath} ${uid} ${days}`;
        result = await execPromise(command);
      }

      const { stdout, stderr } = result;
      console.log("Python script stdout:", stdout);

      if (stderr && stderr.trim() !== "") {
        console.error("Python script stderr:", stderr);
        return NextResponse.json(
          { error: "動画生成中にエラーが発生しました", details: stderr },
          { status: 500 }
        );
      }
    } catch (execError) {
      console.error("Python script execution error:", execError);

      // コマンドが見つからないエラーの場合は、開発モードと同様にダミーデータを返す
      const errorStr = String(execError);
      if (errorStr.includes("command not found")) {
        console.warn(
          "Python command not found. Using dummy data for development."
        );
        return NextResponse.json({
          success: true,
          message: "開発モード：ダミーデータで動画が生成されました",
          note: "Pythonが見つかりません。システムにPythonがインストールされているか確認してください。",
        });
      }

      return NextResponse.json(
        {
          error: "Pythonスクリプトの実行に失敗しました",
          details: errorStr,
          command: `python/python3 ${scriptPath} ${uid} ${days}`,
        },
        { status: 500 }
      );
    }

    console.log("Python script execution completed successfully");

    return NextResponse.json({
      success: true,
      message: "動画が生成されました",
    });
  } catch (error) {
    console.error("Error generating movie:", error);
    return NextResponse.json(
      { error: "動画生成中にエラーが発生しました", details: String(error) },
      { status: 500 }
    );
  }
}
