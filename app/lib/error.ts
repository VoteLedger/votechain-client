interface ErrorMessages {
  missingAuthentication?: string; // 401
  invalidSession?: string; // 403
  invalidSessionSignature?: string; // 495
  sessionMismatch?: string; // 496
  expiredSession?: string; // 498
  incompleteSession?: string; // 499
  notFound?: string; // 404
  internalServerError?: string; // 500
  unknownError?: string; // Default fallback
}

const defaultMessages: Required<ErrorMessages> = {
  missingAuthentication: "Your session is missing. Please log in.",
  invalidSession: "Your session is invalid. Please log in again.",
  invalidSessionSignature:
    "We couldn't verify your session. Please log in again.",
  sessionMismatch: "Your session data doesn't match. Please log in again.",
  expiredSession: "Your session has expired. Please log in again.",
  incompleteSession: "Your session data is incomplete. Please log in again.",
  notFound: "The requested resource could not be found.",
  internalServerError:
    "Something went wrong on our end. Please try again later.",
  unknownError: "An unknown error occurred. Please try again.",
};

export function getErrorMessageForStatusCode(
  statusCode: number,
  resourceName?: string,
  messages?: ErrorMessages
): string {
  const msg = { ...defaultMessages, ...messages };

  switch (statusCode) {
    case 401:
      return msg.missingAuthentication;

    case 403:
      return msg.invalidSession;

    case 495:
      return msg.invalidSessionSignature;

    case 496:
      return msg.sessionMismatch;

    case 498:
      return msg.expiredSession;

    case 499:
      return msg.incompleteSession;

    case 404:
      return resourceName ? `${resourceName} not found.` : msg.notFound;

    case 500:
      return msg.internalServerError;

    default:
      return msg.unknownError;
  }
}
