import { Status } from 'std/http/http_status.ts';
import { contentType } from 'std/media_types/mod.ts';
import type { ApiResponse, RequestBody } from "./model.ts";

const responseInit = (
  contentType: string,
  status: Status = Status.OK,
): ResponseInit => ({
  headers: { "content-type": contentType },
  status,
});

const responseText = (text: string, status: Status = Status.OK) => new Response(text, responseInit(contentType("txt"), status))

const responseJson = (res: ApiResponse, status: Status) =>
  new Response(JSON.stringify(res), responseInit(contentType("json"), status));

const handler: Deno.ServeHandler = async (req) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/") {
    return responseText("このAPIはAPI KEYがないと使えません。API KEYは運営者から受け取ってください")
  }

  if (
    pathname === "/api" &&
    req.headers.get("x-api-key") !== Deno.env.get("X_API_KEY")
  ) {
    return responseText("APIキーがありません", Status.Unauthorized)
  }

  const bodyReader = await req.body?.getReader().read();
  const decoder = new TextDecoder();
  const body: RequestBody = JSON.parse(decoder.decode(bodyReader?.value))

  const isApiUserId = (userId: string) =>
    pathname === "/api" && body.user_id === userId;

  if (isApiUserId("200")) {
    return responseJson({
      code: `API-${Status.OK}`,
      message: "OK",
      contents: {
        text: "成功してますよ",
      },
    }, Status.OK);
  }

  if (isApiUserId("400")) {
    return responseJson({
      code: `API-${Status.BadRequest}`,
      message: "Bad Request",
      error: {
        type: "Parameter Error",
        code: "API00BR",
      },
    }, Status.BadRequest);
  }

  if (isApiUserId("500")) {
    return responseJson({
      code: `API-${Status.InternalServerError}`,
      message: "Internal Server Error",
      error: {
        type: "Server Error",
        code: "API01ISE",
      },
    }, Status.InternalServerError);
  }

  return responseText("お探しのコンテンツはありません", Status.NotFound)
};

const PORT = 8080;
Deno.serve({ port: PORT }, handler)
