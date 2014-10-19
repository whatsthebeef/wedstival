function initCanvas(func) {
   window.addEventListener ? 
   window.addEventListener("load", func, false) : 
   window.attachEvent && window.attachEvent("onload", func);
}

function loadImages(sources, callback) {
   var images = {};
   var loadedImages = 0;
   var numImages = 0;
   // get num of sources
   for(var src in sources) {
      numImages++;
   }
   for(var src in sources) {
      images[src] = new Image();
      images[src].onload = function() {
         if(++loadedImages >= numImages) {
            callback(images);
         }
      };
      images[src].src = sources[src];
   }
}

function initPicturesByType(constructor, num, width, height, opts) {
   var minx = opts ? (opts.minx ? opts.minx : 0) : 0;
   var maxx = opts ? (typeof opts.maxx != 'undefined' ? opts.maxx : window.innerWidth) : window.innerWidth;
   var miny = opts ? (opts.miny ? opts.miny : 0) : 0;
   var maxy = opts ? (typeof opts.maxy != 'undefined' ? opts.maxy : window.innerHeight) : window.innerHeight;
   var types = [];
   for(var i = 0; i < num; i++) {
      types.push(new constructor(generatePosition(minx, maxx), 
         generatePosition(miny, maxy), width, height, 
         generatePosition(Math.PI/10, -1*Math.PI/10))); 
   }
   return types;
}

   // return Math.random() * (Math.PI/6 - -1*Math.PI/6) + -1*Math.PI/6;
   
function generatePosition(min, max) {
   return Math.random() * (max - min) + min;
}

var painter = function(contextWrapper, images) {

   var cw = contextWrapper; 
   var imgs = images; 

   return {
      drawPicture : function (pic) {
         cw.save();
         this.rotate(pic);
         this.opacitate(pic);
         this.paint(pic);
         cw.restore();
      },

      paint : function(pic) {
         cw.drawImage(imgs[pic.image], pic.dpx(), pic.dpy(), pic.width, pic.height);
      },

      rotate : function(pic) {
         if(typeof pic.angle != 'undefined') {
            cw.translate(pic.pivotX(), pic.pivotY());
            cw.rotate(pic.angle);
         }
      },

      opacitate : function(pic) {
         if(typeof pic.opacity != 'undefined') {
            cw.opacitate(pic.opacity);
         }
      }
   };
}

var contextWrapper = function(cxt) {

   var context = cxt;

   return { 

      opacitate : function(opacity) {
         context.globalAlpha = opacity;
      },

      rotate : function(radians) {
         context.rotate(radians);
      },

      translate : function(x, y) {
         context.translate(x, y);
      },

      save : function() {
         context.save();
      },

      drawImage : function(image, x, y, width, height) {
         context.drawImage(image, x, y, width, height);
      },

      restore : function() {
         context.restore();
      }
   }
};

function canvas(sources, canvasId, width, height, pictures) {
   var canvas = document.getElementById(canvasId),
   context = canvas.getContext("2d");

   context.canvas.width  = width;
   context.canvas.height = height;

   var pictures = pictures;
   var imgs = {};
   var p;

   var cw = contextWrapper(context);

   loadImages(sources, function(images) {
      imgs = images;
      p = painter(cw, imgs);
      setInterval(draw, 50);
   })


   function draw() {
      canvas.width = canvas.width;

      var i = 0;
      while (i < pictures.length) {
         var pic = pictures[i];
         if(pic.cleanUp) {
            pictures.splice(i, i+1);
         }
         else {
            pic.draw(p); 
            i++;
         }
      }
   }
   return canvas;
}

(function(){
   var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

   // The base Class implementation (does nothing)
   this.Class = function(){};

   // Create a new Class that inherits from this class
   Class.extend = function(prop) {
      var _super = this.prototype;

      // Instantiate a base class (but only create the instance,
         // don't run the init constructor)
         initializing = true;
         var prototype = new this();
         initializing = false;

         // Copy the properties over onto the new prototype
         for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
               return function() {
                  var tmp = this._super;

                  // Add a new ._super() method that is the same method
                  // but on the super-class
                  this._super = _super[name];

                  // The method only need to be bound temporarily, so we
                  // remove it when we're done executing
                  var ret = fn.apply(this, arguments);        
                  this._super = tmp;

                  return ret;
               };
            })(name, prop[name]) : prop[name];
         }

         // The dummy class constructor
         function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
               this.init.apply(this, arguments);
         }

         // Populate our constructed prototype object
         Class.prototype = prototype;

         // Enforce the constructor to be what we expect
         Class.prototype.constructor = Class;

         // And make this class extendable
         Class.extend = arguments.callee;

         return Class;
   };

})();

