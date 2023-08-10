interface ApiBaseResponse {
  code: `API-${string}`;
  message: string;
}
export interface ApiSuccessResponse extends ApiBaseResponse {
  contents: {
    text: string;
  };
}
export interface ApiParameterErrorResponse extends ApiBaseResponse {
  error: {
    type: "Parameter Error";
    code: string;
  };
}
export interface ApiServerErrorResponse extends ApiBaseResponse {
  error: {
    type: "Server Error";
    code: string;
  };
}
export type ApiErrorResponse =
  | ApiParameterErrorResponse
  | ApiServerErrorResponse;
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface RequestBody {
  user_id: string;
}
