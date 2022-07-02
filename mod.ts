import {
  type Handler,
  serve,
  statusCode,
  type StatusCodeNumber,
  typedJsonParse,
} from "./deps.ts";
import type { ApiResponse, MimeType, RequestBody } from "./model.ts";

const responseInit = (
  contentType: MimeType,
  status: StatusCodeNumber = statusCode.ok,
): ResponseInit => ({
  headers: { "content-type": contentType },
  status,
});

const responseJson = (res: ApiResponse, status: StatusCodeNumber) =>
  new Response(JSON.stringify(res), responseInit("application/json", status));

const handler: Handler = async (req) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/") {
    return new Response(
      "このAPIはAPI KEYがないと使えません。API KEYは運営者から受け取ってください",
      responseInit("text/plain;charset=UTF-8"),
    );
  }

  if (
    pathname === "/api" &&
    req.headers.get("x-api-key") !== Deno.env.get("X_API_KEY")
  ) {
    return new Response(
      "APIキーがありません",
      responseInit("text/plain;charset=UTF-8", statusCode.unauthorized),
    );
  }

  const bodyReader = await req.body?.getReader().read();
  const decoder = new TextDecoder();
  const body = typedJsonParse<RequestBody>(decoder.decode(bodyReader?.value));

  const isApiUserId = (userId: string) =>
    pathname === "/api" && body.user_id === userId;

  if (isApiUserId("200")) {
    return responseJson({
      code: `API-${statusCode.ok}`,
      message: "OK",
      contents: {
        text: "成功してますよ",
      },
    }, statusCode.ok);
  }

  if (isApiUserId("400")) {
    return responseJson({
      code: `API-${statusCode.badRequest}`,
      message: "Bad Request",
      error: {
        type: "Parameter Error",
        code: "API00BR",
      },
    }, statusCode.badRequest);
  }

  if (isApiUserId("500")) {
    return responseJson({
      code: `API-${statusCode.internalServerError}`,
      message: "Internal Server Error",
      error: {
        type: "Server Error",
        code: "API01ISE",
      },
    }, statusCode.internalServerError);
  }

  return new Response(
    "お探しのコンテンツはありません",
    responseInit("text/plain;charset=UTF-8", statusCode.notFound),
  );
};

const ADDR = ":8080";
serve(handler, { addr: ADDR });
console.log(`run is http://localhost${ADDR}`);
