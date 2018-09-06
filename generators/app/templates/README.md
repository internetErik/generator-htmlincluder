# Html includer Site

## Development Setup

* clone this repository
* `cd` into root
* run `npm run setup`

## Run site for development

* `cd` into build
* run `live-server` (may need to be installed with `npm install -g live-server`)
  * this will host the built site with a simple http server
* in root of project run `gulp watch` (may need to be installed with npm install -g gulp`)
  * this will build the files and watch for changes


### Deploy to S3

You must set up `aws.json` file with correct creds for deployment, and then run `gulp deploy` or `npm run deploy`

## Project Conventions

### Components

Try to use components whenever you can in order to reduce the need to repeat yourself.

### Atomic Scss and BEM

Use atomic scss as much as possible, but if you think it is less complicated to do so follow BEM naming conventions:

* block
* block__element
* block--modifier


### Project Folder Structure

```

build\ <-- where all files are built to
src\
  |
  |- html <-- contains html snippets used with htmlincluder
      |-blocks <-- components that add functionality to other components
      |-components <-- reused snippets of html
      |-partials <-- parts of page (used to keep HTML easier to read)
  |- js <-- folder structure immitates that of html
      |-blocks
      |-components
      |-util <-- helpers
      | index.js <-- entry-point for JavaScript build
  |- scss <-- folder structure immitates that of html
      |-blocks
      |-components
      |-partials
      |-config <-- scss variables, and configuration for atomic scss
      |-site <-- site-wide styles

```
