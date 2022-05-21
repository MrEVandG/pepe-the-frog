const Sequelize = require('sequelize');

/**@type {Sequelize.Sequelize} */
const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = require("./utils/items.json")
    shop.forEach(async item => {await CurrencyShop.upsert(item)})
    await Promise.all(shop)
    console.log('Database synced');
    await new Promise(resolve => setTimeout(resolve, 1000));
	await sequelize.close();
}).catch(console.error);