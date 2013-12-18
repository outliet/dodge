/* kinds */
enyo.kind({
	name: "SW.List",
	kind: "List",
	//fit: true,
	style: "width: 120px;",
	handlers: {
		onSetupItem: "setupItem"
	},
	components: [
		{ name: "item", components: [
			{ name: "text", style: "float: right;" },
			{ name: "index" }
		]}
	],
	setupItem: function( inSender, inEvent ) {
		var i = inEvent.index;
		this.$.text.setContent( window.records[i] );
		this.$.index.setContent( i+1 );
	}
});
enyo.kind({
	name: "SW.Settings",
	kind: "onyx.Popup",
	style: "width: 250px",
	components: [
		{ content : "Initial Shots" },
		{ name: "initial_shots", content: window.initial_shots, style: "width: 100%; text-align: center;" },
		{ kind: "onyx.Slider", value: window.initial_shots, onChange: "changeValue" },
		{ content : "Shoot Period" },
		{ name: "shoot_period", content: window.shoot_interval, style: "width: 100%; text-align: center;" },
		{ kind: "onyx.Slider", min: 30, max: 150, value: window.shoot_interval, onChange: "changeValue" },
		{ content : "1 / Missile Speed" },
		{ name: "chase_period", content: window.chase_interval, style: "width: 100%; text-align: center;" },
		{ kind: "onyx.Slider", min: 5, max: 15, value: window.chase_interval, onChange: "changeValue" },
		{ content : "Guide Period" },
		{ name: "guide_period", content: window.guide_period, style: "width: 100%; text-align: center;" },
		{ kind: "onyx.Slider", min: 10, max: 50, value: window.guide_period, onChange: "changeValue" },
		{ content: "* ps : restart to apply *" },
		{ kind: "onyx.Button", content: "Reset Records", ontap: "reset_records" }
	],
	changeValue: function ( inSender, inEvent ) {
		var n = inSender.name;
		var v = Math.round( inEvent.value );
		if( n == "slider" ) {
			this.$.initial_shots.setContent( v );
			window.initial_shots = v;
		} else if( n == "slider2" ) {
			this.$.shoot_period.setContent( v );
			window.shoot_interval = v;
		} else if( n == "slider3" ) {
			this.$.chase_period.setContent( v );
			window.chase_period = v;
		} else {
			this.$.guide_period.setContent( v );
			window.guide_period = v;
		}
	},
	reset_records: function () {
		window.localStorage.records = [];
		window.records = [];
		enyo.$.dodge_list.count = 0;
		enyo.$.dodge_list.update();
	}
});
enyo.kind({
	name: "SW.Dodge",
	kind: "enyo.Control",
	style: "background: linear-gradient( to right, #eeeeee 0%,#0e0e0e 100%);",
	game_width : 600,
	game_height: 400,
	components: [
		{ kind: "enyo.FittableColumns", components: [
			{ name: "start", kind: "enyo.Button", content: "start", ontap: "start" },
			{ name: "stop", kind: "enyo.Button", content: "stop", ontap: "stop" },
			{ kind: "enyo.Button", content: "records", ontap: "showRecords" },
			{ kind: "enyo.Button", content: "settings", ontap: "showSettings" },
			{ content: "bullets :", style: "padding-left: 5px; padding-right: 5px; display:inline;" },
			{ name: "count", content: "0", style: "display:inline;" },
			{ content: "records :", style: "padding-left: 5px; padding-right: 5px; display:inline;" },
			{ name: "record", content: "0", style: "display:inline;" }
		]},
		{ name: "records", kind: "onyx.Popup", style: "opacity: 0.7;", components: [ { kind: "SW.List" } ] },
		{ name: "settings", kind: "SW.Settings" },
		{ kind: "enyo.Canvas", ondrag: "move", color: "black",
			components: [
				{ kind: "canvas.Rectangle", bounds: { l:0, t:0, w: this.game_width, h: this.game_height }, color: "black" },
				{ name: "player", kind: "canvas.Circle", bounds: { l: this.game_width/2, t: this.game_height/2, w: 5 }, color: "blue" }
		]},
		{ name: "notice", content: "PRESS ENTER TO START", style: "position: absolute; color: gray; ", ontap: "start" },
		{ kind: "enyo.Signals",  onkeydown: "downhandler", onkeyup: "uphandler" }
	],
	create: function ( ) {
		this.inherited( arguments );
		this.$.stop.hide();
		if( window.localStorage ) {
			if( window.localStorage.records ) {
				window.records = JSON.parse( window.localStorage.records );
				var l = this.$.list;
				l.count = window.records.length;
				l.update();
			}
		}
		this.setinit();
		this.updateSize();
	},
	setinit: function () {
		window.hit_range = 3.5;
		window.initial_shots = 20;
		window.shoot_interval = 90;
		window.chase_interval = 7;
		window.move_interval = 7;
		window.guide_period = 30;
		this.$.settings.$.slider.setValue( window.initial_shots );
		this.$.settings.$.slider2.setValue( window.shoot_interval );
		this.$.settings.$.slider3.setValue( window.chase_interval );
		this.$.settings.$.slider4.setValue( window.guide_period );
	},
	resizeHandler : function() {
		this.inherited(arguments);
		this.updateSize();
	},
	updateSize : function() {
		if( !this.started ) {
			if( window.innerWidth > window.innerHeight ) {
				this.game_width = 600;
				this.game_height = 400;
			} else {
				this.game_width = 400;
				this.game_height =600;
			}
			this.$.canvas.setAttribute( "width", this.game_width );
			this.$.canvas.setAttribute( "height", this.game_height );
			this.$.rectangle.setBounds( { l:0, t:0, w: this.game_width, h: this.game_height } );
			this.$.player.setBounds( { l: this.game_width/2, t: this.game_height/2, w: 5 } );
			this.$.notice.setBounds( { left: this.game_width/2-100, top: this.game_height*2/3 } );
			this.$.canvas.update();
		}
	},
	showRecords: function ( inSender, inEvent ) {
		var p = this.$.records;
		if( p.pressed ) {
			p.pressed = false;
			p.hide();
		} else {
			p.pressed = true;
			p.show();
		}
	},
	showSettings: function ( inSender, inEvent ) {
		this.$.settings.showAtEvent( inEvent );
	},
	downhandler : function ( inSender, inEvent ) {
		if( inEvent.keyCode == 37 && ! this.moveleft ) {
			// left
			this.moveleft = window.setInterval( enyo.bind( this, "move_left" ), window.move_interval );
		}
		if ( inEvent.keyCode == 38 && ! this.moveup ) {
			// up
			this.moveup = window.setInterval( enyo.bind( this, "move_up" ), window.move_interval );
		}
		if ( inEvent.keyCode == 39 && ! this.moveright ) {
			// right
			this.moveright = window.setInterval( enyo.bind( this, "move_right" ), window.move_interval );
		}
		if ( inEvent.keyCode == 40 && ! this.movedown ) {
			// down
			this.movedown = window.setInterval( enyo.bind( this, "move_down" ), window.move_interval );
		}
		if( inEvent.keyCode == 13 ) {
			this.start();
		}
	},

	uphandler : function ( inSender, inEvent ) {
		if( inEvent.keyCode == 37 ) {
			// left
			window.clearInterval( this.moveleft );
			this.moveleft = false;
		} else if ( inEvent.keyCode == 38 ) {
			// up
			window.clearInterval( this.moveup );
			this.moveup = false;
		} else if ( inEvent.keyCode == 39 ) {
			// right
			window.clearInterval( this.moveright );
			this.moveright = false;
		} else if ( inEvent.keyCode == 40 ) {
			// down
			window.clearInterval( this.movedown );
			this.movedown = false;
		}
	},
	move: function (inSender, inEvent) {
		var b = this.$.player.getBounds();
		b.l += inEvent.ddx;
		b.t += inEvent.ddy;
		if( b.l < 0 ) b.l = 0;
		if( b.l > this.game_width ) b.l = this.game_width;
		if( b.t < 0 ) b.t = 0;
		if( b.t > this.game_height ) b.t = this.game_height;
		this.$.player.setBounds(b);
    },
	move_left: function ( ) {
		var b = this.$.player.getBounds();
		if( b.l > 0 ) b.l--;
		this.$.player.setBounds( b );
	},
	move_up: function ( ) {
		var b = this.$.player.getBounds();
		if( b.t > 0 ) b.t--;
		this.$.player.setBounds( b );
	},
	move_right: function ( ) {
		var b = this.$.player.getBounds();
		if( b.l < this.game_width ) b.l++;
		this.$.player.setBounds( b );
	},
	move_down: function ( ) {
		var b = this.$.player.getBounds();
		if( b.t < this.game_height ) b.t++;
		this.$.player.setBounds( b );
	},
	
	shoot: function ( ) {
		this.$.record.setContent( ( new Date() - this.time ) / 1000 );
		
		var direction = enyo.irand( 4 );
		// 0~3 = left, right, top, bottom
		var x, y, vx, vy;
		if( direction === 0 ) {
			x = 0;
			y = this.game_height * Math.random();
			vy = 2 * Math.random() - 1;
			vx = Math.sqrt( 1 - vy * vy );
		} else if( direction == 1 ) {
			x = this.game_width;
			y = this.game_height * Math.random();
			vy = 2 * Math.random() - 1;
			vx = - Math.sqrt( 1 - vy * vy );
		} else if( direction == 2 ) {
			x = this.game_width * Math.random();
			y = 0;
			vx = 2 * Math.random() - 1;
			vy = Math.sqrt( 1 - vx * vx );
		} else if( direction == 3 ) {
			x = this.game_width * Math.random();
			y = this.game_height;
			vx = 2 * Math.random() - 1;
			vy = - Math.sqrt( 1 - vx * vx );
		}
		
		var color = "red";
		var guided = false;
		if( enyo.irand( window.guide_period ) === 0 ) {
			// guided missile
			color = "yellow";
			guided = true;
		}
		
		if( ! this.bullets ) {
			this.bullets = [];
		}
		var bs = this.bullets;
		var pos = bs.length;
		
		bs[ pos ] = this.$.canvas.createComponent( {
			kind: "canvas.Circle",
			bounds: { l: x, t: y, w: 2.5 },
			vx: vx,
			vy: vy,
			color: color,
			guided: guided
		});
		this.$.canvas.update();
	},
	
	chase: function ( ) {
		var bs = this.bullets;
		var p = this.$.player.getBounds();
		var hit = false;
		var hasNull = false;
		if( bs ) {
			this.$.count.setContent( bs.length );
			for( var i = 0; i < bs.length; i++ ) {
				// chase
				var b = bs[i].getBounds();
				
				if( bs[i].guided ) {
					var dx, dy, rate;
					dx = p.l - b.l;
					dy = p.t - b.t;
					rate = 0.01;
					bs[i].vx *= 1 - rate;
					bs[i].vy *= 1 - rate;
					bs[i].vx += rate * dx / Math.sqrt( dx* dx + dy * dy );
					bs[i].vy += rate * dy / Math.sqrt( dx* dx + dy * dy );
					if( enyo.irand( 500 ) === 0 ) {
						bs[i].guided = false;
						bs[i].color = "red";
						var v = Math.sqrt( bs[i].vx * bs[i].vx + bs[i].vy * bs[i].vy );
						bs[i].vx /= v;
						bs[i].vy /= v;
					}
				}
				
				b.l += bs[i].vx;
				b.t += bs[i].vy;

				bs[i].setBounds( b );
				if( b.l + window.hit_range > p.l && b.l - window.hit_range < p.l && b.t + window.hit_range > p.t && b.t - window.hit_range < p.t ) {
					hit = true;
				}
				if( b.l < 0 || b.l > this.game_width || b.t < 0 || b.t > this.game_height ) {
					// delete out of bounds
					bs[i].destroy();
					bs[i] = null;
					hasNull = true;
				}
			}
			if( hasNull ) {
				bs.sort();
				bs.splice( bs.indexOf( null ) );
			}
			this.$.canvas.update();
		}
		if( hit ) {
				this.stop();
		}
	},
	
	start: function ( ) {
		if ( ! this.started ) {
			for( var i = 0; i < window.initial_shots; i++ ) {
				this.shoot();
			}
			var p = this.$.player.getBounds();
			p.t = this.game_height / 2;
			p.l = this.game_width / 2;
			
			this.$.player.setBounds( p );
		
			this.shooting = window.setInterval( enyo.bind( this, "shoot" ), window.shoot_interval );
			this.chasing = window.setInterval( enyo.bind( this, "chase"), window.chase_interval );
			this.time = new Date();
			
			this.started = true;
			
			this.$.start.hide();
			this.$.stop.show();
			this.$.records.hide( );
			this.$.notice.hide();
		}
	},
	
	stop: function ( ) {
		window.clearInterval( this.shooting );
		window.clearInterval( this.chasing );
		this.started = false;
		var bs = this.bullets;
		if( bs ) {
			for( var i = 0; i < bs.length; i++ ) {
				bs[i].destroy();
			}
			this.bullets = [];
		}

		this.$.start.show();
		this.$.stop.hide();
		this.$.notice.show();
		
		if( !window.records ) {
			window.records = [];
		}
		window.records.push( this.$.record.getContent() * 1000 );
		window.records.sort( function(a,b){ if(a<b) return 1; if(a>b) return -1; return 0; } );
		window.records.splice( 20 );

		var l = this.$.list;
		var wr = window.records;
		window.localStorage.records = JSON.stringify( wr );
		l.count = wr.length;
		l.update();
		this.$.records.show( );
		
	}
});
var App = new SW.Dodge();
App.renderInto(document.body);
