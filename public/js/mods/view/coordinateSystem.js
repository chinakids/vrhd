/**
 * @fileoverview 场景视图
 * @authors
	Tony.Liang <pillar0514@gmail.com>
 * @description 显示3D场景的界面
 */
define('mods/view/coordinateSystem',function(require,exports,module){

	var $ = require('lib');
	var $view = require('lib/mvc/view');
	var $tpl = require('lib/kit/util/template');
	var $CoordinateSystemModel = require('mods/model/coordinateSystem');
	var $computeOrientationToTransform = require('mods/util/computeOrientationToTransform');
	var $socket = require('mods/channel/socket');

	var TPL = $tpl({
		box : [
			'<div class="coordinate-system">',
				'<div class="box-cs"  data-role="axis-box">',
					'<div class="axis ax">',
						'<div class="direction"></div>',
					'</div>',
					'<div class="axis ay">',
						'<div class="direction"></div>',
					'</div>',
					'<div class="axis az">',
						'<div class="direction"></div>',
					'</div>',
				'</div>',
			'</div>'
		]
	});

	var CoordinateSystem = $view.extend({
		defaults : {
			//是否为视线设备
			isSightDevice : true,
			//是否显示坐标轴
			showAxis : true,
			template : TPL.box,
			personModel : null,
			parent : null
		},
		build : function(){
			var conf = this.conf;
			this.model = new $CoordinateSystemModel({
				showAxis : conf.showAxis
			});
			this.personModel = conf.personModel;
			this.insert();
			this.setStyles();
			this.checkAxis();

			//构建初始化场景
			setTimeout(function(){
				this.compute({
					'alpha' : 0,
					'beta' : 89,
					'gamma' : 0
				});
			}.bind(this));
		},
		insert : function(){
			this.role('root').appendTo(this.conf.parent);
		},
		setEvents : function(action){
			var proxy = this.proxy();
			var model = this.model;
			this.delegate(action);

			//如果是视线设备，接收该设备的重力感应数据
			//否则从网络事件获取重力感应数据
			if(this.conf.isSightDevice){
				if (window.DeviceOrientationEvent) {
					window.addEventListener('deviceorientation', proxy('compute'));
				}
			}else{
				$socket.on('deviceorientation', proxy('sync'));
			}
			model.on('change:transform', proxy('setCoordinateSystem'));
		},
		//计算坐标系基于当前重力感应数据的变换
		compute : function(event){
			var transform = $computeOrientationToTransform(event);
			var data = {
				'alpha' : event.alpha,
				'beta' : event.beta,
				'gamma' : event.gamma,
				'transform' : transform
			};
			$socket.trigger('deviceorientation', data);
			this.sync(data);
		},
		//同步坐标系数据
		sync : function(data){
			this.model.set('transform', data.transform);
			this.personModel.set({
				'alpha' : data.alpha,
				'beta' : data.beta,
				'gamma' : data.gamma
			});
		},
		setStyles : function(){
			var root = this.role('root');
			root.css({
				'width' : '100%',
				'height' : '100%',
				'position' : 'absolute',
				'transform-origin' : '50% 50%',
				'transform-style' : 'preserve-3d'
			});
		},
		setCoordinateSystem : function(){
			var model = this.model;
			var transform = model.get('transform');
			this.role('root').css('transform', transform);
		},
		toggleAxis : function(){
			var model = this.model;
			model.set(!model.get('showAxis'));
		},
		checkAxis : function(){
			var axisBox = this.role('axis-box');
			if(this.model.get('showAxis')){
				axisBox.show();
			}else{
				axisBox.hide();
			}
		},
		update : function(data){
			this.model.set(data);
		},
		toJSON : function(){
			return this.model.get();
		}
	});

	module.exports = CoordinateSystem;

});

