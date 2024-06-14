const ContactModel = require("../models/contactModel");
const validator = require("validator");

const getCustomerData = async (contactObj) => {
  try {
    // Getting primary contact
    const primaryContact = await getPrimary(contactObj);

    // Getting all secondary contacts
    const secondaryContacts = await ContactModel.find({
      linkedId: primaryContact._id,
    });

    const emails = [
      ...(primaryContact.email ? [primaryContact.email] : []), // To remove null of primary contact
      ...new Set(
        secondaryContacts
          .map((contact) => contact.email)
          .filter((email) => email && email !== primaryContact.email)
      ), // To remove null, duplicate and primary emails
    ];

    const phoneNumbers = [
      ...(primaryContact.phoneNumber ? [primaryContact.phoneNumber] : []), // To remove null of primary contact
      ...new Set(
        secondaryContacts
          .map((contact) => contact.phoneNumber)
          .filter(
            (phoneNumber) =>
              phoneNumber && phoneNumber !== primaryContact.phoneNumber
          )
      ), // To remove null, duplicate and primary phone numbers
    ];

    // Getting all the secondary contact IDs
    const secondaryContactIds = secondaryContacts.map((contact) => contact._id);

    return {
      primaryContactId: primaryContact._id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const processWhenBothExistsSeparately = async (emailContact, phoneContact) => {
  try {
    // If one is primary and other is secondary of same primary -> get data
    // If both exits as secondary with same primary -> get data
    if (
      (emailContact?.linkPrecedence == "primary" &&
        phoneContact?.linkedId == emailContact?._id) ||
      (phoneContact?.linkPrecedence == "primary" &&
        emailContact?.linkedId == phoneContact?._id) ||
      (phoneContact?.linkedId &&
        emailContact?.linkedId &&
        emailContact?.linkedId == phoneContact?.linkedId)
    ) {
      return emailContact;
    }
    // If both exists as primary -> update the latest as secondary and all its secondary to new primary id -> get data
    // If one is primary and other is secondary of different primary -> find the primary -> update the latest as secondary and all its secondary to new primary id -> get data
    // If both exits as secondary with different primary -> find both primary -> update the latest as secondary and all its secondary to new primary id -> get data
    const [primaryEmailContact, primaryPhoneContact] = [
      await getPrimary(emailContact),
      await getPrimary(phoneContact),
    ];

    // Updating the primary recent created primary into secondary
    [primary, secondary] =
      primaryEmailContact?.createdAt < primaryPhoneContact?.createdAt
        ? [primaryEmailContact, primaryPhoneContact]
        : [primaryPhoneContact, primaryEmailContact];
    secondary.linkPrecedence = "secondary";
    secondary.linkedId = primary._id;

    await secondary.save();

    // Update all the old linked ids to new linked IDs
    await ContactModel.updateMany(
      { linkedId: secondary._id },
      { $set: { linkedId: primary._id } }
    );

    return primary;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Getting the primary contact of the contact provided
const getPrimary = async (doc) => {
  try {
    if (doc?.linkPrecedence == "primary") {
      return doc;
    } else {
      const primaryDoc = await ContactModel.findById(doc.linkedId);
      return primaryDoc;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

function validateEmail(email) {
  try {
    return validator.isEmail(email);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

function validatePhoneNumber(phoneNumber) {
  try {
    return validator.isMobilePhone(phoneNumber.toString(), "en-IN");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = {
  getCustomerData,
  processWhenBothExistsSeparately,
  validateEmail,
  validatePhoneNumber,
};
