import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Link, { ILink } from './Link';
import { LINKS_PER_PAGE } from '../constants';

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
      count
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

interface LinkListProps {
  page: string;
}

interface IData {
  feed: {
    links: Array<ILink>;
    count: number;
  };
}

interface IVariable {
  first: number;
  skip: number;
  orderBy: string | null;
}

class LinkList extends Component<RouteComponentProps<LinkListProps>, {}> {
  _updateCacheAfterVote = (store: any, createVote: any, linkId: string) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });

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

  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { first, skip, orderBy };
  };

  _getLinksToRender = (data: IData) => {
    const isNewPage = this.props.location.pathname.includes('new');
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  _nextPage = (data: IData) => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  };

  render() {
    return (
      <Query<IData, IVariable>
        query={FEED_QUERY}
        variables={this._getQueryVariables()}
      >
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewVotes(subscribeToMore);

          let linksToRender;
          if (data) {
            linksToRender = this._getLinksToRender(data);
          }
          const isNewPage = this.props.location.pathname.includes('new');
          const pageIndex = this.props.match.params.page
            ? (parseInt(this.props.match.params.page) - 1) * LINKS_PER_PAGE
            : 0;

          return (
            <Fragment>
              {linksToRender &&
                linksToRender.map((link: ILink, index: number) => (
                  <Link
                    key={link.id}
                    link={link}
                    index={index + pageIndex}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                  />
                ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div className="pointer mr2" onClick={this._previousPage}>
                    Previous
                  </div>
                  <div
                    className="pointer"
                    onClick={() => data && this._nextPage(data)}
                  >
                    Next
                  </div>
                </div>
              )}
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
