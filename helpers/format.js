function capitalizeFirstLetter(string) {
    var stringWithCapitalizedFirstLetter = string.charAt(0).toUpperCase() + string.slice(1);
    return stringWithCapitalizedFirstLetter;
}

function formatRouletteColor(color) {
    switch(color){
        case "red":
            return ":red_square: Red"
        case "black":
            return ":black_square: Black"
        case "green":
            return ":green_square: Green"
    }
}