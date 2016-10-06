   Trait Ontology Widget
===========================

A phenotypic trait ontology tree viewer widget in HTML/JS and based on jQuery and JSTree.

Simple integration in existing web page:
see demo/index.html.

Currently deployed in  [Ephesis ontology portal](https://urgi.versailles.inra.fr/ephesis/ephesis/ontologyportal.do).

## Demo

### From release

1. Download the latest `distrib-wit-demo.zip` on the [release page ](https://github.com/cpommier/trait-ontology-widget/releases).
2. Run a static HTTP server in the extracted folder (required for Ajax loading)
3. Open the web page in the browser

### From source code

1. Clone the repository
2. Install [Node.js](https://nodejs.org/en/)
3. Fetch dependencies:
```shell
$ npm install     # produces a node_modules/ folder
```
4. Build & run the demo:
```shell
$ ./run.sh        # build & run a static HTTP server
```
5. Open http://localhost:8888

## Dependencies

* **jQuery**
* **jsTree**: a jQuery plugin that provides interactive trees

Development tools:
* **browserify**: used to bundle the widget source with its dependencies
* **uglifyjs**: used to minify the JavasSript after bundling
* **less**: a CSS preprocessor used to bundle the widget styles with jstree's styles
* **clean-css**: used to minify the CSS after bundling
* **http-server**: used to launch a static HTTP server for the demo (used in run.sh)
