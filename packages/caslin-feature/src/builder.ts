import Feature from './feature';
import { ALL_ENV } from './constants';
import { isStringOrNonEmptyArray } from './util';

export interface Rule {
  actions: string[];
  subject: string;
  env: string;
  inverted?: boolean;
  reason?: string;
}

export class RuleBuilder {
  rule: Rule;

  constructor(rule: Rule) {
    this.rule = rule;
  }

  because(reason: string) {
    this.rule.reason = reason;
  }
}

interface Definer {
  (can: InstanceType<typeof FeatureBuilder>['can'], cannot: InstanceType<typeof FeatureBuilder>['cannot'], at: InstanceType<typeof FeatureBuilder>['at']): Promise<any> | void;
}
export class FeatureBuilder {
  static define(definer: Definer) {
    const builder = new this();
    const result = definer(builder.can.bind(builder), builder.cannot.bind(builder), builder.at.bind(builder));

    const featureBuilder = () => new Feature(builder._rules);

    return result && typeof result.then === 'function' ? result.then(featureBuilder) : featureBuilder();
  }

  constructor() {
    this._rules = [];
  }

  private _rules: Rule[];

  private _can(actions: string[], subject: string, env: string) {
    const rule: Rule = { subject, actions, env };
    this._rules.push(rule);
    return new RuleBuilder(rule);
  }

  private checkActionsParam(actions: string | string[]) {
    if (!isStringOrNonEmptyArray(actions)) {
      throw new TypeError('The first argument of FeatureBuilder.define() should be action string or array of string of actions.')
    }
  }

  at(env: string) {
    const can = (actions: string | string[], subject: string) => {
      this.checkActionsParam(actions);
      return this._can(([] as string[]).concat(actions), subject, env);
    };
    const cannot = (actions: string | string[], subject: string) => {
      const ruleBuilder: RuleBuilder = can(actions, subject);
      ruleBuilder.rule.inverted = true;
      return ruleBuilder;
    };
    return { can, cannot };
  }

  can(actions: string | string[], subject: string): RuleBuilder {
    this.checkActionsParam(actions);
    return this._can(([] as string[]).concat(actions), subject, ALL_ENV);
  }

  cannot(actions: string | string[], subject: string): RuleBuilder {
    const ruleBuilder: RuleBuilder = this.can(actions, subject);
    ruleBuilder.rule.inverted = true;
    return ruleBuilder;
  }
}
