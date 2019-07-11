import { Rule } from './builder';
import { ALL_ENV, PRIVATE_FIELD } from './constants';

export interface PrivateField {
  originalRules: Rule[] | Readonly<Rule[]>;
  currentEnvironment: string;
  indexedRules: {
    [env: string]: {
      [subject: string]: {
        [action: string]: {
          [order: number]: Rule;
        };
      };
    }
  };
  resultRuleCache: { [key: string]: Rule[]; };
  events: { [event: string]: Function[]; };
}

export namespace NFeature {
  export type Env = InstanceType<typeof Feature>['env'];
  export type Is = InstanceType<typeof Feature>['_is']
  export type Not = InstanceType<typeof Feature>['_is']
  export type In = InstanceType<typeof Feature>['_in']
  export type NotIn = InstanceType<typeof Feature>['_in']

  export type Update = InstanceType<typeof Feature>['update'];

  export type SetEnv = InstanceType<typeof Feature>['setEnv'];
  export type ReSetEnv = InstanceType<typeof Feature>['resetEnv'];

  export type Can = InstanceType<typeof Feature>['can'];
  export type CanNot = InstanceType<typeof Feature>['cannot'];
  export type At = InstanceType<typeof Feature>['at'];

  export type On = InstanceType<typeof Feature>['on'];
  export type Emit = InstanceType<typeof Feature>['emit'];
}

export default class Feature {
  private [PRIVATE_FIELD]: PrivateField;

  constructor(rules: Rule[]) {
    this[PRIVATE_FIELD] = {
      originalRules: rules || [],
      currentEnvironment: '',
      indexedRules: Object.create(null),
      resultRuleCache: Object.create(null),
      events: Object.create(null),
    };

    this.update(rules || []);
  }

  get currentValue(): string {
    return this[PRIVATE_FIELD].currentEnvironment;
  }

  get rules() {
    return this[PRIVATE_FIELD].originalRules;
  }

  get env() {
    return {
      is: this._is.bind(this),
      not: (env: string) => {
        return !this._is.call(this, env);
      },
      in: this._in.bind(this),
      notIn: (envs: string[]) => {
        return !this._in.call(this, envs);
      },
      value: this.currentValue,
    };
  }

  private _is(env: string): boolean {
    return this[PRIVATE_FIELD].currentEnvironment === env;
  }

  private _in(envs: string[]): boolean {
    return envs.includes(this[PRIVATE_FIELD].currentEnvironment);
  }

  private _buildIndexedRules(rules: Rule[]): PrivateField['indexedRules'] {
    const indexedRules: PrivateField['indexedRules'] = Object.create(null);

    let isAllInverted: boolean = true;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const { actions, subject, env, inverted } = rule;
      const priority: number = i;

      isAllInverted = !!(isAllInverted && inverted);

      for (let action of actions) {
        indexedRules[env] = indexedRules[env] || Object.create(null);
        indexedRules[env][subject] = indexedRules[env][subject] || Object.create(null);
        indexedRules[env][subject][action] = indexedRules[env][subject][action] || Object.create(null);
        indexedRules[env][subject][action][priority] = rule;
      }
    }

    if (process.env.NODE_ENV !== 'production' && isAllInverted && rules.length) {
      console.warn('[Caslin]: Feature contains only inverted rules. That means user will not be able to do any actions.')
    }

    return indexedRules;
  }

  private _cachedRulesFor(action: string, subject: string, env: string): Rule[] {
    const { indexedRules } = this[PRIVATE_FIELD];
    const rules: { [key: number]: Rule } = indexedRules[env][subject][action];
    return Object.assign([], rules).filter(rule => !!rule);
  }

  private _rulesFor(actions: string[], subject: string, env: string): Rule[] {
    let resultRule: Rule[] = [];
    const { indexedRules, resultRuleCache } = this[PRIVATE_FIELD];
    if (indexedRules[env] && indexedRules[env][subject]) {
      for (let action of actions) {
        if (indexedRules[env][subject][action]) {
          const key: string = `${env}__${subject}__${action}`;
          if (!resultRuleCache[key]) {
            resultRuleCache[key] = this._cachedRulesFor(action, subject, env);
          }
          resultRule = resultRule.concat(resultRuleCache[key]);
        } else {
          resultRule = [];
          break;
        }
      }
    } else {
      resultRule = [];
    }

    return resultRule;
  }

  private _can(actions: string[], subject: string, env: string) {
    const relevantRules: Rule[] = this._rulesFor(actions, subject, env);
    return {
      allowed: !!relevantRules && !!relevantRules.length && relevantRules.every(rule => !rule.inverted),
      forbidden: !!relevantRules && !!relevantRules.length && relevantRules.some(rule => rule.inverted),
    }
  }

  private _checkActions(actions: string | string[]) {
    const wrappedActions = ([] as string[]).concat(actions);
    if (wrappedActions.some(action => typeof action !== 'string' || !action)) {
      throw new TypeError('Caslin: expect every action passed in should be a non-empty string');
    }
  }

  update(rules: Rule[]) {
    this[PRIVATE_FIELD].originalRules = Object.freeze(rules.slice(0));
    this[PRIVATE_FIELD].indexedRules = this._buildIndexedRules(rules);
    this[PRIVATE_FIELD].resultRuleCache = Object.create(null);
    this.emit('updated', this);
  }

  setEnv(env: string) {
    this[PRIVATE_FIELD].currentEnvironment = env;
    this.emit('updated', this);
    return this;
  }

  resetEnv() {
    this.setEnv('');
    return this;
  }

  can(actions: string | string[], subject: string) {
    const { currentEnvironment } = this[PRIVATE_FIELD];
    const wrappedActions = ([] as string[]).concat(actions);
    this._checkActions(wrappedActions);
    return this._can(wrappedActions, subject, currentEnvironment || ALL_ENV).allowed;
  }

  cannot(actions: string | string[], subject: string) {
    return !this.can(actions, subject);
  }

  at(env: string) {
    const can = (actions: string | string[], subject: string) => {
      const wrappedActions = ([] as string[]).concat(actions);
      this._checkActions(wrappedActions);
      const result = this._can(wrappedActions, subject, env);
      return result.allowed || (!result.forbidden && this._can(wrappedActions, subject, ALL_ENV).allowed);
    };
    const cannot = (actions: string | string[], subject: string) => {
      return !can(actions, subject);
    };
    return { can, cannot };
  }

  on(event: string, handler: Function) {
    const { events } = this[PRIVATE_FIELD];
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(handler);
    let isAttached = true;

    return () => {
      if (isAttached) {
        const index = events[event].indexOf(handler);
        events[event].splice(index, 1);
        isAttached = false;
        return true;
      }
      return false;
    };
  }

  emit(event: string, payload: any) {
    const { events } = this[PRIVATE_FIELD];
    const handlers = events[event];

    if (handlers) {
      handlers.slice(0).forEach(handler => handler(payload));
    }
  }
}
