import React from 'react';
import { FeatureBuilder, Feature } from '@caslin/feature';
import { shallow } from 'enzyme';
import Can from '../Can';

let feature: Feature;

describe('Can', () => {
  beforeAll(() => {
    feature = FeatureBuilder.define((can, cannot, at) => {
      at('foo').can('read', 'Post');
      at('foo').can('update', 'Post');
      at('foo').cannot('create', 'Post');
      at('foo').cannot('delete', 'Post');

      can('read', 'Post');
      can('create', 'Post');
      cannot('update', 'Post');
      cannot('delete', 'Post');
    });
  });

  describe('Basic Usage', () => {
    it('should render element children when check allowed feature with Can', function () {
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when check allowed feature with Can', function () {
      const wrapper = shallow((
        <Can env="foo" action="update" subject="Post" feature={feature}>
          {() => <div>test</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render element children when check multiple allowed features with Can', function () {
      const wrapper = shallow((
        <Can env="foo" action={['read', 'update']} subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render children when check forbidden feature with Can', function () {
      const wrapper = shallow((
        <Can env="foo" action="create" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    it('should render fallback element when check forbidden feature with Can', function () {
      const wrapper = shallow((
        <Can env="foo" action="create" subject="Post" feature={feature} fallback="fallback element">
          <div>test</div>
        </Can>
      ));
      expect(wrapper.text()).toBe('fallback element');
    });

    it('should render element children when check forbidden feature with prop "not"', function () {
      const wrapper = shallow((
        <Can not env="foo" action="create" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when check forbidden feature with prop "not"', function () {
      const wrapper = shallow((
        <Can not env="foo" action="delete" subject="Post" feature={feature}>
          {() => <div>test</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render element children when check multiple forbidden features with prop "not"', function () {
      const wrapper = shallow((
        <Can not env="foo" action={['create', 'delete']} subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render children when check allowed feature with prop "not"', function () {
      const wrapper = shallow((
        <Can not env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    it('should render fallback element when check allowed feature with prop "not"', function () {
      const wrapper = shallow((
        <Can not env="foo" action="read" subject="Post" feature={feature} fallback="fallback element">
          <div>test</div>
        </Can>
      ));
      expect(wrapper.text()).toBe('fallback element');
    });
  });

  describe('Without env prop', () => {
    it('should render element children when check allowed feature with Can at default env', function () {
      const wrapper = shallow((
        <Can action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when check allowed feature with Can at default env', function () {
      const wrapper = shallow((
        <Can action="create" subject="Post" feature={feature}>
          {() => <div>test</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render element children when check multiple allowed feature with Can at default env', function () {
      const wrapper = shallow((
        <Can action={['read', 'create']} subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render children when check forbidden feature with Can at default env', function () {
      const wrapper = shallow((
        <Can action="update" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    it('should render element children when check forbidden feature with prop "not" at default env', function () {
      const wrapper = shallow((
        <Can not action="update" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when check forbidden feature with prop "not" at default env', function () {
      const wrapper = shallow((
        <Can not action="delete" subject="Post" feature={feature}>
          {() => <div>test</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render element children when check multiple forbidden features with prop "not" at default env', function () {
      const wrapper = shallow((
        <Can not action={['update', 'delete']} subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render children when check allowed feature with prop "not" at default env', function () {
      const wrapper = shallow((
        <Can not action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });
  });

  describe('With passThrough prop', () => {
    it('should always render element children when check allowed feature with passThrough prop', function () {
      const wrapper = shallow((
        <Can passThrough env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should always render element children when check forbidden feature with passThrough prop', function () {
      const wrapper = shallow((
        <Can passThrough env="foo" action="create" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should conditionally render function children when check allowed feature with passThrough prop', function () {
      const wrapper = shallow((
        <Can passThrough env="foo" action="read" subject="Post" feature={feature}>
          {(allowed: boolean) => <div>{allowed ? 'can' : 'cannot'}</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>can</div>)).toBe(true);
    });

    it('should conditionally render function children when check forbidden feature with passThrough prop', function () {
      const wrapper = shallow((
        <Can passThrough env="foo" action="create" subject="Post" feature={feature}>
          {(allowed: boolean) => <div>{allowed ? 'can' : 'cannot'}</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>cannot</div>)).toBe(true);
    });

    it('should conditionally render function children when check forbidden feature with passThrough and not prop', function () {
      const wrapper = shallow((
        <Can not passThrough env="foo" action="create" subject="Post" feature={feature}>
          {(allowed: boolean) => <div>{allowed ? 'can' : 'cannot'}</div>}
        </Can>
      ));
      expect(wrapper.contains(<div>can</div>)).toBe(true);
    });
  });

  describe('setEnv()', () => {
    let feature: Feature;
    beforeAll(() => {
      feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('update', 'Post');
        at('foo').cannot('create', 'Post');
        at('bar').cannot('update', 'Post');
        at('bar').can('create', 'Post');

        can('create', 'Post');
        cannot('update', 'Post');
      });
      feature.setEnv('foo');
    });

    it('should render children when check allowed feature at default env', function () {
      const wrapper = shallow((
        <Can action="update" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render children when check forbidden feature at default env with prop "not"', function () {
      const wrapper = shallow((
        <Can not action="create" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render children when check allowed feature at specific dev', function () {
      const wrapper = shallow((
        <Can env="bar" action="create" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render children when check forbidden feature at specific dev', function () {
      const wrapper = shallow((
        <Can not env="bar" action="update" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    afterAll(() => {
      feature = null!;
    });
  });

  describe('Component lifecycle and methods', () => {
    it('should trigger forceUpdate() after update() feature rules', function () {
      const feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('read', 'Post');
        at('foo').cannot('delete', 'Post');
        can('create', 'Post');
        cannot('update', 'Post');
      });
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      const instance = wrapper.instance();
      jest.spyOn(instance, 'forceUpdate');
      feature.update([]);
      expect(instance.forceUpdate).toBeCalledTimes(1);
    });

    it('should trigger connectToFeature() after componentDidUpdate() by changing of feature prop', function () {
      const feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('read', 'Post');
        at('foo').cannot('delete', 'Post');
        can('create', 'Post');
        cannot('update', 'Post');
      });
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'connectToFeature');
      const newFeature = new Feature([]);
      wrapper.setProps({ feature: newFeature });
      expect(instance.connectToFeature).toBeCalledTimes(1);
    });

    it('should trigger connectToFeature() only one time if feature prop not change', function () {
      const feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('read', 'Post');
        at('foo').cannot('delete', 'Post');
        can('create', 'Post');
        cannot('update', 'Post');
      });
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'connectToFeature');
      const _feature = instance._feature;
      wrapper.setProps({ env: 'bar' });
      expect(instance.connectToFeature).toBeCalledTimes(1);
      expect(instance._feature).toBe(_feature);
    });

    it('should throw Error when pass empty feature props', function () {
      const feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('read', 'Post');
        at('foo').cannot('delete', 'Post');
        can('create', 'Post');
        cannot('update', 'Post');
      });
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      const errorLog = global.console.error;
      global.console.error = jest.fn();
      expect(() => {
        wrapper.setProps({ feature: null });
      }).toThrow();
      global.console.error = errorLog;
    });

    it('should trigger unsubscribe() when componentWillUnmount', function () {
      const feature = FeatureBuilder.define((can, cannot, at) => {
        at('foo').can('read', 'Post');
        at('foo').cannot('delete', 'Post');
        can('create', 'Post');
        cannot('update', 'Post');
      });
      const wrapper = shallow((
        <Can env="foo" action="read" subject="Post" feature={feature}>
          <div>test</div>
        </Can>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'unsubscribe');
      wrapper.unmount();
      expect(instance.unsubscribe).toBeCalledTimes(1);
    });
  });

  afterAll(() => {
    feature = null!;
  });
});
