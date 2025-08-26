const { Octokit } = require('@octokit/rest');

class GitHubAPI {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async getContributions(username, _fromDate = null, _toDate = null) {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                  color
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.octokit.graphql(query, { username });
      return this.processContributionData(response.user.contributionsCollection.contributionCalendar);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      throw error;
    }
  }

  processContributionData(calendar) {
    const contributions = [];
    const totalContributions = calendar.totalContributions;

    calendar.weeks.forEach((week, weekIndex) => {
      week.contributionDays.forEach((day, dayIndex) => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: this.getContributionLevel(day.contributionCount),
          x: weekIndex,
          y: dayIndex,
          color: day.color
        });
      });
    });

    return {
      contributions,
      totalContributions,
      maxCount: Math.max(...contributions.map(c => c.count)),
      weeks: calendar.weeks.length
    };
  }

  getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  async getUserInfo(username) {
    try {
      const response = await this.octokit.rest.users.getByUsername({
        username: username
      });
      return {
        name: response.data.name || username,
        login: response.data.login,
        avatarUrl: response.data.avatar_url,
        publicRepos: response.data.public_repos,
        followers: response.data.followers
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { name: username, login: username };
    }
  }
}

module.exports = GitHubAPI;
