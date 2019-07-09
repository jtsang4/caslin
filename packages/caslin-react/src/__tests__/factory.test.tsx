import React from 'react';
import { mount } from 'enzyme';
import { FeatureBuilder, Feature } from '@caslin/feature';
import {
  createCanBoundTo,
  createEnvBoundTo,
  createCheckerBoundTo,
  createContextualCan,
  createContextualEnv,
  createContextualChecker,
} from '../factory';

let feature: Feature;

describe.only('Factory', () => {
  beforeAll(() => {
    feature = FeatureBuilder.define((can, cannot, at) => {
      at('foo').can('read', 'Post');
      at('foo').cannot('create', 'Post');
    });
  });

  describe('createCanBoundTo', () => {
    it('should get a <Can> component with defined feature and render children element when feature is matched', function () {
      const Can = createCanBoundTo(feature);
      const wrapper = mount(
        <Can env="foo" action="read" subject="Post">
          <div>test</div>
        </Can>
      );
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should get a <Can> component with defined feature and not render children element when feature is not matched', function () {
      const Can = createCanBoundTo(feature);
      const wrapper = mount(
        <Can not env="foo" action="read" subject="Post">
          <div>test</div>
        </Can>
      );
      expect(wrapper.isEmptyRender()).toBe(true);
    });
  });

  describe('createEnvBoundTo', () => {
    beforeEach(() => {
      feature.setEnv('foo');
    });

    it('should get a <Env> component with defined feature and render children element when feature is matched', function () {
      const Env = createEnvBoundTo(feature);
      const wrapper = mount(
        <Env is="foo">
          <div>test</div>
        </Env>
      );
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should get a <Env> component with defined feature and not render children element when feature is not matched', function () {
      const Env = createEnvBoundTo(feature);
      const wrapper = mount(
        <Env in={['bar', 'baz']}>
          <div>test</div>
        </Env>
      );
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterEach(() => {
      feature.resetEnv();
    })
  });

  describe('createCheckerBoundTo', () => {
    it('should create <Can> and <Env> correctly', function () {
      const { Can, Env } = createCheckerBoundTo(feature);
      expect(Can).toBeTruthy();
      expect(Env).toBeTruthy();
    });
  });

  describe('createContextualCan', () => {
    let Context: React.Context<Feature>;
    beforeAll(() => {
      Context = React.createContext(null! as Feature);
    });

    it('should get a <Can> component with defined feature and render children element when feature is matched', function () {
      const Can = createContextualCan(Context.Consumer);
      const wrapper = mount(
        <Context.Provider value={feature}>
          <Can env="foo" action="read" subject="Post">
            <div>test</div>
          </Can>
        </Context.Provider>
      );
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should get a <Can> component with defined feature and not render children element when feature is not matched', function () {
      const Can = createContextualCan(Context.Consumer);
      const wrapper = mount(
        <Context.Provider value={feature}>
          <Can not env="foo" action="read" subject="Post">
            <div>test</div>
          </Can>
        </Context.Provider>
      );
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterAll(() => {
      Context = null!;
    });
  });

  describe('createContextualEnv', () => {
    let Context: React.Context<Feature>;
    beforeAll(() => {
      feature.setEnv('foo');
      Context = React.createContext(null! as Feature);
    });

    it('should get a <Env> component with defined feature and render children element when feature is matched', function () {
      const Env = createContextualEnv(Context.Consumer);
      const wrapper = mount(
        <Context.Provider value={feature}>
          <Env is="foo">
            <div>test</div>
          </Env>
        </Context.Provider>
      );
      expect(wrapper.contains(<div>test</div>)).toBe(true);
    });

    it('should get a <Env> component with defined feature and not render children element when feature is not matched', function () {
      const Env = createContextualEnv(Context.Consumer);
      const wrapper = mount(
        <Context.Provider value={feature}>
          <Env in={['bar', 'baz']}>
            <div>test</div>
          </Env>
        </Context.Provider>
      );
      expect(wrapper.isEmptyRender()).toBe(true);
    });

    afterAll(() => {
      feature.resetEnv();
      Context = null!;
    });
  });

  describe('createContextualChecker', () => {
    it('should create <Can> and <Env> correctly', function () {
      const Context = React.createContext(feature as Feature);
      const { Can, Env } = createContextualChecker(Context.Consumer);
      expect(Can).toBeTruthy();
      expect(Env).toBeTruthy();
    });
  });

  afterAll(() => {
    feature = null!;
  });
});
