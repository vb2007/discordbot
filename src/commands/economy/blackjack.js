const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor, embedReplyWarningColor, embedReplyPrimaryColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return shuffle(deck);
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') aces++;
        value += getCardValue(card);
    }
    
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function formatCards(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join(' ');
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play a game of blackjack.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Roulette - Error",
                "You can only play roulette in a server.",
                interaction
            );
        }
        else {
            let isInteractionHandled = false;
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            const query = await db.query("SELECT balance, lastBlackjackTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = query[0]?.balance;

            const lastBlackjackTime = query[0]?.lastBlackjackTime;
            const nextApprovedBlackjackTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 8 * 60000); //8 minutes

            if (lastBlackjackTime >= nextApprovedBlackjackTimeUTC) {
                const remainingTimeInSeconds = Math.ceil((lastBlackjackTime.getTime() - nextApprovedBlackjackTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;

                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    `You've already played blackjack in the last 8 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **play blackjack** again.`,
                    interaction
                );
            }
            else if (userBalance < amount) {
                var embedReply = embedReplyFailureColor(
                    "Roulette - Error",
                    `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`,
                    interaction
                );
            }
            else if (amount <= 0) {
                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    "You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.",
                    interaction
                );
            }
            else {
                const deck = createDeck();
                const playerHand = [deck.pop(), deck.pop()];
                const dealerHand = [deck.pop(), deck.pop()];

                const hitButton = new ButtonBuilder()
                    .setCustomId("hit")
                    .setLabel("Hit")
                    .setStyle(ButtonStyle.Primary);
                
                const standButton = new ButtonBuilder()
                    .setCustomId("stand")
                    .setLabel("Stand")
                    .setStyle(ButtonStyle.Secondary);
                
                const row = new ActionRowBuilder().addComponents(hitButton, standButton);

                const embedReply = embedReplyPrimaryColor(
                    "Blackjack - New Game",
                    `Your hand: ${formatCards(playerHand)} (${calculateHandValue(playerHand)})\nDealer's hand: ${dealerHand[0].value}${dealerHand[0].suit} ??\nBet amount: $${amount}`,
                    interaction
                );

                const response = await interaction.reply({
                    embeds: [embedReply],
                    components: [row],
                    fetchReply: true
                });

                const collector = response.createMessageComponentCollector({ 
                    time: 30000 
                });

                collector.on("collect", async i => {
                    if (i.user.id !== interactionUserId) return;

                    if (i.customId == "hit") {
                        playerHand.push(deck.pop());
                        const playerValue = calculateHandValue(playerHand);

                        if (playerValue > 21) {
                            await handleGameEnd(i, playerHand, dealerHand, amount, "bust");
                            collector.stop();
                        }
                        else {
                            const updatedEmbed = embedReplySuccessColor(
                                "Blackjack - Hit",
                                `Your hand: ${formatCards(playerHand)} (${playerValue})\nDealer's hand: ${dealerHand[0].value}${dealerHand[0].suit} ??\nBet amount: $${amount}`,
                                interaction
                            );
                            await i.update({ embeds: [updatedEmbed], components: [row] });
                        }
                    }
                    else if (i.customId == "stand") {
                        while (calculateHandValue(dealerHand) < 17) {
                            dealerHand.push(deck.pop());
                        }
                        await handleGameEnd(i, playerHand, dealerHand, amount, "stand");
                        collector.stop();
                    }
                });

                async function handleGameEnd(i, playerHand, dealerHand, amount, reason) {
                    const playerValue = calculateHandValue(playerHand);
                    const dealerValue = calculateHandValue(dealerHand);
                    let result;
                    let winnings = 0;

                    if (reason === "bust") {
                        result = "You bust! Dealer wins.";
                        winnings = -amount;
                    }
                    else {
                        if (dealerValue > 21) {
                            result = "Dealer busts! You win!";
                            winnings = amount;
                        }
                        else if (playerValue > dealerValue) {
                            result = "You win!";
                            winnings = amount;
                        }
                        else if (playerValue < dealerValue) {
                            result = "Dealer wins!";
                            winnings = -amount;
                        }
                        else {
                            result = "Push! Tie game.";
                            winnings = 0;
                        }
                    }

                    await db.query(
                        "UPDATE economy SET balance = balance + ?, lastBlackjackTime = NOW() WHERE userId = ?",
                        [winnings, interactionUserId]
                    );

                    const finalEmbed = embedReplySuccessColor(
                        "Blackjack Game - Final",
                        `Your hand: ${formatCards(playerHand)} (${playerValue})\nDealer's hand: ${formatCards(dealerHand)} (${dealerValue})\n\n${result}\nNet change: $${winnings}`,
                        interaction
                    );

                    await i.update({ embeds: [finalEmbed], components: [] });
                    isInteractionHandled = true;
                }
            }
        }

        if (isInteractionHandled) {
            await interaction.reply({ embeds: [embedReply] });
            await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
        }
    }
}