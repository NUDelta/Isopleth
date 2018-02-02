# Isopleth

A platform for following interesting paths through JavaScript.

#To install:
    
    # install nvm (https://github.com/creationix/nvm)
    
    nvm install v0.10.32
    nvm alias default v0.10.32
    
    # install homebrew for mac
    # if on windows, install redis via googling
    brew install redis
       
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
    
    #Update your chrome flags to allow localhost to spoof https certs
    chrome://flags > Allow invalid certificates for resources loaded from localhost

#To run:
    - Open google chrome
    - chrome://extensions
    - check "Developer Mode"
    - Load upnacked extension...
    - Navigate to isopleth/chrome-extension
    
    cd isopleth/fondue-api/redis
    ./redisStart.sh  #start redis
    
    cd isopleth/fondue-api
    node app-cluster.js  #start fondue api on all cores
    
    cd isopleth/socket-fondue-jsbin
    node app.js
    
    cd isopleth/tests
    node app.js
    
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
    
