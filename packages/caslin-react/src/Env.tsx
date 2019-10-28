import React from 'react';
import PropTypes from 'prop-types';
import { Feature } from '@caslin/feature';

export interface RenderChildren {
  (): React.ReactNode;
  (can: boolean): React.ReactNode;
  (can: boolean, feature: Feature): React.ReactNode;
}

export interface Props {
  feature: Feature;
  is?: string;
  not?: string;
  in?: string[];
  notIn?: string[];
  passThrough?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode | RenderChildren ;
}

export default class Env extends React.PureComponent<Props> {
  static propTypes = {
    feature: PropTypes.instanceOf(Feature).isRequired,
    is: PropTypes.string,
    not: PropTypes.string,
    in: PropTypes.arrayOf(PropTypes.string),
    notIn: PropTypes.arrayOf(PropTypes.string),
    passThrough: PropTypes.bool,
    fallback: PropTypes.any,
    children: PropTypes.any.isRequired,
  };

  unsubscribe: ReturnType<Feature['on']> = undefined!;
  private _feature: Feature = undefined!;

  componentDidMount(): void {
    this.connectToFeature(this.props.feature);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    this.connectToFeature(this.props.feature);
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  isAllowed(): boolean {
    const { feature } = this.props;
    switch (true) {
      case !!this.props.is:
        return feature.env.is(this.props.is!);
      case !!this.props.not:
        return feature.env.not(this.props.not!);
      case !!this.props.in:
        return feature.env.in(this.props.in!);
      case !!this.props.notIn:
        return feature.env.notIn(this.props.notIn!);
      default:
        return false;
    }
  }

  connectToFeature(feature: Feature) {
    if (feature === this._feature) {
      return;
    }

    this._feature = feature;
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    if (feature) {
      this.unsubscribe = feature.on('updated', () => this.forceUpdate());
    } else {
      throw new TypeError('@caslin/react: "feature" prop must be provided to <Env>.')
    }
  }

  renderAllow(): React.ReactNode {
    const { children } = this.props;
    return typeof children === 'function' ? (children as RenderChildren)() : children;
  }

  renderPassThrough(): React.ReactNode {
    const { children, feature } = this.props;
    const isAllowed = this.isAllowed();
    return typeof children === 'function' ? (children as RenderChildren)(isAllowed, feature) : children;
  }

  render(): React.ReactNode {
    const { passThrough, fallback = null } = this.props;
    const isAllowed = this.isAllowed();

    if (passThrough) {
      return this.renderPassThrough();
    }

    return isAllowed ? this.renderAllow() : fallback;
  }
}
