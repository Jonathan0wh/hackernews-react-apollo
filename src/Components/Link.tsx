import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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

export interface ILink {
  id: string;
  description: string;
  url: string;
  votes: Array<any>;
  postedBy: {
    name: string;
  };
  createdAt: number;
}

interface IData {
  vote: {
    id: string;
    link: ILink;
    user: {
      id: string;
    };
  };
}

interface IVariables {
  linkId: string;
}

interface LinkProps {
  key: string;
  index: number;
  link: ILink;
  updateStoreAfterVote?: Function;
}

class Link extends Component<LinkProps, {}> {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <Mutation<IData, IVariables>
              mutation={VOTE_MUTATION}
              variables={{ linkId: this.props.link.id }}
              update={(store, { data }) =>
                data &&
                this.props.updateStoreAfterVote &&
                this.props.updateStoreAfterVote(
                  store,
                  data.vote,
                  this.props.link.id
                )
              }
            >
              {voteMutation => (
                <div className="ml1 gray f11" onClick={() => voteMutation()}>
                  ▲
                </div>
              )}
            </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    );
  }
}

export default Link;
