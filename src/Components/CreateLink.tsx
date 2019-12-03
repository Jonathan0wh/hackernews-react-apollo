import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { RouteComponentProps } from 'react-router-dom';

import { FEED_QUERY } from './LinkList';

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
          onCompleted={() => this.props.history.push('/')}
          update={(store, { data }) => {
            const queryData: any = store.readQuery({ query: FEED_QUERY });
            if (data) {
              queryData.feed.links.unshift(data.post);
              store.writeQuery({
                query: FEED_QUERY,
                data: queryData
              });
            }
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
