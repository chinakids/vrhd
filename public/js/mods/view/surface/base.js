/**
 * @fileoverview 表面背景基类
 * @authors
	Tony.Liang <pillar0514@gmail.com>
 * @description 表面背景基类定义表面背景的基本属性
 */
define('mods/view/surface/base',function(require,exports,module){

	var $ = require('lib');
	var $view = require('lib/mvc/view');
	var $tpl = require('lib/kit/util/template');
	var $baseModel = require('mods/model/surface/base');

	var TPL = $tpl({
		box : '<div class="surface"></div>'
	});

	var Base = $view.extend({
		defaults : {
			name : 'name',
			path : '',
			template : TPL.box,
			parent : null
		},
		build : function(){
			var conf = this.conf;
			this.path = [conf.path, conf.name].join('.');
			this.getModel();
			this.insert();
			this.setSize();
			this.setStyles();
		},
		setEvents : function(action){
			var proxy = this.proxy();
			this.delegate(action);
		},
		getModel : function(){
			this.model = new $baseModel();
		},
		insert : function(){
			var parent = this.conf.parent;
			this.role('root').appendTo(parent.role('root'));
		},
		setSize : function(){
			//设置大小
		},
		setStyles : function(){
			//设置样式
		},
		start : function(){

		},
		update : function(data){
			this.model.set(data);
		},
		toJSON : function(){
			var data = this.model.get();
			return data;
		}
	});

	module.exports = Base;

});
