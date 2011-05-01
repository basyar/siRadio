Modernizr.addTest('ipad', function () {
  return !!navigator.userAgent.match(/iPad/i);
});

Modernizr.addTest('iphone', function () {
  return !!navigator.userAgent.match(/iPhone/i);
});

Modernizr.addTest('ipod', function () {
  return !!navigator.userAgent.match(/iPod/i);
});

Modernizr.addTest('android', function () {
  return !!navigator.userAgent.match(/Android 2.2/i);
});

Modernizr.addTest('appleios', function () {
  return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
});

window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      window.applicationCache.swapCache();
      if (confirm('Na voljo je nova verzija strani. Naložim?')) {
        window.location.reload();
      }
    }
  }, false);

}, false);

function murmur(key, seed) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    remainder = key.length % 4;
    bytes = key.length - remainder;
    h1 = 0x971e137b ^ seed;
    c1 = 0x95543787;
    c2 = 0x2ad7eb25;
    i = 0;

    while (i < bytes) {
        k1 = 
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(++i) & 0xff) << 8) |
          ((key.charCodeAt(++i) & 0xff) << 16) |
          ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16));
        k1 = (k1 << 11) | (k1 >>> 21);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16));
        h1 ^= k1;

        h1b = (((h1 & 0xffff) * 3) + ((((h1 >>> 16) * 3) & 0xffff) << 16));
        h1 = (((h1b & 0xffff) + 0x52dce729) + ((((h1b >>> 16) + 0x52dce729) & 0xffff) << 16));

        c1b = (((c1 & 0xffff) * 5) + ((((c1 >>> 16) * 5) & 0xffff) << 16)); 
        c1 = (((c1b & 0xffff) + 0x7b7d159c) + ((((c1b >>> 16) + 0x7b7d159c) & 0xffff) << 16));
        c2b = (((c2 & 0xffff) * 5) + ((((c2 >>> 16) * 5) & 0xffff) << 16)); 
        c2 = (((c2b & 0xffff) + 0x6bce6396) + ((((c2b >>> 16) + 0x6bce6396) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16));
        k1 = (k1 << 11) | (k1 >>> 21);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16));
        h1 ^= k1;

        h1b = (((h1 & 0xffff) * 3) + ((((h1 >>> 16) * 3) & 0xffff) << 16));
        h1 = (((h1b & 0xffff) + 0x52dce729) + ((((h1b >>> 16) + 0x52dce729) & 0xffff) << 16));
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16));
    h1 ^= h1 >>> 13;
    h1 = (((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16));
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
}

 (function($){
      $.extend(
          {
              _prepareYQLQuery: function (query, params) {
                  $.each(
                      params, function (key) {
                          var name = "#{" + key + "}";
                          var value = $.trim(this);
                          if (!value.match(/^[0-9]+$/)) {
                              value = '"' + value + '"';
                          }
                          while (query.search(name) > -1) {
                              query = query.replace(name, value);
                          }

                          var name = "@" + key;
                          var value = $.trim(this);
                          if (!value.match(/^[0-9]+$/)) {
                              value = '"' + value + '"';
                          }
                          while (query.search(name) > -1) {
                              query = query.replace(name, value);
                          }

                      }
                  );
                  return query;
              },
              yql: function (query) {
                  var $self = this;
                  var successCallback = null;
                  var errorCallback = null;

                  if (typeof arguments[1] == 'object') {
                      query = $self._prepareYQLQuery(query, arguments[1]);
                      successCallback = arguments[2];
                      errorCallback = arguments[3];
                  } else if (typeof arguments[1] == 'function') {
                      successCallback = arguments[1];
                      errorCallback = arguments[2];
                  }

                  var doAsynchronously = successCallback != null;
                  var yqlJson = {
                      url: "http://query.yahooapis.com/v1/public/yql",
                      dataType: "jsonp",
                      success: successCallback,
                      async: doAsynchronously,
                      cache: true,
                      data: {
                          q: query,
                          format: "json",
                          env: 'store://datatables.org/alltableswithkeys',
                          callback: "?"
                      }
                  }

                  if (errorCallback) {
                      yqlJson.error = errorCallback;
                  }

                  $.ajax(yqlJson);
                  return $self.toReturn;
              }
          }
      );
  })(jQuery);


