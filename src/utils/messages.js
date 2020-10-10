const generateMessage = (sender, text) => {
  return {
    sender,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (sender, url) => {
  return {
    sender,
    url,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  generateMessage,
  generateLocationMessage,
};
