1. Update version in package.json
  * Use semantic versioning "X.Y.Z"
2. Re-build project (js/css bundling and minification in the ./dist folder)
3. Commit & push to develop
4. Merge develop to master
5. Create tag & release at https://github.com/gnpis/trait-ontology-widget/releases/new
  * Use the version in package.json as the release name & tag name
  * Add changelogs in release description
6. Re-deploy JSS & CSS were used (ex: https://urgi.versailles.inra.fr/files/ephesis/trait-ontology/widget-v2/)
