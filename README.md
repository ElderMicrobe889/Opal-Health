# TSA-Webmaster2020

A way for us to collaborate on our TSA Webmaster project

## Apps

### Info 

General information about the site, and TSA required stuff 

### Service 

The actual service we want to provide via the site 

### Users 

Stuff like login/register and user pages 

### Chapter 

Stuff specific to our TSA chapter 

## Base.html 

All html files should USUALLY extend base.html (chapter pages should extend chapterBase.html), this has the navbar and footer, aswell as some required css/js. 
The links block in base.html can be use in order to add any additional css/js files. 
The content block is where the content of the current page should go. Finally, the title block should contain the title for the page, it will get "Healine |" (or "BASH TSA |" for chapter pages) prepended, so for the login page it would be: "Healine | Login".

## Static Folder

Static files are put in the static folder at the root directory of the repo. 
They are split per-app, files spanning the entire site go in the base folder. 

### Referencing 

Static files are referenced in your html as follows:

```html
{% load static %} 
<link href="{% static 'APP_NAME/CSS/FILE_NAME.css' %}" rel="stylesheet" type="text/css" /> 
<script type="text/javascript" src="{% static 'APP_NAME/JS/FILE_NAME.js' %}"></script> 
<img alt="..." type="..." src="{% static 'APP_NAME/IMG/FILE_NAME.png' %}"/>
```



