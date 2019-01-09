Starting from develop (with all fixes, features etc. already merged and tested)

0. Make sure you have updated the built bundle (in the ./dist folder) running `./build.sh`
1. Merge develop into master
2. Update project version using `npm version [major|minor|patch]` (will also commit and create a tag)
3. Release at https://github.com/gnpis/trait-ontology-widget/releases/new
  * Use the version in package.json as the release name & tag name
  * Add changelogs in release description
4. Re-deploy JSS & CSS were used (ex: https://urgi.versailles.inra.fr/files/ephesis/trait-ontology/widget-v2/)
