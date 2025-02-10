import {  getAllContacts, identifyContact } from "../services/contact.service";
import { DatabaseError, handleError, ValidationError } from "../utils/errors";

// Identifies a contact based on the provided email or phone number
// It returns the contact information or an error if not found
export const identify = async (req: any, res: any) => {
  try {
    const { email, phoneNumber } = req.body;

    console.log(email, phoneNumber)

    const result = await identifyContact(email || null, phoneNumber || null);

    res.json({
      contact: result,
    });
  } catch (error: any) {
    const { statusCode, status, message, details } = handleError(error);
    res.status(statusCode).json({
      status,
      message,
      details,
    });
  }
};


// Get all contacts from the database
export const getAll = async (req: any, res: any) => {
  try {
    // get request parameters
    const { email, phoneNumber } = req.query;

    const contacts = await getAllContacts(email || null, phoneNumber || null);

    res.json({
      contacts,
    });
  } catch (error: any) {
    const { statusCode, status, message, details } = handleError(error);
    res.status(statusCode).json({
      status,
      message,
      details,
    });
  }
};
