import React from 'react';
import PropTypes from 'prop-types';
import { Feature, UndefinedSubject } from '@caslin/feature';

export interface RenderChildren {
  (): React.ReactNode;
  (can: boolean): React.ReactNode;
  (can: boolean, feature: Feature): React.ReactNode;
}

export interface Props {
  action: string | string[];
  subject?: string;
  feature: Feature;
  not?: boolean;
  passThrough?: boolean;
  env?: string;
  tag?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode | RenderChildren ;
}

export default class Can extends React.PureComponent<Props> {
  static propTypes = {
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    subject: PropTypes.string,
    tag: PropTypes.string,
    feature: PropTypes.object.isRequired,
    not: PropTypes.bool,
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
    const {
      feature,
      action,
      subject,
      tag,
      env,
      not,
    } = this.props;
    if (not) {
      if (tag) {
        return env ? feature.at(env).cannot(tag, UndefinedSubject) : feature.cannot(tag, UndefinedSubject);
      } else {
        return env ? feature.at(env).cannot(action, subject as string) : feature.cannot(action, subject as string);
      }
    } else {
      if (tag) {
        return env ? feature.at(env).can(tag, UndefinedSubject) : feature.can(tag, UndefinedSubject);
      } else {
        return env ? feature.at(env).can(action, subject as string) : feature.can(action, subject as string);
      }
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
      throw new TypeError('@caslin/react: "feature" prop must be provided to <Can>.')
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
