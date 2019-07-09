import React from 'react';
import PropTypes from 'prop-types';
import { Feature } from '@caslin/feature';

export interface RenderChildren {
  (): React.ReactNode;
  (can: boolean): React.ReactNode;
  (can: boolean, feature: Feature): React.ReactNode;
}

export interface Props {
  action: string | string[];
  subject: string;
  feature: Feature;
  not?: boolean;
  passThrough?: boolean;
  env?: string;
  children: React.ReactNode | RenderChildren ;
}

export default class Can extends React.PureComponent<Props> {
  static propTypes = {
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    subject: PropTypes.string.isRequired,
    feature: PropTypes.instanceOf(Feature).isRequired,
    not: PropTypes.bool,
    passThrough: PropTypes.bool,
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
    const {
      feature,
      action,
      subject,
      env,
      not,
    } = this.props;
    if (not) {
      return env ? feature.at(env).cannot(action, subject) : feature.cannot(action, subject);
    } else {
      return env ? feature.at(env).can(action, subject) : feature.can(action, subject);
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
      throw new TypeError('@caslin/react: "feature" prop must be provided.')
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
    const { passThrough } = this.props;
    const isAllowed = this.isAllowed();

    if (passThrough) {
      return this.renderPassThrough();
    }

    return isAllowed ? this.renderAllow() : null;
  }
}
