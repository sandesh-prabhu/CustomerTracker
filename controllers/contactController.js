const ContactModel = require("../models/contactModel");
const {
  getCustomerData,
  processWhenBothExistsSeparately,
  validateEmail,
  validatePhoneNumber,
} = require("../services/contactService");

const addContact = async (req, res) => {
  try {
    const email = req?.body?.email?.toLowerCase();
    const phoneNumber = req?.body?.phoneNumber && Number(req.body.phoneNumber);
    // No valid Inputs
    if (!email && !phoneNumber) {
      return res.status(500).send({
        success: false,
        message: "Either Email or Phone Number is required",
      });
    }

    // Validate Email format
    if (email && !validateEmail(email)) {
      return res.status(500).send({
        success: false,
        message: "Email format is invalid. Eg: abc@example.com",
      });
    }
    // Validate Phone Number format
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return res.status(500).send({
        success: false,
        message: "Phone Number format is invalid. Eg: 9876543210",
      });
    }

    // If either email or phoneNumber, not both is provided in request
    if ((email && !phoneNumber) || (!email && phoneNumber)) {
      let contact;
      if (email) {
        contact = await ContactModel.findOne({ email });
      } else {
        contact = await ContactModel.findOne({ phoneNumber });
      }
      // Create a new contact if no existing data
      if (!contact) {
        contact = await new ContactModel({
          phoneNumber,
          email,
        }).save();
      }

      // Get required response data from the contact
      const data = await getCustomerData(contact);

      return res.send({
        success: true,
        message: "",
        contact: data,
      });
    }

    // Both email and phoneNumber exists in request
    else {
      // If both email and phoneNumber exists in single document -> get data
      let contact;
      contact = await ContactModel.findOne({ email, phoneNumber });
      if (contact) {
        const data = await getCustomerData(contact);
        return res.send({
          success: true,
          message: "",
          contact: data,
        });
      }

      // Get contact with the input email sorted by createdAt to get oldest record
      const emailContact = await ContactModel.findOne({ email }).sort({
        createdAt: 1,
      });
      // Get contact with the input phoneNumber sorted by createdAt to get oldest record
      const phoneNumberContact = await ContactModel.findOne({
        phoneNumber,
      }).sort({ createdAt: 1 });

      // If both doesnt even exists separtely -> create a primary -> get data
      if (!emailContact && !phoneNumberContact) {
        const contact = await new ContactModel({
          phoneNumber,
          email,
        }).save();

        const data = await getCustomerData(contact);
        return res.send({
          success: true,
          message: "",
          contact: data,
        });
      }

      // If one exists and other doesnt exists -> create a secondary -> get data
      if (
        (emailContact && !phoneNumberContact) ||
        (!emailContact && phoneNumberContact)
      ) {
        // Get Primary ID
        let linkedId;
        if (emailContact) {
          linkedId =
            emailContact?.linkPrecedence == "primary"
              ? emailContact._id
              : emailContact.linkedId;
        } else {
          linkedId =
            phoneNumberContact?.linkPrecedence == "primary"
              ? phoneNumberContact._id
              : phoneNumberContact.linkedId;
        }
        // Create secondary contact
        const contact = await new ContactModel({
          phoneNumber,
          email,
          linkedId,
          linkPrecedence: "secondary",
        }).save();

        const data = await getCustomerData(contact);
        return res.send({
          success: true,
          message: "",
          contact: data,
        });
      }

      // If both exists separately
      const processedDocument = await processWhenBothExistsSeparately(
        emailContact,
        phoneNumberContact
      );
      const data = await getCustomerData(processedDocument);

      return res.send({
        success: true,
        message: "",
        contact: data,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = addContact;
