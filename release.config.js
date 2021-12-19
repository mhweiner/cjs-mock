/*
 * We're using the default semantic-release configurations (including angular preset) with the
 * following minor changes:
 *  - commit type 'docs' should trigger a patch release, so that the README is updated in npmjs.com
 *  - all other commit types also trigger at least a patch release, so that these changes are
 *    reflected on npmjs.com and we get credit for these maintenance activities
 *  - of course, all commits should show up in the release notes
 * Unfortunately, these very simple changes require quite a bit of work and seems quite brittle.
 * Someday, I may want to write my own very simple version of semantic-release, or a custom plugin.
 */

const typeTransforms = [
    ['feat', 'Features'],
    ['fix', 'Bug Fixes'],
    ['perf', 'Performance'],
    ['revert', 'Reverts'],
    ['docs', 'Documentation'],
    ['style', 'Code Style'],
    ['refactor', 'Code Refactoring'],
    ['chore', 'Chores'],
    ['test', 'Tests'],
    ['build', 'Build'],
    ['ci', 'Continuous Integration'],
];

// the following is copied and modified from https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/writer-opts.js
// eslint-disable-next-line max-lines-per-function
function transform(commit, context) {

    const issues = [];

    commit.notes.forEach((note) => {

        note.title = 'BREAKING CHANGES';

    });

    typeTransforms.forEach((type) => {

        if (commit.type === type[0]) {

            commit.type = type[1];

        }

    });

    if (commit.scope === '*') {

        commit.scope = '';

    }

    if (typeof commit.hash === 'string') {

        commit.shortHash = commit.hash.substring(0, 7);

    }

    if (typeof commit.subject === 'string') {

        let url = context.repository
            ? `${context.host}/${context.owner}/${context.repository}`
            : context.repoUrl;

        if (url) {

            url = `${url}/issues/`;
            // Issue URLs.
            commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {

                issues.push(issue);
                return `[#${issue}](${url}${issue})`;

            });

        }
        if (context.host) {

            // User URLs.
            commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {

                if (username.includes('/')) {

                    return `@${username}`;

                }

                return `[@${username}](${context.host}/${username})`;

            });

        }

    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter((reference) => issues.indexOf(reference.issue) === -1);

    return commit;

}

module.exports = {
    plugins: [
        ['@semantic-release/commit-analyzer', {
            preset: 'angular',
            releaseRules: [
                {type: 'docs', release: 'patch'},
                {type: 'feat', release: 'minor'},
                {type: 'test', release: 'patch'},
                {type: 'chore', release: 'patch'},
                {type: 'perf', release: 'patch'},
                {type: 'style', release: 'patch'},
                {type: 'ci', release: 'patch'},
                {type: 'refactor', release: 'patch'},
                {type: 'build', release: 'patch'},
                {type: 'fix', release: 'patch'},
                {type: 'revert', release: 'patch'},
            ],
        }],
        ['@semantic-release/release-notes-generator', {
            writerOpts: {transform},
        }],
        '@semantic-release/npm',
        '@semantic-release/github',
    ],
};
