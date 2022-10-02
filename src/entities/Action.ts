import { Snowflake } from 'discord.js';
import { BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManySetAssociationsMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize';
import { Rule } from './Rule';

export type ActionType = 'warn' | 'kick' | 'ban' | 'to';

export class Action extends Model<InferAttributes<Action>, InferCreationAttributes<Action>> {
    declare id: CreationOptional<number>;
    declare discordId: Snowflake;
    
    declare rule: NonAttribute<Rule>;

    declare moderatorId: Snowflake;

    declare type: ActionType;
    declare until: Date;
    declare unbanned: CreationOptional<boolean>;

    declare comment: CreationOptional<string>;
    declare publicComment: CreationOptional<string>;

    declare getRules: BelongsToManyGetAssociationsMixin<Rule>;
    declare setRules: BelongsToManySetAssociationsMixin<Rule, number>;
    declare addRules: BelongsToManyAddAssociationsMixin<Rule, number>;
    declare addRule: BelongsToManyAddAssociationMixin<Rule, number>;
    declare createRule: BelongsToManyCreateAssociationMixin<Rule>;
    declare removeRule: BelongsToManyRemoveAssociationMixin<Rule, number>;
    declare removeRules: BelongsToManyRemoveAssociationsMixin<Rule, number>;
    declare hasRule: BelongsToManyHasAssociationMixin<Rule, number>;
    declare hasRules: BelongsToManyHasAssociationsMixin<Rule, number>;
    declare countRules: BelongsToManyCountAssociationsMixin;
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
        until: {
            type: DataTypes.DATE
        },
        unbanned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        comment: {
            type: DataTypes.STRING(128),
            defaultValue: ''
        },
        publicComment: {
            type: DataTypes.STRING(128),
            defaultValue: ''
        },
    }, {
        sequelize,
        tableName: 'actions'
    });
};

export const associateAction = (sequelize: Sequelize) => {
    Action.belongsToMany(Rule, {through: 'actions_rules'});
};
