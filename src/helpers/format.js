function capitalizeFirstLetter(string) {
  var stringWithCapitalizedFirstLetter =
    string.charAt(0).toUpperCase() + string.slice(1);
  return stringWithCapitalizedFirstLetter;
}

function formatRouletteColor(color) {
  switch (color) {
    case "red":
      return ":red_circle: Red";
    case "black":
      return ":black_circle: Black";
    case "green":
      return ":green_circle: Green";
    default:
      console.error(
        "The color you've provided for the formatRouletteColor() function is invalid.",
      );
  }
}

module.exports = {
  capitalizeFirstLetter,
  formatRouletteColor,
};
