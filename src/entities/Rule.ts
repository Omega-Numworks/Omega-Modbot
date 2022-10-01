import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { Action } from './Action';

export class Rule extends Model<InferAttributes<Rule>, InferCreationAttributes<Rule>> {
  declare id: CreationOptional<number>;
  declare identifier: string;
  declare content: string;
}

export const initRule = (sequelize: Sequelize) => {
    Rule.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        identifier: {
            type: DataTypes.STRING(16)
        },
        content: {
            type: DataTypes.STRING(1024)
        },
    }, {
        sequelize,
        tableName: 'rules'
    });
};

export const associateRule = (sequelize: Sequelize) => {
  Rule.belongsToMany(Action, {through: 'actions_rules'});
};
