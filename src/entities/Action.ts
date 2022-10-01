import { Snowflake } from 'discord.js';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize';
import { Rule } from './Rule';

type ActionType = 'warn' | 'kick' | 'ban' | 'timeout';

export class Action extends Model<InferAttributes<Action>, InferCreationAttributes<Action>> {
    declare id: CreationOptional<number>;
    declare discordId: Snowflake;
    
    declare rule: NonAttribute<Rule>;

    declare moderatorId: Snowflake;

    declare type: ActionType;
    declare duration: number;
}

export const initAction = (sequelize: Sequelize) => {
    Action.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        discordId: {
            type: DataTypes.STRING(64)
        },
        moderatorId: {
            type: DataTypes.STRING(64)
        },
        type: {
            type: DataTypes.STRING(64)
        },
        duration: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        tableName: 'actions'
    });
};

export const associateAction = (sequelize: Sequelize) => {
    Action.belongsToMany(Rule, {through: 'actions_rules'});
};
