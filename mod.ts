import { STATUS_CODE, StatusCode } from "@std/http/status";
import { contentType } from "@std/media-types";
import type { ApiResponse, RequestBody } from "./model.ts";

const responseInit = (
  contentType: string,
  status: StatusCode = STATUS_CODE.OK,
): ResponseInit => ({
  headers: { "content-type": contentType },
  status,
});

const responseText = (text: string, status: StatusCode = STATUS_CODE.OK) =>
  new Response(text, responseInit(contentType("txt"), status));

const responseJson = (res: ApiResponse, status: StatusCode) =>
  new Response(JSON.stringify(res), responseInit(contentType("json"), status));

const handler: Deno.ServeHandler = async (req) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/") {
    return responseText(
      "このAPIはAPI KEYがないと使えません。API KEYは運営者から受け取ってください",
    );
  }

  if (
    pathname === "/api" &&
    req.headers.get("x-api-key") !== Deno.env.get("X_API_KEY")
  ) {
    return responseText("APIキーがありません", STATUS_CODE.Unauthorized);
  }

  const bodyReader = await req.body?.getReader().read();
  const decoder = new TextDecoder();
  const body: RequestBody = JSON.parse(decoder.decode(bodyReader?.value));

  const isApiUserId = (userId: string) =>
    pathname === "/api" && body.user_id === userId;

  if (isApiUserId("200")) {
    return responseJson({
      code: `API-${STATUS_CODE.OK}`,
      message: "OK",
      contents: {
        text: "成功してますよ",
      },
    }, STATUS_CODE.OK);
  }

  if (isApiUserId("400")) {
    return responseJson({
      code: `API-${STATUS_CODE.BadRequest}`,
      message: "Bad Request",
      error: {
        type: "Parameter Error",
        code: "API00BR",
      },
    }, STATUS_CODE.BadRequest);
  }

  if (isApiUserId("500")) {
    return responseJson({
      code: `API-${STATUS_CODE.InternalServerError}`,
      message: "Internal Server Error",
      error: {
        type: "Server Error",
        code: "API01ISE",
      },
    }, STATUS_CODE.InternalServerError);
  }

  return responseText("お探しのコンテンツはありません", STATUS_CODE.NotFound);
};

const PORT = 8080;
Deno.serve({ port: PORT }, handler);
