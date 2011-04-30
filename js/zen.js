
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
                      cache: false,
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
	radio("ra1", "http://192.168.1.2:8000/ra1.mp3")
	radio("val202", "http://192.168.1.2:8000/val202.mp3")
	$.yql('select title,content from rss where url="http://www.rtvslo.si/podcasts/dogodki_in_odmevi.xml"', function(data) {
	  radio("dg", data.query.results.item[0].content.url)
	  $("#dginfo h4").html($.jPlayer.convertTime( data.query.results.item[0].content.duration) );
	  $("#dginfo h2").html(data.query.results.item[0].title).data("opis", data.query.results.item[0].title);;
	});
	//"
	$("div.tip").first().addClass("gledam").find("section").first().addClass("gledam");
	predvaja();
	$(document).touchwipe({
	     wipeLeft: function() {
	     	var gledam =$("div.tip"); 
	     	if (gledam.next().length) {
	     		$("section").removeClass("gledam");
	     		gledam.removeClass("gledam").next().addClass("gledam").find("section").first().addClass("gledam");
	     	}
	     },
	     wipeRight: function() {
	     	var gledam =$("div.tip"); 
	     	if (gledam.prev().length) {
	     		$("section").removeClass("gledam");
	     		gledam.removeClass("gledam").prev().addClass("gledam").find("section").first().addClass("gledam");
	     	};
	     },
	     wipeDown: function() {
	     	var gledam =$("section.gledam"); 
	     	if (gledam.next().length) {
		     	gledam.removeClass("gledam")
		     	.next().addClass("gledam")
	     	};
	     },
	     wipeUp: function() { 
	     	var gledam =$("section.gledam"); 
	     	if (gledam.prev().length) {
		     	gledam.removeClass("gledam")
		     	.prev().addClass("gledam")

	     	};
	     }
	});
	$(".twitn").bind("click",function() {
		var tekst = $(this).prev().prev().data("opis");
		var kaj = $(this).parent().parent().find("h1").text();
		window.open("twitter://post?message="+encodeURIComponent("Poslušam "+tekst+", na radiu " + kaj +" #siradioapp"))
	})
});
function predvaja () {
	$.yql('select * from html where url="http://www.rtvslo.si/radioprvi/spored" and xpath="//table[@class=\'schedule\']/tr/td"', function(data) {
		spored("ra1info",data);
	});

	$.yql('select * from html where url="http://www.rtvslo.si/val202/spored" and xpath="//table[@class=\'schedule\']/tr/td"', function(data) {
		spored("val202info",data);
	});
	//select * from html where url='http://www.rtvslo.si/val202/onair/index' and xpath="//body/p"
	setTimeout(predvaja,1000*(60-(new Date()).getSeconds()))
}

String.prototype.cifra = function() {
  return this.toString().length != 1?this.toString():"0"+this.toString();
}

function spored (ime,data) {
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
	  		$("#"+ime+" h2").html("<code>"+sedaj[index-1].kdaj+"</code> "+sedaj[index-1].opis).data("opis", sedaj[index-1].opis);
	  		$("#"+ime+" h4").html("<code>"+data.kdaj+"</code> "+data.opis);
	  		set = true;

	  	}	
	  })
	  if (!set) {
	  	$("#"+ime+" h2").html("<code>"+sedaj[sedaj.length-1].kdaj+"</code> "+sedaj[sedaj.length-1].opis).data("opis", sedaj[sedaj.length-1].opis);
	  	$("#"+ime+" h4").html("<code>"+sedaj[0].kdaj+"</code> "+sedaj[0].opis);
	  };
}

function radio(ime, url) {

		var dragging = false;
		
		$("#"+ime).html('<span class="player"></span><span class="circle"></span><span class="progress"></span><span class="buffer"></span><span class="drag"></span><div class="button"><span class="icon play"></span><span class="icon pause"></span></div>');
		
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




		
		// preload, update, end
		
		
		
		player.bind($.jPlayer.event.progress, function(event) {    
				
			var audio = $("#"+ime+' audio').get(0);
			var pc = 0;    
					
			if ((audio.buffered != undefined) && (audio.buffered.length != 0)) {
			 	pc = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10); 
			  	displayBuffered(pc);
			  	if(pc >= 100) {
			  		$("#"+ime+' .buffer').addClass("loaded");
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
				$("#"+ime+' .buffer').addClass("loaded");
			};
		});
		
		player.bind($.jPlayer.event.ended, function(event) {   
			$("#"+ime+' .circle').removeClass( "rotate" );
			$("#"+ime+"").removeClass( "play" );
			$("#"+ime+' .progress').css({rotate: '0deg'});
		});
		
		player.bind($.jPlayer.event.pause, function(event) {   
			$("#"+ime+' .circle').removeClass( "rotate" );
			$("#"+ime+"").removeClass( "play" );
			$("#"+ime+' .progress').css({rotate: '0deg'});
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
				$("#"+ime+"").addClass( "play" );
				player.jPlayer("play");
			} else {
				$("#"+ime+' .circle').removeClass( "rotate" );
				$("#"+ime+"").removeClass( "play" );
				player.jPlayer("stop");
			}
		};
		
		
		
		
		// draggin
		
		var clickControl = $("#"+ime+' .drag');
		
		clickControl.grab({
			onstart: function(){
				dragging = true;
				$("#"+ime+' .button').css( "pointer-events", "none" );
				
			}, onmove: function(event){
				var pc = getArcPc(event.position.x, event.position.y);
				player.jPlayer("playHead", pc).jPlayer("play");
				displayProgress(pc);
				
			}, onfinish: function(event){
				dragging = false;
				var pc = getArcPc(event.position.x, event.position.y);
				player.jPlayer("playHead", pc).jPlayer("play");
				$("#"+ime+' .button').css( "pointer-events", "auto" );
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