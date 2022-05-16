module.exports = (sequelize, DataTypes) => {
	return sequelize.define('currency_shop', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
        itemid: DataTypes.STRING,
        price: DataTypes.INTEGER,
        description: DataTypes.STRING,
        longdescription: DataTypes.STRING,
        inshop: DataTypes.BOOLEAN,
        consumable: DataTypes.BOOLEAN,
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};