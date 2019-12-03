import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Link, { ILink } from './Link';

export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

interface IData {
  feed: {
    links: Array<ILink>;
  };
}

class LinkList extends Component {
  _updateCacheAfterVote = (store: any, createVote: any, linkId: string) => {
    const data = store.readQuery({ query: FEED_QUERY });

    const votedLink = data.feed.links.find((link: ILink) => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewLinks = (subscribeToMore: any) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(({ id }: any) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        });
      }
    });
  };

  _subscribeToNewVotes = (subscribeToMore: any) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    });
  };

  render() {
    return (
      <Query<IData, {}> query={FEED_QUERY}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewVotes(subscribeToMore);

          let linksToRender;
          if (data) {
            linksToRender = data.feed.links;
          }

          return (
            <div>
              {linksToRender &&
                linksToRender.map((link: ILink, index: number) => (
                  <Link
                    key={link.id}
                    link={link}
                    index={index}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                  />
                ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
