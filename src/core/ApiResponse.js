// Helper code for the API consumer to understand
// the error and handle it accordingly

const StatusCode = {
  SUCCESS: "10000",
  FAILURE: "10001",
  RETRY: "10002",
  INVALID_ACCESS_TOKEN: "10003",
};

const ResponseStatus = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class ApiResponse {
  constructor(statusCode, status, message) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
  }

  prepare(res, response, headers) {
    for (const [key, value] of Object.entries(headers)) res.append(key, value);
    return res.status(this.status).json(ApiResponse.sanitize(response));
  }

  send(res, headers = {}) {
    return this.prepare(res, this, headers);
  }

  static sanitize(response) {
    const clone = {};
    Object.assign(clone, response);
    delete clone.status;
    for (const i in clone) if (typeof clone[i] === "undefined") delete clone[i];
    return clone;
  }
}

export class AuthFailureResponse extends ApiResponse {
  constructor(message = "Authentication Failure") {
    super(StatusCode.FAILURE, ResponseStatus.UNAUTHORIZED, message);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message = "Not Found") {
    super(StatusCode.FAILURE, ResponseStatus.NOT_FOUND, message);
  }

  send(res, headers = {}) {
    return super.prepare(res, this, headers);
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(message = "Forbidden") {
    super(StatusCode.FAILURE, ResponseStatus.FORBIDDEN, message);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message = "Bad Parameters") {
    super(StatusCode.FAILURE, ResponseStatus.BAD_REQUEST, message);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(message = "Internal Error") {
    super(StatusCode.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(message) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
  }
}

export class FailureMsgResponse extends ApiResponse {
  constructor(message) {
    super(StatusCode.FAILURE, ResponseStatus.SUCCESS, message);
  }
}

export class SuccessResponse extends ApiResponse {
  constructor(message, data) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
    this.data = data;
  }

  send(res, headers = {}) {
    return super.prepare(res, this, headers);
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  constructor(message = "Access token invalid") {
    super(
      StatusCode.INVALID_ACCESS_TOKEN,
      ResponseStatus.UNAUTHORIZED,
      message
    );
    this.instruction = "refresh_token";
  }

  send(res, headers = {}) {
    headers.instruction = this.instruction;
    return super.prepare(res, this, headers);
  }
}

export class TokenRefreshResponse extends ApiResponse {
  constructor(message, accessToken, refreshToken) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  send(res, headers = {}) {
    return super.prepare(res, this, headers);
  }
}
