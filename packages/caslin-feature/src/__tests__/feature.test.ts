import Feature from '../feature';
import { PRIVATE_FIELD } from '../constants';

describe('Feature', () => {
  it('should have correct original rules after instantiation', function () {
    const rules = [
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
    ];

    const feature = new Feature(rules);
    expect(feature.rules).toEqual(rules);
  });

  it('should have empty array after instantiating with falsy value', function () {
    const feature = new Feature(undefined as any);
    expect(feature.rules).toEqual([]);
  });

  it('should have correct indexed rules after instantiation', function () {
    const rules = [
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
    ];

    const feature = new Feature(rules);
    expect(feature[PRIVATE_FIELD].indexedRules).toEqual({
      all: {
        'Post': {
          'read': {
            '0': { actions: ['read'], subject: 'Post', env: 'all' },
          },
          'delete': {
            '1': { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
          },
        },
      },
    });
  });

  it('should throw TypeError when checking empty action', function () {
    const rules = [
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', env: 'all' },
    ];

    const feature = new Feature(rules);
    expect(() => { feature.can(['read', 'delete', ''], 'Post'); }).toThrow();
  });

  describe('Checking', () => {
    it('should get true when checking defined feature', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all' },
      ];

      const feature = new Feature(rules);
      expect(feature.can(['read', 'delete'], 'Post')).toBe(true);
    });

    it('should get true when checking defined forbidden feature', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
      ];

      const feature = new Feature(rules);
      expect(feature.can('read', 'Post')).toBe(true);
      expect(feature.cannot('delete', 'Post')).toBe(true);
    });

    it('should get false when checking undefined action', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all' },
      ];

      const feature = new Feature(rules);
      expect(feature.can(['read', 'update'], 'Post')).toBe(false);
    });

    it('should get false when checking undefined subject', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all' },
      ];

      const feature = new Feature(rules);
      expect(feature.can(['read', 'delete'], 'Comment')).toBe(false);
    });

    it('should get false when checking unmatched env', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      expect(feature.can(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should get true when checking unspecified env in "all" env rules', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all' },
      ];

      const feature = new Feature(rules);
      expect(feature.at('test').can(['read', 'delete'], 'Post')).toBe(true);
      expect(feature.at('test').cannot(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should use specified env as default checking env after call setEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      feature.setEnv('test');
      expect(feature.can(['read', 'delete'], 'Post')).toBe(true);
      feature.resetEnv();
      expect(feature.can(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should get false after checking feature not at specified environment', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      expect(feature.at('foo').can(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should get true after checking feature at specified environment', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      expect(feature.at('test').can(['read', 'delete'], 'Post')).toBe(true);
    });

    it('should get false after checking feature not at specified environment even if setEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      feature.setEnv('test');
      expect(feature.at('foo').can(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should get false if feature is allowed at all env but forbidden at specific env ', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'test', inverted: true },
        { actions: ['delete'], subject: 'Post', env: 'test', inverted: true },
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all' },
      ];

      const feature = new Feature(rules);
      expect(feature.at('test').can(['read', 'delete'], 'Post')).toBe(false);
    });

    it('should get true if feature is forbidden at all env but allowed at specific env ', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all', inverted: true },
        { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
        { actions: ['read'], subject: 'Post', env: 'test' },
        { actions: ['delete'], subject: 'Post', env: 'test' },
      ];

      const feature = new Feature(rules);
      expect(feature.at('test').can(['read', 'delete'], 'Post')).toBe(true);
    });
  });

  describe('env', () => {
    it('should set correct environment after call setEnv() and resetEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
      ];

      const feature = new Feature(rules);
      feature.setEnv('test');
      expect(feature[PRIVATE_FIELD].currentEnvironment).toBe('test');
      feature.resetEnv();
      expect(feature[PRIVATE_FIELD].currentEnvironment).toBeFalsy();
    });

    it('should get correct checking result of environment after call setEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
        { actions: ['delete'], subject: 'Post', env: 'all', inverted: true },
      ];

      const feature = new Feature(rules);
      feature.setEnv('test');
      expect(feature.env.is('test')).toBe(true);
      expect(feature.env.not('test')).toBe(false);
      expect(feature.env.not('foo')).toBe(true);
      expect(feature.env.in(['test', 'foo'])).toBe(true);
      expect(feature.env.notIn(['foo', 'bar'])).toBe(true);
      expect(feature.env.notIn(['test', 'bar'])).toBe(false);
    });
  });

  describe('Events', () => {
    it('should call "updated" handler after update feature', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      feature.on('updated', spy);
      feature.update([]);
      expect(spy).toBeCalledTimes(1);
    });

    it('should call "updated" handler after setEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      feature.on('updated', spy);
      feature.setEnv('foo');
      expect(spy).toBeCalledTimes(1);
    });

    it('should call "updated" handler after resetEnv()', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      feature.on('updated', spy);
      feature.resetEnv();
      expect(spy).toBeCalledTimes(1);
    });

    it('should call every listener when emit event', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy1 = jest.fn();
      const spy2 = jest.fn();
      feature.on('updated', spy1);
      feature.on('updated', spy2);
      feature.update([]);
      expect(spy1).toBeCalledTimes(1);
      expect(spy2).toBeCalledTimes(1);
    });

    it('should call listener by using on() when emit event', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      feature.on('test', spy);
      feature.emit('test', 'payload');
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('payload');
    });

    it('should NOT call listener by using on() after unsubscription even if emit event', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      const unsubscribe = feature.on('test', spy);
      unsubscribe();
      feature.emit('test', 'payload');
      expect(spy).not.toBeCalled();
    });

    it('should only unsubscribe once even if call several times unsubscribe', function () {
      const rules = [
        { actions: ['read'], subject: 'Post', env: 'all' },
      ];
      const feature = new Feature(rules);
      const spy = jest.fn();
      const unsubscribe = feature.on('test', spy);
      expect(unsubscribe()).toBe(true);
      expect(unsubscribe()).toBe(false);
    });
  });
});
