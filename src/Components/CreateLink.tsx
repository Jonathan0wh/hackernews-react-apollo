import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { RouteComponentProps } from 'react-router-dom';

import { FEED_QUERY } from './LinkList';
import { LINKS_PER_PAGE } from '../constants';

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

interface IData {
  post: {
    id: string;
    createdAt: string;
    url: string;
    description: string;
  };
}

interface IVariables {
  description: string;
  url: string;
}

interface CreateLinkState {
  description: string;
  url: string;
}

class CreateLink extends Component<RouteComponentProps, CreateLinkState> {
  state: CreateLinkState = {
    description: '',
    url: ''
  };

  render() {
    const { description, url } = this.state;

    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <Mutation<IData, IVariables>
          mutation={POST_MUTATION}
          variables={{ description, url }}
          onCompleted={() => this.props.history.push('/new/1')}
          update={(store, { data }) => {
            let post;
            if (data) {
              post = data.post;
            }
            const first = LINKS_PER_PAGE;
            const skip = 0;
            const orderBy = 'createdAt_DESC';
            const storeData: any = store.readQuery({
              query: FEED_QUERY,
              variables: { first, skip, orderBy }
            });
            storeData.feed.links.unshift(post);
            store.writeQuery({
              query: FEED_QUERY,
              data: storeData,
              variables: { first, skip, orderBy }
            });
          }}
        >
          {postMutation => (
            <button onClick={() => postMutation()}>Submit</button>
          )}
        </Mutation>
      </div>
    );
  }
}

export default CreateLink;
