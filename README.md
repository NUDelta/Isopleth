# Isopleth

A platform for following interesting paths through JavaScript.

#To install:
    
Install nvm and node (https://github.com/creationix/nvm)
    
    nvm install v0.10.32
    nvm alias default v0.10.32
    
Install redis (via homebrew, or if on windows google it)
    
    brew install redis
       
Install npm dependencies for all the sub-projects
    
    cd isopleth/fondue-api
    rm -rf node_modules
    npm install
    
    cd isopleth/isopleth
    rm -rf node_modules
    npm install
    
    cd isopleth/socket-fondue-jsbin
    rm -rf node_modules
    npm install
    
    cd isopleth/tests
    rm -rf node_modules
    npm install
    
Setup Chrome
    
    - Open google chrome
    - Update your chrome flags to allow localhost to spoof https certs:
        chrome://flags > Allow invalid certificates for resources loaded from localhost

    - chrome://extensions
    - check "Developer Mode"
    - Load upnacked extension...
    - Navigate to isopleth/chrome-extension
    - Ok

#To run:
    
    cd isopleth/fondue-api/redis
    ./redisStart.sh  #start redis
    
    cd isopleth/fondue-api
    node app-cluster.js  #start fondue api on all cores
    
    cd isopleth/socket-fondue-jsbin
    node app.js
    
    cd isopleth/tests
    node app.js
    
    cd isopleth/isopleth
    node app.js
    
    # All four must be up and running for the test app to work.
    
#To run a test app:

    Open http://localhost:3004/demo/index3.html
             
    Open Dev Tools
             
    Open Isopleth Dev Tool Pane
    
    Open Chrome Dev Tools
    
    Reload Page with Ibex
    
    It Instruments Pages, wait a few minutes for source tracing, watch fondue-api logs for activity
    
    Refresh web page, reload with ibex again (this time is uses cached values)
    
    Wait for page to fully reappear and work
    
    Click on the isopleth tab that auto-opened
    
    Hit Draw button at bottom
    
