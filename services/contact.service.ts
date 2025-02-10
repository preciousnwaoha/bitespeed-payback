import prisma from "../config/prisma";
import { DatabaseError, ValidationError } from "../utils/errors";
import {
  EMAIL_REGEX,
  matchingEmailDomain,
  PHONE_NUMBER_REGEX,
} from "../utils/validations";

// Identifies a contact based on the provided email or phone number
export const matchingContacts = async (
  email: string | null,
  phoneNumber: string | null
) => {
  if (
    (!email && !phoneNumber) ||
    (email &&
      !EMAIL_REGEX.test(email) &&
      phoneNumber &&
      !PHONE_NUMBER_REGEX.test(phoneNumber))
  ) {
    throw new ValidationError("Email or phone number is required");
  }

  if (email && EMAIL_REGEX.test(email) === false) {
    throw new ValidationError("Invalid email address");
  }

  if (phoneNumber && PHONE_NUMBER_REGEX.test(phoneNumber) === false) {
    throw new ValidationError("Invalid phone number");
  }

  try {
    const emailDomain = email ? email.split("@")[1] : undefined;

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

    return contacts;
  } catch (error) {
    throw new DatabaseError("There was an issue with the database.");
  }
};

// Creates a new contact with the provided email and phone number
export const createContact = async (
  email: string | null,
  phoneNumber: string | null,
  linkedId: number | null
) => {
  if (!email && !phoneNumber) {
    throw new ValidationError("Email or phone number is required");
  }

  try {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: linkedId,
        linkPrecedence: linkedId ? "secondary" : "primary",
      },
    });
    return newContact;
  } catch (error) {
    throw new DatabaseError("There was an issue with the database.");
  }
};

// Updates the contact with the provided email and phone number
export const updateContact = async (
  contactId: number,
  email: string | null,
  phoneNumber: string | null
) => {
  if (!email && !phoneNumber) {
    throw new ValidationError("Email or phone number is required");
  }

  try {
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        email,
        phoneNumber,
      },
    });
    return updatedContact;
  } catch (error) {
    throw new DatabaseError("There was an issue with the database.");
  }
};

export const identifyContact = async (
  email: string | null,
  phoneNumber: string | null
) => {
  try {
    const contacts = await matchingContacts(email, phoneNumber);

    let primaryContact = contacts
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .find((c) => c.linkedId === null);

    if (!primaryContact && contacts.length > 0) {
      primaryContact = contacts[0];
    }

    if (!primaryContact) {
      const newContact = await createContact(email, phoneNumber, null);

      return {
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(Boolean),
        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
        secondaryContactIds: [],
      };
    }

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

    // If a new contact is introduced, create a secondary contact
    const emailIsNew = email && !existingEmails.has(email);
    const phoneNumberIsNew = phoneNumber && !existingPhones.has(phoneNumber);

    if (emailIsNew) {
      const existingContact = contacts.find(
        (c) => c.phoneNumber === phoneNumber
      );

      if (existingContact) {
        const newSecondary = await createContact(
          email,
          phoneNumber,
          primaryContact.id
        );
        secondaryContacts.push(newSecondary);
      }
    } else if (phoneNumberIsNew) {
      const existingContact = contacts.find((c) => c.email === email);

      if (existingContact) {
        const newSecondary = await createContact(
          email,
          phoneNumber,
          primaryContact.id
        );
        secondaryContacts.push(newSecondary);
      }
    }

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

    return response;
  } catch (error) {
    throw new DatabaseError("There was an issue with the database.");
  }
};
