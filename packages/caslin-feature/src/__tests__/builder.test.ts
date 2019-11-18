import { FeatureBuilder, RuleBuilder } from '../builder';
import Feature from '../feature';

describe('Builder', function () {
  it('should get feature rules in DSL', function () {
    const feature = FeatureBuilder.define((can, cannot) => {
      can('read', 'Post');
      cannot('delete', 'Post');
    }) as Feature;
    expect(feature.rules).toEqual([
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', inverted: true, env: 'all' },
    ]);
  });

  it('should support multi actions passed in can(), cannot()', function () {
    const feature = FeatureBuilder.define((can, cannot) => {
      can(['read', 'update'], 'Post');
      cannot(['create', 'delete'], 'Post');
    }) as Feature;
    expect(feature.rules).toEqual([
      { actions: ['read', 'update'], subject: 'Post', env: 'all' },
      { actions: ['create', 'delete'], subject: 'Post', inverted: true, env: 'all' },
    ]);
  });

  it('should support set env before define rule by using at()', function () {
    const feature = FeatureBuilder.define((can, cannot, at) => {
      at('foo').can('read', 'Post');
      at('bar').cannot('delete', 'Post').because('Not author');
    }) as Feature;
    expect(feature.rules).toEqual([
      { actions: ['read'], subject: 'Post', env: 'foo' },
      { actions: ['delete'], subject: 'Post', inverted: true, reason: 'Not author', env: 'bar' },
    ]);
  });

  it('should get feature rules in DSL', function () {
    const feature = FeatureBuilder.define((can, cannot) => {
      can('read', 'Post');
      cannot('delete', 'Post');
    }) as Feature;
    expect(feature.rules).toEqual([
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', inverted: true, env: 'all' },
    ]);
  });

  it('should support async builder', async function () {
    const feature = await FeatureBuilder.define(async (can, cannot) => {
      can('read', 'Post');
      cannot('delete', 'Post');
    });
    expect(feature.rules).toEqual([
      { actions: ['read'], subject: 'Post', env: 'all' },
      { actions: ['delete'], subject: 'Post', inverted: true, env: 'all' },
    ]);
  });

  it('should throw TypeError when passing empty action', function () {
    expect(() => {
      FeatureBuilder.define((can) => {
        can(['read', true as any], 'Post');
      })
    }).toThrow();
  });

  describe('Check feature', () => {
    it('should return true if check allowed feature with can()', function () {
      const feature = FeatureBuilder.define((can) => {
        can('read', 'Post');
      }) as Feature;
      expect(feature.can('read', 'Post')).toBe(true);
    });

    it('should return true if check forbidden feature with cannot()', function () {
      const feature = FeatureBuilder.define((can, cannot) => {
        cannot('delete', 'Post');
      }) as Feature;
      expect(feature.cannot('delete', 'Post')).toBe(true);
    });

    it('should return false if check forbidden feature with can()', function () {
      const feature = FeatureBuilder.define((can, cannot) => {
        cannot('delete', 'Post');
      }) as Feature;
      expect(feature.can('delete', 'Post')).toBe(false);
    });

    it('should return false if check allowed feature with cannot()', function () {
      const feature = FeatureBuilder.define((can) => {
        can('read', 'Post');
      }) as Feature;
      expect(feature.cannot('read', 'Post')).toBe(false);
    });

    it('should return correct result if check undefined feature', function () {
      const feature = FeatureBuilder.define((can) => {
        can('read', 'Post');
      }) as Feature;
      expect(feature.can('delete', 'Post')).toBe(false);
      expect(feature.cannot('delete', 'Post')).toBe(true);
    });

    it('should support single action when omit subject', function () {
      const feature = FeatureBuilder.define((can) => {
        can('ReadPost');
      }) as Feature;
      expect(feature.can('ReadPost')).toBe(true);
      expect(feature.can('DeletePost')).toBe(false);
      expect(feature.cannot('DeletePost')).toBe(true);
    });
  });
});

describe('RuleBuilder', () => {
  it('should get rule when instanced RuleBuilder', function () {
    const rule = {
      actions: ['read'],
      subject: 'Post',
      env: 'all',
    };

    const result = new RuleBuilder(rule);
    expect(result.rule).toEqual({ actions: ['read'], subject: 'Post', env: 'all' });
  });

  it('should set reason correctly when calls because()', function () {
    const rule = {
      actions: ['read'],
      subject: 'Post',
      env: 'all',
    };

    const result = new RuleBuilder(rule);
    result.because('Forbidden reason');
    expect(result.rule).toEqual({ actions: ['read'], subject: 'Post', env: 'all', reason: 'Forbidden reason' });
  });
});
