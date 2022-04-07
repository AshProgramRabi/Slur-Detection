const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const natural = require('natural');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

function analysis(review) {
    const lexed = aposToLexForm(review);
    const lowerCased = lexed.toLowerCase();
    const alphaOnly = lowerCased.replace(/[^a-zA-Z\s]+/g, '');

    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenized = tokenizer.tokenize(alphaOnly);

    tokenized.forEach((word, index) => {
        tokenized[index] = spellCorrector.correct(word);
    });

    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(tokenized);

    return analysis;
}

client.once("ready", () =>  {
    console.log("Ready");
});

client.on("messageCreate", (message) => {
    if (!message.author.bot) {
        const msg = analysis(message.content);
        if (msg > 0) {
            message.reply({content: "good"});
        } else if (msg < 0) {
            message.reply({content: "bad"});
        }
    }
});

client.login(token);
