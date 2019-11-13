import React, { Component } from 'react';

export type TLink = {
  id: string;
  description: string;
  url: string;
};

type LinkProps = {
  key: string;
  link: TLink;
};

class Link extends Component<LinkProps, {}> {
  render() {
    return (
      <div>
        <div>
          {this.props.link.description} ({this.props.link.url})
        </div>
      </div>
    );
  }
}

export default Link;
