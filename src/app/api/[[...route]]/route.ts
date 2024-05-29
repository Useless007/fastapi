// [[...route]] คือ dynamic route
// ที่สามารถเรียกใช้ได้ทุกชื่อ http://localhost:3000/api/เข้้าเส้นนี้หมด

// หากจะใช้ redis ไม่ผ่าน cloudflare worker ให้ใช้โค้ดนี้
// import { Redis } from "@upstash/redis";
import { Redis } from "@upstash/redis/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";

//api นี้จะเขียนด้วย Hono ที่เป็นเครื่องมือที่ช่วยในการเขียน api ได้ง่ายขึ้น
export const runtime = "edge";
// กำหนด runtime ให้เป็น edge คือให้เรียกใช้ api จาก edge ที่เป็น serverless function
// หรือให้เป็น node คือให้เรียกใช้ api จาก node ที่เป็น serverless function
// serverless function คือ function ที่ deploy บน cloud และสามารถเรียกใช้ได้ผ่าน url
// โดยไม่ต้องเรียกใช้ server จริง
// ในกรณีนี้เราจะใช้ edge เพราะใช้งานง่ายและเร็วกว่า node

const app = new Hono().basePath("/api");

type EnvConfig = {
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
};

app.use("/*", cors());

app.get("/search", async (c) => {
  try {
    const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } =
      env<EnvConfig>(c);

    const start = performance.now();
    // -------------------------------

    const redis = new Redis({
      token: UPSTASH_REDIS_REST_TOKEN,
      url: UPSTASH_REDIS_REST_URL,
    });

    const query = c.req.query("q")?.toUpperCase();

    if (!query) {
      return c.json({ message: "Invalid Search Query" }, { status: 400 });
    }

    const res: string[] = [];
    const rank = await redis.zrank("terms", query);

    if (rank !== null && rank !== undefined) {
      const temp = await redis.zrange<string[]>("terms", rank, rank + 100);

      for (const el of temp) {
        if (!el.startsWith(query)) {
          // console.log("break");
          break;
        }
        if (el.endsWith("*")) {
          res.push(el.substring(0, el.length - 1));
        }
      }
    }

    // -------------------------------
    const end = performance.now();

    return c.json({
      results: res,
      duration: end - start,
    });
  } catch (err) {
    console.error(err);

    return c.json(
      { results: [], message: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const GET = handle(app);
export default app as never;
