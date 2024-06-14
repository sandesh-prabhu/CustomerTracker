const ContactModel = require("../models/contactModel");
const validator = require("validator");

const getCustomerData = async (contactObj) => {
  try {
    // Getting primary contact
    let primaryContact;
    if (contactObj?.linkPrecedence == "primary") {
      primaryContact = contactObj;
    } else {
      primaryContact = await ContactModel.findById(contactObj.linkedId);
    }

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
