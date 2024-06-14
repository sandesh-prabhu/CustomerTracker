const addContact = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = addContact;
