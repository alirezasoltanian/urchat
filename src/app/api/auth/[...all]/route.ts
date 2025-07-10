import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { redirect } from "next/navigation";

const handler = toNextJsHandler(auth);

const GET = async (request: Request) => {
  console.log("Auth API GET request:", request);
  try {
    const response = await handler.GET(request);
    console.log("Auth API GET response status:", response);
    return response;
  } catch (error) {
    console.error("Auth API GET error:", error);
    throw error;
  }
};

const POST = async (request: Request) => {
  console.log("Auth API POST request:", request.url);
  try {
    const response = await handler.POST(request);
    console.log("Auth API POST response status:", response);
    return response;
  } catch (error) {
    console.error("Auth API POST error:", error);
    throw error;
  }
};

export { GET, POST };
// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";

// export const { GET, POST } = toNextJsHandler(auth.handler);
