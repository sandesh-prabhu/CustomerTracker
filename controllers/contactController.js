const ContactModel = require("../models/contactModel");
const {
  validateEmail,
  validatePhoneNumber,
  getCustomerData,
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
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = addContact;
