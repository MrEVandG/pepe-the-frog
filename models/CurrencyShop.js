const sequelize = require("sequelize")
/**
 * @param {sequelize.Sequelize} sequelize 
 * @param {sequelize.DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('currency_shop', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        item_id: DataTypes.STRING,
        price: { type: DataTypes.INTEGER, allowNull: true },
        description: DataTypes.STRING,
        longdescription: DataTypes.STRING,
        inshop: DataTypes.BOOLEAN,
        consumable: DataTypes.BOOLEAN,
        emoji: DataTypes.STRING,
    }, {
        timestamps: false,
    });
};