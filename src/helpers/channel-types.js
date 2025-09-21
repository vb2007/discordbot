module.exports = {
  getChannelType(channel) {
    switch (channel.type) {
      case 0:
        return "Text";
      case 2:
        return "Voice";
      case 15:
        return "Forum";
      case 5:
        return "Announcement";
      case 13:
        return "Stage";
    }
  },
};
