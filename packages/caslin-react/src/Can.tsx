import React from 'react';
import PropTypes from 'prop-types';
import { Feature } from '@caslin/feature';

interface RenderChildren {
  (): React.ReactElement;
  (can: boolean): React.ReactElement;
  (can: boolean, feature: Feature): React.ReactElement;
}

interface Props {
  action: string;
  subject: string;
  feature: Feature;
  not?: boolean;
  passThrough?: boolean;
  children: React.ReactElement | RenderChildren ;
}

export default class Can extends React.PureComponent<Props> {
  static propTypes = {
    action: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    feature: PropTypes.instanceOf(Feature).isRequired,
    not: PropTypes.bool,
    passThrough: PropTypes.bool,
    children: PropTypes.any.isRequired,
  };

  render(): React.ReactNode {
    return (
      <div>Can</div>
    );
  }
}
