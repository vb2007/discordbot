//Function(s) used by the /roulette command
function generateRandomOutcome() {
    const rouletteNumbers = Array.from({ length: 37}, (_, index) => index + 1); //37 = european roulette. this might be configureable later.
    const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
    const number = rouletteNumbers[randomIndex]
    //green if number is 0, black if it's devideable by 2, red othervise 
    const color = number === 0 ? "green" : (number % 2 === 0 ? "black" : "red");
    return { number, color };
}

module.exports = {
    generateRandomOutcome
}