import { identifyContact } from "../services/contact.service";

// Identify endpoint
export const identify = async (req: any, res: any) => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact(email || null, phoneNumber || null);

    res.json({
        "contact": result
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
