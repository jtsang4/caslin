import Feature from './feature';
import { UndefinedSubject, ALL_ENV } from './constants';
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

export namespace NDefiner {
  export type Can = InstanceType<typeof FeatureBuilder>['can'];

  export type Cannot = InstanceType<typeof FeatureBuilder>['cannot'];

  export type At = InstanceType<typeof FeatureBuilder>['at'];
}

export interface Definer {
  (can: NDefiner.Can, cannot: NDefiner.Cannot, at: NDefiner.At): Promise<any> | void;
}
export class FeatureBuilder {
  static define<D extends Definer>(definer: D): ReturnType<D> extends Promise<any> ? Promise<Feature> : Feature {
    const builder = new this();
    const result = definer(builder.can.bind(builder), builder.cannot.bind(builder), builder.at.bind(builder));

    const featureBuilder = () => new Feature(builder._rules);

    return result && typeof result.then === 'function' ? result.then(featureBuilder) : featureBuilder() as any;
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

  can(actions: string | string[], subject?: string): RuleBuilder {
    this.checkActionsParam(actions);
    if (!subject) {
      if (typeof actions !== 'string') {
        throw new TypeError('Caslin: expect action to be a string.');
      }
      return this._can(([] as string[]).concat(actions), UndefinedSubject, ALL_ENV);
    } else {
      return this._can(([] as string[]).concat(actions), subject, ALL_ENV);
    }
  }

  cannot(actions: string | string[], subject?: string): RuleBuilder {
    const ruleBuilder: RuleBuilder = this.can(actions, subject);
    ruleBuilder.rule.inverted = true;
    return ruleBuilder;
  }
}
