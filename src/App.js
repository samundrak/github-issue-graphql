import React, { Component } from 'react';
import axios from 'axios';
import Organization from './Organization';
import './App.css';

const axiosGithubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`,
  },
});

const GET_ISSUES_OF_REPOSITORY = `
query ($organization: String!, $repository: String!, $cursor: String) {
  organization(login: $organization) {
    name
    url
    repository(name: $repository) {
      name
      url
      issues(first: 5, after: $cursor, states: [OPEN]) {
        edges {
          node {
          id
          title
          url
          reactions(last: 3) {
            edges {
              node {
                id
                content
                }
              }
            }
          }
        }
        totalCount
        pageInfo {
        endCursor
        hasNextPage
        }
      }
    }
  }
}
`;
const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');
  return axiosGithubGraphQL.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor },
  });
};
const resolveIssuesQuery = (queryResult, cursor) => state => {
  const { data, errors } = queryResult.data;
  if (!cursor) {
    return {
      organization: data.organization,
      errors,
    };
  }
  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];
  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues,
        },
      },
    },
    errors,
  };
};
class App extends Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null,
  };
  onSubmit = event => {
    this.onFetchFromGitHub(this.state.path);
    event.preventDefault();
  };
  onChange = event => {
    this.setState({
      path: event.target.value,
    });
  };
  onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor).then(queryResult =>
      this.setState(resolveIssuesQuery(queryResult, cursor)),
    );
  };
  onFetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGitHub(this.state.path, endCursor);
  };
  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }
  render() {
    const { path, organization, errors } = this.state;
    return (
      <div>
        {' '}
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com/</label>
          <input
            value={path}
            id="url"
            type="text"
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>
        <hr />
        {organization ? (
          <Organization
            organization={organization}
            onFetchMoreIssues={this.onFetchMoreIssues}
            errors={errors}
          />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}

export default App;
