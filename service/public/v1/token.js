const cache = require('@cache');
const config = require('config');
const uuid = require('uuid/v4');

/**
 * The method to save token into the redis server
 * @param {object} tokens The token returned from the google server
 */
const saveToken = async (tokens) => {
    let client = new cache(config.get("redisUrl"));
    let userId = uuid();
    await client.setVal(userId, JSON.stringify(tokens));
    return {status: 'success', message: 'Logged in succesfully', data: userId};
}

/**
 * The method to fetch tokens for a user
 * @param {string} userId The user id
 */
const fetchToken = async (userId) => {
    let client = new cache(config.get("redisUrl"));
    let tokens = await client.getVal(userId);
    return {status: 'success', message: null, data: JSON.parse(tokens)};
}

module.exports = {
    fetchToken,
    saveToken
}
