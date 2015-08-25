Otaniemi3D
==============

[![Build Status](https://travis-ci.org/AaltoAsia/Otaniemi3D.svg?branch=master)](https://travis-ci.org/AaltoAsia/Otaniemi3D)

This project aims to provide an intuitive user interface for reading and subscribing to realtime sensors data installed in Otaniemi - K1 Building - Otakaari 4


Setup development environment
-----------------------------

1. Install [node.js](http://nodejs.org/)
2. Install bower and gulp:

        npm install --global bower gulp

3. Clone repository and navigate into the repository folder.
4. Install required project dependencies:

        bower install
        npm install

5. To launch app on http://localhost:9000:

        gulp serve


Build
-----------------------------
To build the app in the `dist/` folder run:

    gulp build
