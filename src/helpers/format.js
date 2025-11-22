export const capitalizeFirstLetter = (string) => {
  var stringWithCapitalizedFirstLetter = string.charAt(0).toUpperCase() + string.slice(1);
  return stringWithCapitalizedFirstLetter;
};

export const formatRouletteColor = (color) => {
  switch (color) {
    case "red":
      return ":red_circle: Red";
    case "black":
      return ":black_circle: Black";
    case "green":
      return ":green_circle: Green";
    default:
      console.error("The color you've provided for the formatRouletteColor() function is invalid.");
  }
};

export const positionEmojis = {
  1: ":first_place:",
  2: ":second_place:",
  3: ":third_place:",
  4: ":number_4:",
  5: ":number_5:",
  6: ":number_6:",
  7: ":number_7:",
  8: ":number_8:",
  9: ":number_9:",
  10: ":number_10:",
};
