import {
  clearAllContacts,
  getAllContacts,
  identifyContact,
} from "../services/contact.service";

// Identify endpoint
export const identify = async (req: any, res: any) => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact(email || null, phoneNumber || null);

    res.json({
      contact: result,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

// Get all contacts
export const getAll = async (req: any, res: any) => {
  const { email, phoneNumber } = req.query;

  try {
    const contacts = await getAllContacts(email || null, phoneNumber || null);

    res.json(contacts);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

// Clear all contacts
export const clearAll = async (req: any, res: any) => {
  const { email, phoneNumber, password } = req.query;

  if (password !== process.env.CLEAR_PASSWORD) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    await clearAllContacts(email || null, phoneNumber || null);

    res.json({
      message: "All contacts have been cleared",
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
