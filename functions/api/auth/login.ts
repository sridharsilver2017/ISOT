import { signJwt } from "../../_jwt";

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const password = body.password || "";
    const username = body.username || "admin";

    if (!password) {
      return new Response(
        JSON.stringify({ error: "Password is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let user: any = null;

    // Primary master password validation
    if (password === "srd4usSR@78" || password === "admin123" || password === "isot2026") {
      user = {
        id: "admin-1",
        username: "admin",
        name: "ISOT Organizing Committee Admin",
        email: "admin@isot2026.com",
        role: "super_admin",
      };
    }

    // Check Cloudflare D1 Database if available
    if (!user && env.DB) {
      try {
        const stmt = env.DB.prepare(
          "SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)"
        );
        const dbUser = await stmt.bind(username, username).first();
        if (dbUser && dbUser.password_hash === password) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
          };
        }
      } catch (err) {
        console.warn("D1 Query Error:", err);
      }
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid password. Access denied." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate JWT token
    const token = await signJwt(user, env.JWT_SECRET || "isot-secret-jwt-key");

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Authentication error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
