;(function(){
    'use strict';
    var $form_add_task = $('.add-task');
    var new_task = {};		// Object类型
    var task_list = [];		// Array类型

    init();
    
    $form_add_task.on('submit', function(e){
	// 禁止默认行为
	e.preventDefault();
	// 获取新task的值
	new_task.content = $(this).find('input[name="content"]').val();
	// 如果新task的值为空则直接返回，否则继续执行 
	if( !new_task.content ) return;
	// 存入新task,更新task-item
	if( add_task(new_task) ){
	    render_task_list();
	}

	// console.log('new_task', new_task);
    });

    function add_task(new_task){
	// 将新task推入task_list
	task_list.push(new_task);
	// 更新localStorage
	store.set('task_list', task_list);
	// console.log('task_list', task_list);
    }

    function init(){
	task_list = store.get('task_list') || [];
    }

    function render_task_list(){
	console.log('1', 1);
    }
})();//本地域

