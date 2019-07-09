import React from 'react';
import { FeatureBuilder, Feature } from '@caslin/feature';
import { shallow } from 'enzyme';
import Env from '../Env';

let feature: Feature;

describe('Env', () => {
  beforeAll(() => {
    feature = FeatureBuilder.define((can, cannot, at) => {
      at('foo').can('read', 'Post');
    });
  });

  it('should not render children without any of "is" | "not" | "in" | "notIn" prop', function () {
    feature.setEnv('foo');
    const wrapper = shallow((
      <Env feature={feature}>
        <div>test</div>
      </Env>
    ));
    expect(wrapper.isEmptyRender()).toBe(true);
    feature.resetEnv();
  });

  describe('Is', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should render element children when match env', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when match env', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          {() => <div>test</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render element children when not match env', function () {
      const wrapper = shallow((
        <Env is="bar" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  describe('Not', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should render element children when match env', function () {
      const wrapper = shallow((
        <Env not="bar" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when match env', function () {
      const wrapper = shallow((
        <Env not="bar" feature={feature}>
          {() => <div>test</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render element children when not match env', function () {
      const wrapper = shallow((
        <Env not="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  describe('In', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should render element children when match env', function () {
      const wrapper = shallow((
        <Env in={['foo', 'bar']} feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when match env', function () {
      const wrapper = shallow((
        <Env in={['foo', 'bar']}  feature={feature}>
          {() => <div>test</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render element children when not match env', function () {
      const wrapper = shallow((
        <Env in={['bar', 'baz']}  feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  describe('NotIn', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should render element children when match env', function () {
      const wrapper = shallow((
        <Env notIn={['bar', 'baz']} feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should render function children when match env', function () {
      const wrapper = shallow((
        <Env notIn={['bar', 'baz']}  feature={feature}>
          {() => <div>test</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should not render element children when not match env', function () {
      const wrapper = shallow((
        <Env notIn={['foo', 'bar']}  feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  describe('PassThrough', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should render element children when with passThrough prop if env match', function () {
      const wrapper = shallow((
        <Env passThrough is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should always render element children when with passThrough prop even if env not match', function () {
      const wrapper = shallow((
        <Env passThrough is="bar" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should conditionally render function children when with passThrough prop if env match', function () {
      const wrapper = shallow((
        <Env passThrough is="foo" feature={feature}>
          {(match: boolean) => <div>{match ? 'can' : 'cannot'}</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>can</div>)).toBe(true);
    });

    it('should conditionally render function children when with passThrough prop if env not match', function () {
      const wrapper = shallow((
        <Env passThrough is="bar" feature={feature}>
          {(match: boolean) => <div>{match ? 'can' : 'cannot'}</div>}
        </Env>
      ));
      expect(wrapper.contains(<div>cannot</div>)).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  describe('Component lifecycle and methods', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should trigger forceUpdate() after update() feature rules', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      const instance = wrapper.instance();
      jest.spyOn(instance, 'forceUpdate');
      feature.update([]);
      expect(instance.forceUpdate).toBeCalledTimes(1);
    });

    it('should trigger connectToFeature() after componentDidUpdate() by changing of feature prop', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'connectToFeature');
      const newFeature = new Feature([]);
      wrapper.setProps({ feature: newFeature });
      expect(instance.connectToFeature).toBeCalledTimes(1);
    });

    it('should trigger connectToFeature() only one time if feature prop not change', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'connectToFeature');
      const _feature = instance._feature;
      wrapper.setProps({ env: 'bar' });
      expect(instance.connectToFeature).toBeCalledTimes(1);
      expect(instance._feature).toBe(_feature);
    });

    it('should throw Error when pass empty feature props', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      expect(() => {
        wrapper.setProps({ feature: null });
      }).toThrow();
    });

    it('should trigger unsubscribe() when componentWillUnmount', function () {
      const wrapper = shallow((
        <Env is="foo" feature={feature}>
          <div>test</div>
        </Env>
      ));
      const instance: any = wrapper.instance();
      jest.spyOn(instance, 'unsubscribe');
      wrapper.unmount();
      expect(instance.unsubscribe).toBeCalledTimes(1);
    });

    afterEach(() => {
      feature.resetEnv();
    });
  });

  afterAll(() => {
    feature = null!;
  });
});