$(document).ready(function() {

	//podcasti
	dodajPodcast("Dogodki in odmevi", "http://www.rtvslo.si/podcasts/dogodki_in_odmevi.xml",function(id) {
		if (!Modernizr.android && !Modernizr.appleios) {
			$("div.tip").first().remove();
			$("div.tip").first().addClass("gledam").find("section").first().addClass("gledam");
		};
		dodajPodcast("Druga jutranja kronika", "http://www.rtvslo.si/podcasts/druga_jutranja_kronika.xml",function() {});
		dodajPodcast("Lahko noč otroci", "http://www.rtvslo.si/podcasts/lahko_noc_otroci.xml",function() {});
		dodajPodcast("Odbita do bita", "http://www.rtvslo.si/podcasts/odbita_do_bita.xml",function() {});
	});

	if (Modernizr.android || Modernizr.appleios) {

		dodajRadio("Radi Študent", "http://kruljo.radiostudent.si:8000/hiq", "@radiostudent", function(id) {
			$.yql('select * from html where url="http://www.rtvslo.si/radioprvi/spored" and xpath="//table[@class=\'schedule\']/tr/td"', function(data) {
				spored(id,data);
			});	
		});
		
		dodajRadio("VAL 202", "http://94.103.65.137:8000/val202", "@val202", function(id) {
			$.yql('select * from html where url="http://www.rtvslo.si/val202/spored" and xpath="//table[@class=\'schedule\']/tr/td"', function(data) {
				spored(id,data);
			});
		});
		dodajRadio("Prvi Program", "http://192.168.1.2:8000/ra1.mp3", "@radioprvi", function(id) {
			$.yql('select * from html where url="http://www.rtvslo.si/radioprvi/spored" and xpath="//table[@class=\'schedule\']/tr/td"', function(data) {
				spored(id,data);
			});	
		});
	}

	if (Modernizr.touch){
		$(document).touchwipe({
		     wipeLeft: function() {
		     	var gledam =$("div.tip"); 
		     	if (gledam.next().length) {
		     		$("section").removeClass("gledam");
		     		gledam.removeClass("gledam").next().addClass("gledam").find("section").first().addClass("gledam");
		     		posodobi_grip();
		     	}
		     },
		     wipeRight: function() {
		     	var gledam =$("div.tip"); 
		     	if (gledam.prev().length) {
		     		$("section").removeClass("gledam");
		     		gledam.removeClass("gledam").prev().addClass("gledam").find("section").first().addClass("gledam");
		     		posodobi_grip();
		     	};
		     },
		     wipeDown: function() {
		     	var gledam =$("section.gledam"); 
		     	if (gledam.next().length) {
			     	gledam.removeClass("gledam")
			     	.next().addClass("gledam")
			     	posodobi_grip();
		     	};
		     },
		     wipeUp: function() { 
		     	var gledam =$("section.gledam"); 
		     	if (gledam.prev().length) {
			     	gledam.removeClass("gledam")
			     	.prev().addClass("gledam")
			     	posodobi_grip();
		     	};
		     }
		})
	} else {
	  // todo alternativna navigacija
	}  

	if (Modernizr.appleios) {
		$(".twitn").bind("click",function() {
			var tekst = $(this).prev().prev().data("opis");
			var kaj = $(this).parent().parent().find("h1").text();
			window.open("twitter://post?message="+encodeURIComponent("Poslušam "+tekst+", na radiu " + kaj +" #siradioapp"))
			return false;
		})
	};

	$("div.tip").first().addClass("gledam").find("section").first().addClass("gledam");
});

function dodajRadio(ime, url, twitter, trenutno_cb) {
	var id = murmur(ime);
	$( "#pustinja" ).tmpl( {
		naslov: ime,
		id: id,
		url: url,
		twitter: twitter,
	} ).appendTo( ".tip:first nav" );
	predvajalnik(id, url);
	setTimeout(function() {
		trenutno_cb(id)
	},1000*(60-(new Date()).getSeconds()));
	$('<span class="handle">'+($(".tip:first nav section").length)+'</span>').appendTo( ".tip:first .grip" )
	posodobi_grip();
	trenutno_cb(id);
}

function dodajPodcast(ime, url,cb) {
	var id = murmur(ime);
	$.yql('select title,content from rss where url="'+url+'"', function(data) {
		$( "#pustinja" ).tmpl( {
			naslov: ime,
			id: id,
			url: url,
		} ).appendTo( ".tip:last nav" );
		predvajalnik(id, data.query.results.item[0].content.url);
		$("#"+id+" article h4").html($.jPlayer.convertTime( data.query.results.item[0].content.duration) );
		$("#"+id+" article h2").html(data.query.results.item[0].title).data("opis", data.query.results.item[0].title);
		$('<span class="handle">'+($(".tip:last nav section").length)+'</span>').appendTo( ".tip:last .grip" );
		posodobi_grip();
		cb(id);
	});
}

function posodobi_grip () {
	$(".gledam .grip .handle").removeClass("izbran").parent().find(".handle:eq("+$(".tip.gledam nav section.gledam").index()+")").addClass("izbran");
}

String.prototype.cifra = function() {
  return this.toString().length != 1?this.toString():"0"+this.toString();
}

function spored (kaj, data) {
	  var id = $("#"+kaj);
	  var sedaj = [];
	  var set = false;
	  data = data.query.results.td;
	  for (var i = 0; i < data.length; i +=2) {
	  	var ure = Number(data[i].p.replace(":",""));
		  	sedaj.push({
		  		ura:ure,
		  		opis:data[i+1].p,
		  		kdaj:data[i].p
		  	});
	  };
	  sedaj.forEach(function(data, index) {
	  	var urca =Number( (new Date()).getHours().toString().cifra()+(new Date()).getMinutes().toString().cifra() );
	  	if (urca < data.ura  && !set) {
	  		id.find("article h2").html("<code>"+sedaj[index-1].kdaj+"</code> "+sedaj[index-1].opis).data("opis", sedaj[index-1].opis);
	  		id.find("article h4").html("<code>"+data.kdaj+"</code> "+data.opis);
	  		set = true;

	  	}	
	  })
	  if (!set) {
	  	id.find("article h2").html("<code>"+sedaj[sedaj.length-1].kdaj+"</code> "+sedaj[sedaj.length-1].opis).data("opis", sedaj[sedaj.length-1].opis);
	  	id.find("article h4").html("<code>"+sedaj[0].kdaj+"</code> "+sedaj[0].opis);
	  };
}

