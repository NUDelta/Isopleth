module.exports = function(app){
  var home = function(req, res){
    res.render('index', {
      title: "Isopleth"
    });
  };

  app.get("/", home);
  app.get("/index", home);
};

