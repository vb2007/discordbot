import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import {
  embedReplySuccessColorWithFields,
  embedReplyFailureColorWithFields,
  embedReplyWarningColorWithFields,
  embedReplyPrimaryColorWithFields,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import {
  checkCooldown,
  checkBalanceAndBetAmount,
} from "../../helpers/command-validation/economy.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "blackjack";

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
};

const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getCardValue = (card) => {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === "A") aces++;
    value += getCardValue(card);
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

const formatCards = (hand) => {
  return hand.map((card) => `${card.value}${card.suit}`).join(" ");
};

const updateBalance = async (won, amount, interactionUserId) => {
  switch (won) {
    case true:
      await query(
        "UPDATE economy SET balance = balance + ?, lastBlackjackTime = ? WHERE userId = ?",
        [amount, new Date().toISOString().slice(0, 19).replace("T", " "), interactionUserId]
      );
      break;
    case false:
      await query(
        "UPDATE economy SET balance = balance - ?, lastBlackjackTime = ? WHERE userId = ?",
        [amount, new Date().toISOString().slice(0, 19).replace("T", " "), interactionUserId]
      );
      break;
    default:
      throw new Error("Invalid parameter: won must be true or false");
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Play a game of blackjack.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you would like to play with.")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const interactionUserId = interaction.user.id;
    const amount = interaction.options.getInteger("amount");

    const balanceCheck = await checkBalanceAndBetAmount(commandName, interaction, amount);
    if (balanceCheck) {
      return await replyAndLog(interaction, balanceCheck);
    }

    const cooldownCheck = await checkCooldown(commandName, interaction);
    if (cooldownCheck) {
      return await replyAndLog(interaction, cooldownCheck);
    }

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
        {
          name: "Your hand",
          value: `${formatCards(playerHand)} **(${calculateHandValue(playerHand)})** ??`,
        },
        { name: "Dealer's hand", value: `${dealerHand[0].value}${dealerHand[0].suit} ??` },
      ],
      interaction
    );

    const response = await interaction.reply({
      embeds: [embedReply],
      components: [row],
      fetchReply: true,
    });

    const collector = response.createMessageComponentCollector({
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interactionUserId) return;

      if (i.customId == "hit") {
        playerHand.push(deck.pop());
        const playerValue = calculateHandValue(playerHand);

        if (playerValue > 21) {
          await handleGameEnd(i, playerHand, dealerHand, amount, "bust");
          collector.stop();
        } else {
          const updatedEmbed = embedReplyPrimaryColorWithFields(
            "Blackjack - Hit",
            `Bet amount: \`$${amount}\``,
            [
              { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
              { name: "Dealer's hand", value: `${dealerHand[0].value}${dealerHand[0].suit} ??` },
            ],
            interaction
          );

          await i.update({ embeds: [updatedEmbed], components: [row] });
        }
      } else if (i.customId == "stand") {
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
          "Blackjack - Results",
          "You bust! Dealer wins.",
          [
            { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
            { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**` },
            { name: "You've lost", value: `\`$${amount}\`` },
          ],
          interaction
        );
      } else {
        if (dealerValue > 21) {
          updateBalance(true, amount, interactionUserId);

          var finalEmbed = embedReplySuccessColorWithFields(
            "Blackjack - Results",
            "Dealer busts! You won!",
            [
              { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
              { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**` },
              { name: "You won", value: `\`$${amount}\`` },
            ],
            interaction
          );
        } else if (playerValue > dealerValue) {
          updateBalance(true, amount, interactionUserId);

          var finalEmbed = embedReplySuccessColorWithFields(
            "Blackjack - Results",
            "You won!",
            [
              { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
              { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**` },
              { name: "You won", value: `\`$${amount}\`` },
            ],
            interaction
          );
        } else if (playerValue < dealerValue) {
          updateBalance(false, amount, interactionUserId);

          var finalEmbed = embedReplyFailureColorWithFields(
            "Blackjack - Results",
            "Dealer won!",
            [
              { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
              { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**` },
              { name: "You've lost", value: `\`$${amount}\`` },
            ],
            interaction
          );
        } else {
          var finalEmbed = embedReplyWarningColorWithFields(
            "Blackjack - Results",
            "Push! Tie game.",
            [
              { name: "Your hand", value: `${formatCards(playerHand)} **(${playerValue})**` },
              { name: "Dealer's hand", value: `${formatCards(dealerHand)} **(${dealerValue})**` },
              { name: "Tie game", value: "Your balance stays the same." },
            ],
            interaction
          );
        }
      }

      await i.update({ embeds: [finalEmbed], components: [] });
      await logToFileAndDatabase(interaction, JSON.stringify(finalEmbed.toJSON()));
    }
  },
};
