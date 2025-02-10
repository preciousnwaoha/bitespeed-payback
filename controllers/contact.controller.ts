import { clearContacts, identifyContact } from "../services/contact.service";
import { DatabaseError, ValidationError } from "../utils/errors";

// Identifies a contact based on the provided email or phone number
// It returns the contact information or an error if not found
export const identify = async (req: any, res: any) => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact(email || null, phoneNumber || null);

    res.json({
      contact: result,
    });
  } catch (error: any) {
    let statusCode = 400;
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof ValidationError) {
      statusCode = 422; // Unprocessable Entity
      errorMessage = error.message;
    } else if (error instanceof DatabaseError) {
      errorMessage = "There was an issue with the database.";
    }

    // Send a consistent error format
    res.status(statusCode).json({
      status: "error",
      message: errorMessage,
      details: error.stack || error.message,
    });
  }
};


export const clear = async (req: any, res: any) => {
    try {
        const { password } = req.body;

        if (password !== process.env.CLEAR_PASSWORD) {
            throw new ValidationError("Invalid password.");
        }
    
        const result = await clearContacts();
    
        res.json({
        message: "All contacts have been cleared.",
        });
    } catch (error: any) {
        let statusCode = 400;
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof ValidationError) {
        statusCode = 422; // Unprocessable Entity
        errorMessage = error.message;
        } else if (error instanceof DatabaseError) {
        errorMessage = "There was an issue with the database.";
        }
    
        // Send a consistent error format
        res.status(statusCode).json({
        status: "error",
        message: errorMessage,
        details: error.stack || error.message,
        });
    }
}
