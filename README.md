# CKAN Uploader widget

This is a simple Sveltejs widget used by [ckanext-validation](https://github.com/frictionlessdata/ckanext-validation/) to upload resource files to a CKAN instance. 

# Install and build


```
$ npm i
$ npm run build
```

This will build the js and css on the `dist/` folder. To use them in ckanext-validation you do need to copy them to:

```
$ cp dist/ckan-uploader.umd.cjs ../ckanext-validation/ckanext/validation/webassets/js/ckan-uploader.js
$ cp dist/style.css ../ckanext-validation/ckanext/validation/webassets/css/ckan-uploader.css

```
