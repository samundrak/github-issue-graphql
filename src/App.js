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
{
organization(login: "the-road-to-learn-react") {
name
url
repository(name: "the-road-to-learn-react") {
name
url
issues(last: 5) {
edges {
node {
id
title
url
}
}
}
}
}
}
`;
const getIssuesOfRepositoryQuery = (organization, repository) => `
{
organization(login: "${organization}") {
name
url
repository(name: "${repository}") {
name
url
issues(last: 5) {
edges {
node {
id
title
url
}
}
}
}
}
}
`;
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
  onFetchFromGitHub = path => {
    const [organization, repository] = path.split('/');
    axiosGithubGraphQL
      .post('', { query: getIssuesOfRepositoryQuery(organization, repository) })
      .then(result =>
        this.setState(() => ({
          organization: result.data.data.organization,
          errors: result.data.errors,
        })),
      );
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
          <Organization organization={organization} errors={errors} />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}

export default App;
