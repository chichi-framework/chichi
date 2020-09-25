<p align="center">
  <a href="https://chichi.io/">
    <img src="https://chichi.io/assets/brand/chichi-logo.png" alt="ChiChi logo" width="200" height="165">
  </a>
</p>

<h3 align="center">ChiChi</h3>

<p align="center">
  The most popular front-end framework for Stylus.
  <br>
  <a href="https://chichi.io/docs/"><strong>Explore ChiChi docs »</strong></a>
  <br>
  <br>
  <a href="https://github.com/chichi-framework/chichi/issues/new?template=bug_report.md">Report bug</a>
  ·
  <a href="https://github.com/chichi-framework/chichi/issues/new?template=feature_request.md">Request feature</a>
  ·
  <a href="https://blog.chichi.io/">Blog</a>
</p>

## Table of Contents

- [Quick Start](#quick-start)
- [Status](#status)
- [Whats Included](#whats-included)
- [Community](#community)
- [Versioning](#versioning)
- [Creators](#creators)
- [Backers](#backers)
- [Sponsors](#sponsors)
- [Copyright and license](#copyright-and-license)

## Quick Start

- [Download the latest release.](https://github.com/chichi-framework/chichi/archive/v0.1.0.zip)
- Clone the repo: `git clone https://github.com/chichi-framework/chichi.git`
- Install with [npm](https://www.npmjs.com/): `npm install chichi@0.1.0`
- Install with [yarn](https://yarnpkg.com/): `yarn add chichi@0.1.0`
- Install with [Composer](https://getcomposer.org/): `composer require chichi/chichi:0.1.0`
- Install with [NuGet](https://www.nuget.org/): CSS: `Install-Package chichi` Stylus: `Install-Package chichi.stylus`

Read the [Getting started page](https://chichi.io/docs/0.1.0/getting-started/introduction/) for information on the framework contents, templates and examples, and more.

## Status

[![Slack](https://img.shields.io/badge/slack-@chichiframework/chichi.svg?logo=slack?style=for-the-badge)](https://app.slack.com/client/T01BD36SW67/C01BK2RPYCC)
[![Build Status](https://img.shields.io/circleci/build/github/chichi-framework/chichi/master?label=CirleCi&logo=circleci&style=for-the-badge&token=59482c8a0c1e07a1a9ecd4c2454c3f0a161c68c7)](https://app.circleci.com/pipelines/github/chichi-framework/chichi)
[![npm version](https://img.shields.io/npm/v/chichi.svg)](https://www.npmjs.com/package/chichi)
[![Meteor Atmosphere](https://img.shields.io/badge/meteor-chichi-blue.svg)](https://atmospherejs.com/chichi-framework/chichi)
[![Packagist Prerelease](https://img.shields.io/packagist/vpre/chichi/chichi.svg)](https://packagist.org/packages/chichi/chichi)
[![NuGet](https://img.shields.io/nuget/vpre/chichi.svg)](https://www.nuget.org/packages/chichi/absoluteLatest)
[![CSS gzip size](https://img.badgesize.io/chichi/chichi/master/dist/css/chichi.min.css?compression=gzip&label=CSS+gzip+size)](https://github.com/chichi-framework/chichi/tree/master/dist/css/chichi.min.css)
[![JS gzip size](https://img.badgesize.io/chichi/chichi/master/dist/js/chichi.min.js?compression=gzip&label=JS+gzip+size)](https://github.com/chichi-framework/chichi/tree/master/dist/js/chichi.min.js)

## What's Included

Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this

```text
chichi/
└── dist/
    ├── css/
    │   ├── chichi.css
    │   ├── chichi.css.map
    │   ├── chichi.min.css
    │   └── chichi.min.css.map
    └── js/
        ├── chichi.js
        ├── chichi.js.map
        ├── chichi.min.js
        └── chichi.min.js.map
```

## Bugs and feature requests

Have a bug or a feature request? Please first read the [issue guidelines](https://github.com/chichi-framework/chichi/blob/master/.github/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/chichi-framework/chichi/issues/new).

## Documentation

ChiChi's documentation, included in this repo in the root directory, is built with [Hugo](https://gohugo.io/) and publicly hosted on GitHub Pages at <https://chichi.io/>. The docs may also be run locally.

Documentation search is powered by [Algolia's DocSearch](https://community.algolia.com/docsearch/). Working on our search? Be sure to set `debug: true` in `site/assets/js/src/search.js` file.

### Running documentation locally

1. Run `npm install` to install the Node.js dependencies, including Hugo (the site builder).
2. Run `npm run test` (or a specific npm script) to rebuild distributed CSS and JavaScript files, as well as our docs assets.
3. From the root `/bootstrap` directory, run `npm run docs-serve` in the command line.
4. Open `http://localhost:9001/` in your browser, and voilà.

Learn more about using Hugo by reading its [documentation](https://gohugo.io/documentation/).

### Documentation for previous releases

You can find all our previous releases docs on <https://chichi.io/docs/versions/>.

[Previous releases](https://github.com/twbs/bootstrap/releases) and their documentation are also available for download.

## Contributing

Please read through our [contributing guidelines](https://github.com/chichi-framework/chichi/blob/master/.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

Moreover, if your pull request contains JavaScript patches or features, you must include [relevant unit tests](https://github.com/chichi-framework/chichi/tree/master/js/tests). All HTML and CSS should conform to the [Code Guide](https://github.com/chichi-framework/code-guide), maintained by [Jeremy Bolding](https://github.com/thecodechef).

Editor preferences are available in the [editor config](https://github.com/chichi-framework/chichi/blob/master/.editorconfig) for easy use in common text editors. Read more and download plugins at <https://editorconfig.org/>.

## Community

Get updates on Bootstrap's development and chat with the project maintainers and community members.

- Follow [@chichi-framework on Twitter](https://twitter.com/chichiframework).
- Read and subscribe to [The Official ChiChi Blog](https://blog.chichi.io/).
- Join [the official Slack room](https://chichi-slack.slack.io/).
- Chat with fellow Members in IRC. On the `irc.freenode.net` server, in the `##chichi` channel.
- Implementation help may be found at Stack Overflow (tagged [`chichi`](https://stackoverflow.com/questions/tagged/chichi)).
- Developers should use the keyword `chichi` on packages which modify or add to the functionality of ChiChi when distributing through [npm](https://www.npmjs.com/browse/keyword/chichi) or similar delivery mechanisms for maximum discoverability.

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Bootstrap is maintained under [the Semantic Versioning guidelines](https://semver.org/). Sometimes we screw up, but we adhere to those rules whenever possible.

See [the Releases section of our GitHub project](https://github.com/chichi-framework/chichi/releases) for changelogs for each release version of ChiChi. Release announcement posts on [the official ChiChi blog](https://blog.chichi.io/) contain summaries of the most noteworthy changes made in each release.

## Creators

**Jeremy Bolding**

- <https://twitter.com/thecodechef>
- <https://github.com/thecodechef>


## Copyright and license

Code and documentation copyright 2020 the [ChiChi Authors.](https://github.com/chichi-framework/chichi/graphs/contributors) Code released under the [MIT License](https://github.com/chichi-framework/chichi/blob/master/LICENSE). Docs released under [Creative Commons](https://creativecommons.org/licenses/by/3.0/).
