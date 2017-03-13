   Trait Ontology Widget
===========================

A HTML/JS widget for visualizing [Breeding API](https://github.com/plantbreeding/API) observation variable ontologies in a tree.

![Widget screenshot](https://raw.githubusercontent.com/wiki/gnpis/trait-ontology-widget/img/Screenshot-widget-v2.png)

Simple integration in existing web page:

```html
<script type="text/javascript" src="cropOntologyWidget.min.js"></script>
<link rel="stylesheet" href="cropOntologyWidget.min.css"></link>

<div id="trait-ontology-widget"></div>

<script type="text/javascript">
// Instanciate widget
var widget = new CropOntologyWidget("#trait-ontology-widget", {
  // Breeding API server
  "breedingAPIEndpoint": "https://urgi.versailles.inra.fr/ws/webresources/brapi/v1/"
});
</script>
```

The Breeding API used in this widget **must implement** the [observation variable list call](https://github.com/plantbreeding/API/blob/master/Specification/ObservationVariables/VariableList.md) at minimum and can implement the [observation variable ontology list call](https://github.com/plantbreeding/API/blob/master/Specification/ObservationVariables/VariableOntologyList.md) for added metadata on the ontology (like the version, copyright, authors, etc.)

## Demo

### In Ephesis ontology portal

The latest release of this widget is accessible on the [:link: Ephesis ontology portal](https://urgi.versailles.inra.fr/ephesis/ephesis/ontologyportal.do).

### From release

1. Download the latest `distrib-wit-demo.zip` on the [release page ](https://github.com/gnpis/trait-ontology-widget/releases).
2. Run a static HTTP server in the extracted folder (required for Ajax loading)
3. Open the web page in the browser

### From source code

1. Clone the repository
2. Install [Node.js](https://nodejs.org/)
3. Fetch dependencies:
  ```shell
  $ npm install
  # produces a node_modules/ folder
  ```
4. Build & run the demo:
  ```shell
  $ ./run.sh
  # build & run a static HTTP server
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
