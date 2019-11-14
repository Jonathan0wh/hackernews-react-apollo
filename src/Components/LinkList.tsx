import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link, { ILink } from './Link';

const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`;

interface IData {
  feed: {
    links: Array<{
      id: string;
      createdAt: string;
      url: string;
      description: string;
    }>;
  };
}

class LinkList extends Component {
  render() {
    return (
      <Query<IData, {}> query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          let linksToRender;
          if (data) {
            linksToRender = data.feed.links;
          }

          return (
            <div>
              {linksToRender &&
                linksToRender.map((link: ILink) => (
                  <Link key={link.id} link={link} />
                ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