var Pictures = Class.extend({
   init: function(image, x, y, width, height, angle){
      this.image = image;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.angle = angle;

      this.cleanUp = false;
      this.dy = 0;
      this.dx = 0;
      this.counter = 0;
   },
   pivotX : function() {
      return this.x+(this.width/2);
   },
   pivotY : function() {
      return this.y+(this.height);
   },
   dpx : function() {
      return 0-(this.width/2) + this.dx;
   },
   dpy : function() {
      return 0-this.height + this.dy;
   },
   draw : function(painter) {
      painter.drawPicture(this);
   } 
});

var Hina = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("hinaArmless", x, y, width, height, angle);
      this.hina1 = this.image; 
      this.hina2 = "hina2"; 
      this.angle = 0;
      this.arm1 = new Arm(x+width/4, y+height/5, width/2, height/4, 0);
      this.arm2 = new Arm(x+width/4, y+height/5, width/2, height/4, 0);
      this.previousDy = this.dy;
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.dx = this.arm1.dx = this.arm2.dx = this.counter*100;
      this.dy = this.arm1.dy = this.arm2.dy = Math.sin(this.counter*4)*50;
      this.arm1.angle = 0.5 + Math.sin(this.counter*2)/2; 
      this.arm2.angle = 0.5 + Math.sin(this.counter*2)/4; 
      this.previousAngle = this.angle;
      if(this.previousDy > this.dy) {
         this.image = this.hina1;
      }
      else {
         this.image = this.hina2;
      }
      painter.drawPicture(this);
      painter.drawPicture(this.arm2);
      painter.drawPicture(this);
      painter.drawPicture(this.arm1);
   }
});

var Arm = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("hinaArm", x, y, width, height, angle);
   },
   pivotX : function() {
      return this.x + (this.width/10) + this.dx;
   },
   pivotY : function() {
      return this.y + (this.height/3) + this.dy;
   },
   dpx : function() {
      return (0 - (this.width/10));
   },
   dpy : function() {
      return (0 - (this.height/3));
   }
});

var FireEngine = Pictures.extend({
   init : function(x, y, width, height, velocity) {
      this._super("fireEngine", x, y, width, height, 0);
      this.fireEngineLeft = this.image;
      this.fireEngineRight = "fireEngineRight";
      this.counter = 0;
      this.velocity = velocity;
   },
   draw : function(painter) {
      this.dx = ++this.counter * this.velocity; 
      if(this.dx < 0) {
         this.image = this.fireEngineLeft;
      }
      else {
         this.image = this.fireEngineRight;
      }
      this.dy = Math.sin(this.counter*200);
      painter.drawPicture(this);
   }
});

var TallFlower = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("tallFlower", x, y, width, height, angle);
      this.tallFlower = this.image; 
      this.tallFlowerBlown = "tallFlowerBlown"; 
      this.previousAngle = this.angle;
      this.shift = generatePosition(1,2);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.previousAngle = this.angle;
      this.angle = this.angle + 
         (Math.sin(this.counter-(Math.PI/this.shift))/150); 
      if(this.previousAngle > this.angle) {
         this.image = this.tallFlower;
      }
      else {
         this.image = this.tallFlowerBlown;
      }
      painter.drawPicture(this);
   }
});

var Flower = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("flower", x, y, width, height, angle);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.dx = Math.sin(this.counter*2)*25;
      painter.drawPicture(this);
   }
});

var Chicken = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("chicken", x, y, width, height, angle);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      // speed of bounce
      var point = Math.sin(this.counter*15);
      // height of bounce
      this.dy = point*10;
      if(point < -0.99) {
         this.angle = generatePosition();
      }
      painter.drawPicture(this);
   }
});

var PeckingChicken = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("peckingChicken", x, y, width, height, angle);
      this.chicken1 = this.image;
      this.chicken2 = "peckingChickenPecking";
      this.angle = 0;
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      if((Math.round(this.counter*10) / 10) % 3 == 0) {
         this.image = this.chicken2;
      }
      else {
         this.image = this.chicken1;
      }
      painter.drawPicture(this);
   }
});

var MoveAndFade = Pictures.extend({
   init : function(image, x, y, width, height, angle) {
      this._super(image, x, y, width, height, angle);
      this.opacity = 1.0;
   },
   draw : function(painter) {
      this.dy = this.dy + -5;
      if((this.y + this.dy) < 300) {
         if(this.opacity > 0.05) {
            this.opacity = this.opacity - 0.025;
         }
         else {
            this.opacity = 0;
            this.cleanUp = true;
         }
      }
      painter.drawPicture(this);
   }
});


