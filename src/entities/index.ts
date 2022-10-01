// AUTO-GENERATED
// Run "yarn craft gen:entities" to update

import { Model, Sequelize } from 'sequelize';

import { Action, initAction, associateAction } from "./Action";
import { Rule, initRule, associateRule } from "./Rule";

export const initEntities = (sequelize: Sequelize) => {
    initAction(sequelize);
initRule(sequelize);
};

export const associateEntities = (sequelize: Sequelize) => {
    associateAction(sequelize);
associateRule(sequelize);
}

export const models: { new(): Model }[] = [
    Action,
    Rule
];
