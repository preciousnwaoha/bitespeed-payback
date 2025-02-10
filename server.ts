// Step 1: Setup Express and Prisma
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import { PrismaClient } from "@prisma/client";
const app: Express = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(express.json());

// Identify endpoint
app.post("/identify", async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  const emailDomain = email ? email.split("@")[1] : undefined;

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          {
            email: emailDomain
              ? { contains: `@${emailDomain}`, mode: "insensitive" }
              : undefined,
          },
          { phoneNumber: phoneNumber || undefined },
        ],
      },
    });

    // Get the oldest contact as primary contact
    let primaryContact = contacts
      .sort((a, b) =>
        new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime()
          ? -1
          : 1
      )
      .find((c) => c.linkedId === null);

    if (!primaryContact && contacts.length > 0) {
      primaryContact = contacts[0];
    }

    if (!primaryContact) {
      const newContact = await prisma.contact.create({
        data: { email, phoneNumber, linkedId: null, linkPrecedence: "primary" },
      });

      res.json({
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(Boolean),
        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
        secondaryContactIds: [],
      });
    } else {
      // Get all linked secondary contacts
      const secondaryContacts = contacts.filter(
        (c) => c.id !== primaryContact.id
      );

      // If a new contact is introduced, create a secondary contact
      const existingEmails = new Set(
        contacts.map((c) => c.email).filter(Boolean)
      );
      const existingPhones = new Set(
        contacts.map((c) => c.phoneNumber).filter(Boolean)
      );

      if (
        (email && !existingEmails.has(email)) ||
        (phoneNumber && !existingPhones.has(phoneNumber))
      ) {
        const newSecondary = await prisma.contact.create({
          data: {
            email,
            phoneNumber,
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
          },
        });

        secondaryContacts.push(newSecondary);
      }

      // Prepare response
      const response = {
        primaryContactId: primaryContact.id,
        emails: [
          primaryContact.email,
          ...secondaryContacts.map((c) => c.email),
        ].filter(Boolean),
        phoneNumbers: [
          primaryContact.phoneNumber,
          ...secondaryContacts.map((c) => c.phoneNumber),
        ].filter(Boolean),
        secondaryContactIds: secondaryContacts.map((c) => c.id),
      };

      res.json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
