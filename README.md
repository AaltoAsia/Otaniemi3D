Otaniemi3D
==============

[![Build Status](https://travis-ci.org/AaltoAsia/Otaniemi3D.svg?branch=master)](https://travis-ci.org/AaltoAsia/Otaniemi3D)

This project aims to provide an intuitive user interface for reading and subscribing to realtime sensors data installed in Otaniemi - K1 Building - Otakaari 4


Setup development environment
-----------------------------

1. Install [node.js](http://nodejs.org/)
2. Install Yeoman toolset:

        npm install --global yo bower grunt-cli

3. Clone repository and navigate into the repository folder.
4. Install required project dependencies:

        bower install
        npm install

5. To launch app on http://localhost:9000:

        grunt serve


Test
-----------------------------

To execute tests run:

    grunt test


Build
-----------------------------
To build the app in the `dist/` folder run:

    grunt build
