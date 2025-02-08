const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { embedReplySuccessColorWithFields, embedReplyFailureColor, embedReplyFailureColorWithFields, embedReplyWarningColorWithFields, embedReplyPrimaryColorWithFields } = require("../../helpers/embeds/embed-reply");
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

async function updateBalance(won, amount, interactionUserId) {
    switch (won) {
        case true:
            await db.query(
                "UPDATE economy SET balance = balance + ?, lastBlackjackTime = ? WHERE userId = ?",
                [
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    interactionUserId
                ]
            );
            break;
        case false:
            await db.query(
                "UPDATE economy SET balance = balance - ?, lastBlackjackTime = ? WHERE userId = ?",
                [
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    interactionUserId
                ]
            );
            break;
        default:
            throw new Error('Invalid parameter: won must be true or false');
    }
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
        let isResponseDefined = false;
        
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Blackjack - Error",
                "You can only play blackjack in a server.",
                interaction
            );
            isResponseDefined = true;
        }
        else {
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
                isResponseDefined = true;
            }
            else if (userBalance < amount) {
                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`,
                    interaction
                );
                isResponseDefined = true;
            }
            else if (amount <= 0) {
                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    `You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`,
                    interaction
                );
                isResponseDefined = true;
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

                const embedReply = embedReplyPrimaryColorWithFields(
                    "Blackjack - New Game",
                    `Bet amount: \`$${amount}\``,
                    [
                        { name: "Your hand", value: `${formatCards(playerHand)} **(${calculateHandValue(playerHand)})** ??`},
                        { name: "Dealer's hand", value: `${dealerHand[0].value}${dealerHand[0].suit} ??`}
                    ],
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
                            const updatedEmbed = embedReplyPrimaryColorWithFields(
                                "Blackjack - Hit",
                                `Bet amount: \`$${amount}\``,
                                [
                                    { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                    { name: "Dealer's hand", value: `${dealerHand[0].value}${dealerHand[0].suit} ??`}
                                ],
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

                    if (reason === "bust") {
                        updateBalance(false, amount, interactionUserId);

                        var finalEmbed = embedReplyFailureColorWithFields(
                            "Blackjack Game - Results",
                            "You bust! Dealer wins.",
                            [
                                { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**`},
                                { name: "You've lost", value: `\`$${amount}\``}
                            ],
                            interaction
                        );
                    }
                    else {
                        if (dealerValue > 21) {
                            updateBalance(true, amount, interactionUserId);

                            var finalEmbed = embedReplySuccessColorWithFields(
                                "Blackjack - Results",
                                "Dealer busts! You won!",
                                [
                                    { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                    { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**`},
                                    { name: "You won", value: `\`$${amount}\``}
                                ],
                                interaction
                            );
                        }
                        else if (playerValue > dealerValue) {
                            updateBalance(true, amount, interactionUserId);

                            var finalEmbed = embedReplySuccessColorWithFields(
                                "Blackjack Game - Results",
                                "You won!",
                                [
                                    { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                    { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**`},
                                    { name: "You won", value: `\`$${amount}\``}
                                ],
                                interaction
                            );
                        }
                        else if (playerValue < dealerValue) {
                            updateBalance(false, amount, interactionUserId);

                            var finalEmbed = embedReplyFailureColorWithFields(
                                "Blackjack Game - Results",
                                "Dealer won!",
                                [
                                    { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                    { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**`},
                                    { name: "You've lost", value: `\`$${amount}\``}
                                ],
                                interaction
                            );
                        }
                        else {
                            var finalEmbed = embedReplyWarningColorWithFields(
                                "Blackjack Game - Results",
                                "Push! Tie game.",
                                [
                                    { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**`},
                                    { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**`},
                                    { name: "Tie game", value: "Your balance stays the same."}
                                ],
                                interaction
                            );
                        }
                    }

                    await i.update({ embeds: [finalEmbed], components: [] });
                    await logToFileAndDatabase(interaction, JSON.stringify(finalEmbed.toJSON()));
                }
            }
        }

        if (isResponseDefined) {
            await interaction.reply({ embeds: [embedReply] });
            await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
        }
    }
}