import { EmbedBuilder } from "discord.js";
import config from "../../../config.json" with { type: "json" };

const { embedColors } = config;

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessage = (color, title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(color),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessageWithServerIcon = (color, title, description, guild) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(color),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
    footer: {
      text: `In: ${guild.name}`,
      icon_url: guild.iconURL({ dynamic: true }),
    },
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessagePrimaryColor = (title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.primary),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessageSuccessColor = (title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.success),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessageSuccessSecondaryColor = (title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.successSecondary),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessageFailureColor = (title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.failure),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
export const embedMessageWarningColor = (title, description) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.warning),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessageWithFields = (color, title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(color),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessagePrimaryColorWithFields = (title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.primary),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessageSuccessColorWithFields = (title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.success),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessageSuccessSecondaryColorWithFields = (title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.successSecondary),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessageFailureColorWithFields = (title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.failure),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
export const embedMessageWarningColorWithFields = (title, description, fields) => {
  const embedReply = new EmbedBuilder({
    color: parseInt(embedColors.warning),
    title: title,
    description: description,
    fields: fields,
    timestamp: new Date().toISOString(),
  });

  return embedReply;
};
