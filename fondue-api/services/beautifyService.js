var util = require("../util/util");
var request = require("request");

module.exports = {
  beautifyHTML: function (url, callback) {
    request({
      url: url,
      method: "GET",
      rejectUnauthorized: false
    }, function (err, subRes, body) {
      if (err) throw err;

      callback(util.beautifyHTML(body));
    });
  },

  beautifyJS: function (url, callback) {
    request({
      url: url,
      method: "GET",
      rejectUnauthorized: false
    }, function (err, subRes, body) {
      if (err) throw err;

      util.beautifyJS(body, url, function (beautifiedSrc) {
        if (beautifiedSrc === null) {
          callback(body);
        } else {
          callback(beautifiedSrc);
        }
      });
    });
  }
};