import { NextRequest } from "next/server";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!HEYGEN_API_KEY) {
      console.error("HEYGEN_API_KEY is missing from environment variables");
      return new Response("API key is missing from .env", {
        status: 500,
      });
    }

    console.log("🎟️ Creating HeyGen session token...");

    const res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      }
    });

    console.log("HeyGen API Response:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("HeyGen API Error:", errorText);
      return new Response(`Failed to create token: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    const data = await res.json();
    console.log("✅ Token created successfully");

    if (!data.data?.token) {
      console.error("No token in response:", data);
      return new Response("No token received from HeyGen", {
        status: 500,
      });
    }

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}