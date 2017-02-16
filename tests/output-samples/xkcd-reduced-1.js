var Map = function ($container) {
  // CSS Update
  $container.css({
    "z-index": 1,
    overflow: "hidden",
    width: "740px",
    height: "694px",
    margin: "0px auto 0",
    background: "#fff",
    position: "relative"
  });

  // DOM Query
  var $overlay = $container.children("img");

  // CSS Update
  $overlay.css({
    background: "transparent",
    position: "relative"
  });

  // Sign Helper Fn
  var sign = function (x) {
    return x > 0 ? +1 : x < 0 ? -1 : 0;
  };

  // Sign Helper Fn
  var pow = function (x, y) {
    return Math.pow(Math.abs(x), y) * sign(x);
  };

  // Sign Helper Fn
  var clamp = function (x, min, max) {
    return Math.max(Math.min(x, max), min);
  };

  // Variables
  var offset = $container.offset();
  var padding_top = 200;
  var size = [14, 48, 25, 33];
  var tilesize = 2048;
  var visible = [];
  var container_size = [$container.width(), $container.height()];
  var scroll_delta = null;
  var $map = $container.children(".map");
  var map_size = [(size[1] + size[3]) * tilesize, (size[0] + size[2]) *
  tilesize
  ];

  // CSS Update
  $map.css({
    width: map_size[0],
    height: map_size[1],
    position: "absolute",
    zIndex: -1
  });


  var position = [-(size[3] + .03) * tilesize, -(size[0] - .55) * tilesize];

  // Query
  // CSS Update
  $map.find(".ground").css({
    top: size[0] * tilesize,
    height: size[2] * tilesize,
    position: "absolute",
    width: "100%",
    zIndex: -1,
    background: "#000"
  });
  var centre = [-1, 0];
  var update = function () {
    // CSS update
    $map.css({
      left: position[0],
      top: position[1]
    });


    var centre_last = centre;
    centre = [Math.floor(-position[0] / tilesize), Math.floor(-position[1] /
      tilesize)];
    tile_name = function (x, y) {
      x -= size[3];
      y -= size[0];
      return (y >= 0 ? y + 1 + "s" : -y + "n") + (x >= 0 ? x + 1 + "e" : -x +
          "w");
    };
    if (centre[0] != centre_last[0] || centre[1] != centre_last[1]) {
      var $remove = $map.children().not(".ground");
      for (var y = -1; y <= +1; y++) {
        for (var x = -1; x <= +1; x++) {
          var name = tile_name(centre[0] + x, centre[1] + y);
          var tile = $map.find(".tile" + name);
          if (tile.length) {
            $remove = $remove.not(tile);
          } else {
            $image = $('<img class="tile' + name +
              '" src="http://imgs.xkcd.com/clickdrag/' + name + '.png" style="top:' +
              (centre[1] + y) * tilesize + "px;left:" + (centre[0] + x) * tilesize +
              'px; z-index: -1; position: absolute;;" style="display:none" />');
            $image.load(function () {
              $(this).show();
            }).error(function () {
              $(this).remove();
            });
            $map.append($image);
          }
        }
      }
      $remove.remove();
    }
  };
  update();

  function drag(e) {
    if (scroll_delta) {
      var pos = eventPos(e);
      position[0] = Math.round(clamp(pos.pageX + scroll_delta[0], -(size[1] +
        size[3]) * tilesize + container_size[0], 0));
      position[1] = Math.round(clamp(pos.pageY + scroll_delta[1], -(size[0] +
        size[2]) * tilesize + container_size[1], 0));
      update();
    }
  }

  $container.on("mousedown touchstart", function (e) {
    if (e.button && e.button >= 2) {
      return;
    }
    var pos = eventPos(e);
    scroll_delta = [position[0] - pos.pageX, position[1] - pos.pageY];
    $(document).on("mousedown" == e.type ? "mousemove" : "touchmove", drag);
    e.preventDefault();
  });
  $(document).on("mouseup touchend", function (e) {
    $(document).off("mousemove touchmove", drag);
    scroll_delta = null;
  });
};
$(function () {
  var map = new Map($("#comic"));
});
