import React, { Component } from 'react';

export interface ILink {
  id: string;
  description: string;
  url: string;
}

interface LinkProps {
  key: string;
  link: ILink;
}

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
