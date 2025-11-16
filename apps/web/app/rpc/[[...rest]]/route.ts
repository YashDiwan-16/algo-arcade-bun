import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { router } from "@/lib/router";

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: Request) {
  // Check if this is an RPC client request (has {json: {...}} wrapped body)
  let isRpcClient = false;

  if (
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    const clonedRequest = request.clone();
    try {
      const bodyText = await clonedRequest.text();
      try {
        const bodyJson = JSON.parse(bodyText);
        if (bodyJson.json && typeof bodyJson.json === "object") {
          isRpcClient = true;
        }
      } catch (parseError) {
        // Not JSON or doesn't have json wrapper
      }
    } catch (e) {
      // Could not read body
    }
  }

  // If this is from RPC client, use RPC handler which handles the format correctly
  if (isRpcClient) {
    const rpcResult = await rpcHandler.handle(request, {
      prefix: "/rpc",
      context: {},
    });

    if (rpcResult.response) {
      return rpcResult.response;
    }
  }

  // Otherwise, try OpenAPI handler first (for direct REST API calls)
  const openAPIResult = await openAPIHandler.handle(request, {
    prefix: "/rpc",
    context: {},
  });

  if (openAPIResult.response) {
    return openAPIResult.response;
  }

  // Final fallback to RPC handler
  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/rpc",
    context: {},
  });

  return rpcResult.response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
