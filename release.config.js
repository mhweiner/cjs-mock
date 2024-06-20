const types = {
    feat: {title: '✨ Features', release: 'minor'},
    fix: {title: '🐛 Bug Fixes', release: 'patch'},
    perf: {title: '⚡ Performance Improvements', release: 'patch'},
    revert: {title: '⏪ Reverts', release: 'patch'},
    docs: {title: '📚 Documentation', release: 'patch'},
    style: {title: '💅 Styles', release: 'patch'},
    refactor: {title: '🛠 Code Refactoring', release: 'patch'},
    test: {title: '🧪 Tests', release: 'patch'},
    build: {title: '🏗 Build System', release: 'patch'},
    ci: {title: '🔧 Continuous Integration', release: 'patch'},
};

// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
const transform = (commit, context) => {

    const notes = commit.notes.map((note) => ({
        ...note,
        title: 'BREAKING CHANGES',
    }));
    const type = types[commit.type] ? types[commit.type].title : commit.type;
    const scope = commit.scope === '*' ? '' : commit.scope;
    const shortHash = typeof commit.hash === 'string'
        ? commit.hash.substring(0, 7)
        : commit.shortHash;
    const issues = [];
    let subject = commit.subject;

    if (typeof subject === 'string') {

        let url = context.repository
            ? `${context.host}/${context.owner}/${context.repository}`
            : context.repoUrl;

        if (url) {

            url = `${url}/issues/`;
            // Issue URLs.
            subject = subject.replace(/#([0-9]+)/g, (_, issue) => {

                issues.push(issue);
                return `[#${issue}](${url}${issue})`;

            });

        }
        if (context.host) {

            // User URLs.
            subject = subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {

                if (username.includes('/')) {

                    return `@${username}`;

                }

                return `[@${username}](${context.host}/${username})`;

            });

        }

    }

    // remove references that already appear in the subject
    const references = commit.references.filter((reference) => !issues.includes(reference.issue));

    return {
        notes,
        type,
        scope,
        shortHash,
        subject,
        references,
    };

};

module.exports = {
    branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        'main',
        'next',
        {
            name: 'beta',
            prerelease: true,
        },
        {
            name: 'alpha',
            prerelease: true,
        },
    ],
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
