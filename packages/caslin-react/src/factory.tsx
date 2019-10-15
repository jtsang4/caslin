import React from 'react';
import { Feature } from '@caslin/feature';
import Can, { Props as CanProps } from './Can';
import Env, { Props as EnvProps } from './Env';

export function createCanBoundTo(feature: Feature) {
  return class CanWithFeature extends React.PureComponent<Omit<CanProps, 'feature'>> {
    static displayName: string = 'CanWithFeature';
    render(): React.ReactNode {
      const {
        children,
        ...restProps
      } = this.props;
      return <Can feature={feature} {...restProps}>{children}</Can>;
    }
  };
}

export function createEnvBoundTo(feature: Feature) {
  return class EnvWithFeature extends React.PureComponent<Omit<EnvProps, 'feature'>> {
    static displayName: string = 'EnvWithFeature';
    render(): React.ReactNode {
      const {
        children,
        ...restProps
      } = this.props;
      return <Env feature={feature} {...restProps}>{children}</Env>;
    }
  };
}

export function createCheckerBoundTo(feature: Feature) {
  return {
    Can: createCanBoundTo(feature),
    Env: createEnvBoundTo(feature),
  };
}

export function createContextualCan(Consumer: React.Context<Feature>['Consumer']) {
  return class CanWithContextualFeature extends React.PureComponent<Omit<CanProps, 'feature'>> {
    static displayName: string = 'CanWithContextualFeature';
    render(): React.ReactNode {
      const {
        children,
        ...restProps
      } = this.props;
      return (
        <Consumer>{(feature: Feature) => <Can feature={feature} {...restProps}>{children}</Can>}</Consumer>
      );
    }
  };
}

export function createContextualEnv(Consumer: React.Context<Feature>['Consumer']) {
  return class EnvWithContextualFeature extends React.PureComponent<Omit<EnvProps, 'feature'>> {
    static displayName: string = 'EnvWithContextualFeature';
    render(): React.ReactNode {
      const {
        children,
        ...restProps
      } = this.props;
      return (
        <Consumer>{(feature: Feature) => <Env feature={feature} {...restProps}>{children}</Env>}</Consumer>
      );
    }
  };
}

export function createContextualChecker(Consumer: React.Context<Feature>['Consumer']) {
  return {
    Can: createContextualCan(Consumer),
    Env: createContextualEnv(Consumer),
  };
}
