import prisma from "../config/prisma";
import {
  EMAIL_REGEX,
  matchingEmailDomain,
  PHONE_NUMBER_REGEX,
} from "../utils/validations";

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
    throw new Error("Email or phone number is required");
  }

  if (email && EMAIL_REGEX.test(email) === false) {
    throw new Error("Invalid email address");
  }

  if (phoneNumber && PHONE_NUMBER_REGEX.test(phoneNumber) === false) {
    throw new Error("Invalid phone number");
  }

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
};

export const createContact = async (
  email: string | null,
  phoneNumber: string | null,
  linkedId: number | null
) => {
  if (!email && !phoneNumber) {
    throw new Error("Email or phone number is required");
  }

  const newContact = await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkedId: linkedId,
      linkPrecedence: linkedId ? "secondary" : "primary",
    },
  });
  return newContact;
};

export const updateContact = async (
  contactId: number,
  email: string | null,
  phoneNumber: string | null
) => {
  const updatedContact = await prisma.contact.update({
    where: { id: contactId },
    data: {
      email,
      phoneNumber,
    },
  });
  return updatedContact;
};

export const identifyContact = async (
  email: string | null,
  phoneNumber: string | null
) => {
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
  const secondaryContacts = contacts.filter((c) => c.id !== primaryContact.id);

  // If a new contact is introduced, create a secondary contact
  const existingEmails = new Set(contacts.map((c) => c.email).filter(Boolean));
  const existingPhones = new Set(
    contacts.map((c) => c.phoneNumber).filter(Boolean)
  );

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
};
