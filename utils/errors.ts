// src/utils/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export const handleError = (error: any) => {
  let statusCode = 400;
  let errorMessage = "An unexpected error occurred.";
  if (error instanceof ValidationError) {
    statusCode = 422; // Unprocessable Entity
    errorMessage = error.message;
  } else if (error instanceof DatabaseError) {
    statusCode = 500; // Internal Server Error
    errorMessage = "There was an issue with the database.";
  }

  return {
    statusCode: statusCode,
    status: "error",
    message: errorMessage,
    details: error.stack || error.message,
  };
};