function predvajalnik(ime, url) {

		var dragging = false;
		
		// init
		
		var player = $("<div id='temp_"+ime+"'/>");
			
		player.jPlayer(
			{
				ready: function () {
	      		$(this).jPlayer("setMedia", {
					mp3: url,
	      		});
	    	},
	    	preload: "none",
	    	swfPath: "",
			supplied: "mp3"         
	  	});  
		
		player.bind($.jPlayer.event.progress, function(event) {    
				
			var audio = player.find('audio').get(0);
			var pc = 0;    
					
			if ((audio.buffered != undefined) && (audio.buffered.length != 0)) {
			 	pc = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10); 
			  	displayBuffered(pc);
			  	if(pc >= 100) {
			  		$("#"+ime+' .gplayer .buffer').addClass("loaded");
			  	} 
 
			}        
				
		});
		
		//player.bind($.jPlayer.event.loadeddata, function(event) {    
			//$("#"+ime+' .buffer').addClass("loaded");    
		//});
		
		player.bind($.jPlayer.event.timeupdate, function(event) { 
			var pc = event.jPlayer.status.currentPercentAbsolute;
			if (!dragging) { 
		    	displayProgress(pc);
			}
			if (event.jPlayer.status.currentTime) {
				$("#"+ime+' .gplayer .buffer').addClass("loaded");
			};
		});
		
		player.bind($.jPlayer.event.ended, function(event) {   
			$("#"+ime+' .gplayer .circle').removeClass( "rotate" );
			$("#"+ime+" .gplayer").removeClass( "play" );
			$("#"+ime+' .gplayer .progress').css({rotate: '0deg'});
		});
		
		player.bind($.jPlayer.event.pause, function(event) {   
			$("#"+ime+' .gplayer .circle').removeClass( "rotate" );
			$("#"+ime+" .gplayer").removeClass( "play" );
			$("#"+ime+' .gplayer .progress').css({rotate: '0deg'});
		});	

		player.bind($.jPlayer.event.play, function(event) {   
			player.jPlayer("pauseOthers"); // pause all players except this one.
		});	
		
		
		// play/pause
		
		$("#"+ime+" .button").bind('mousedown', function() {
			$(this).bind('mouseleave', function() {
				$(this).unbind('mouseleave');
				onClick();
			});
		});
		
		$("#"+ime+" .button").bind('mouseup', function() {
			$(this).unbind('mouseleave');
			onClick();
		});
		
		
		function onClick() {  		
	        if(player.data("jPlayer").status.paused) {
				$("#"+ime+" .gplayer").addClass( "play" );
				player.jPlayer("play");
			} else {
				$("#"+ime+' .gplayer .circle').removeClass( "rotate" );
				$("#"+ime+" .gplayer").removeClass( "play" );
				player.jPlayer("stop");
			}
		};
		
		
		
		
		// draggin
		
		var clickControl = $("#"+ime+' .drag');
		
		clickControl.grab({
			onstart: function(){
				dragging = true;
				$("#"+ime+' .gplayer .button').css( "pointer-events", "none" );
				
			}, onmove: function(event){
				var pc = getArcPc(event.position.x, event.position.y);
				player.jPlayer("playHead", pc).jPlayer("play");
				displayProgress(pc);
				
			}, onfinish: function(event){
				dragging = false;
				var pc = getArcPc(event.position.x, event.position.y);
				player.jPlayer("playHead", pc).jPlayer("play");
				$("#"+ime+' .gplayer .button').css( "pointer-events", "auto" );
			}
		});	
		
		
		
		
		
		
		// functions
		
		function displayProgress(pc) {
			var degs = pc * 3.6+"deg"; 
			$("#"+ime+' .progress').css({rotate: degs}); 		
		}
		function displayBuffered(pc) {
			var degs = pc * 3.6+"deg"; 
			$("#"+ime+' .buffer').css({rotate: degs}); 		
		}
		
		function getArcPc(pageX, pageY) { 
			var	self	= clickControl,
				offset	= self.offset(),
				x	= pageX - offset.left - self.width()/2,
				y	= pageY - offset.top - self.height()/2,
				a	= Math.atan2(y,x);  
				
				if (a > -1*Math.PI && a < -0.5*Math.PI) {
			   a = 2*Math.PI+a; 
			} 

			// a is now value between -0.5PI and 1.5PI 
			// ready to be normalized and applied   			
			var pc = (a + Math.PI/2) / 2*Math.PI * 10;   
			   
			return pc;
		}
};