// 第一行必须加边缘运行时
export const runtime = "edge";

// 函数必须带 { env } 参数
export async function POST(req: Request, { env }) {
  // 直接返回所有环境变量是否存在的布尔值
  return Response.json({
    JWT_SECRET存在: !!env.JWT_SECRET,
    DB数据库绑定存在: !!env.DB,
    CF_ACCOUNT_ID存在: !!env.CF_ACCOUNT_ID,
    CF_D1_DATABASE_ID存在: !!env.CF_D1_DATABASE_ID,
    CF_API_TOKEN存在: !!env.CF_API_TOKEN
  });
}
