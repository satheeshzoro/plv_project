export const extractApiError = (errorData, fallbackMessage = "Something went wrong") => {
  if (!errorData || typeof errorData !== "object") {
    return fallbackMessage;
  }

  if (typeof errorData.detail === "string" && errorData.detail.trim()) {
    return errorData.detail;
  }

  if (typeof errorData.error === "string" && errorData.error.trim()) {
    return errorData.error;
  }

  if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]) {
    return errorData.non_field_errors[0];
  }

  for (const value of Object.values(errorData)) {
    if (Array.isArray(value) && value[0]) {
      return value[0];
    }

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallbackMessage;
};

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const normalizeText = (value) => value.trim();
