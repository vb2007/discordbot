//Function(s) used by the /roulette command
function generateRandomOutcome() {
  const rouletteNumbers = Array.from({ length: 37 }, (_, index) => index); //0 to 36 for European roulette
  const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
  const number = rouletteNumbers[randomIndex];
  //green if number is 0, black if it's divisible by 2, red otherwise
  const color = number === 0 ? "green" : number % 2 === 0 ? "black" : "red";
  return { number, color };
}

module.exports = {
  generateRandomOutcome,
};
