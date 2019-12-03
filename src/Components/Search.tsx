import React, { Component } from 'react';
import { withApollo, WithApolloClient } from 'react-apollo';
import gql from 'graphql-tag';

import Link, { ILink } from './Link';

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
  }
`;

interface SearchState {
  links: Array<ILink>;
  filter: string;
}

class Search extends Component<WithApolloClient<{}>, SearchState> {
  state: SearchState = {
    links: [],
    filter: ''
  };

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.length > 0 &&
          this.state.links.map((link, index) => (
            <Link key={link.id} link={link} index={index} />
          ))}
      </div>
    );
  }

  _executeSearch = async () => {
    const { filter } = this.state;
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });
    const links: Array<ILink> = result.data.feed.links;
    this.setState({ links });
  };
}

export default withApollo(Search);
