;(function(){
    'use strict';

    var $form_add_task = $('.add-task');
    var new_task = {};
    var task_list = [];

    init();
    
    $form_add_task.on('submit', function(e){
	// 禁用默认行为
	e.preventDefault();
	// 获取新task值
	new_task.content = $(this).find('input[name=content]').val();
	// 如新task值为空，则直接返回，否则继续执行
	if( !new_task.content ){
	    return;
	}
	// 存入新task值
	if( add_task(new_task) ){
	    render_task_list();
	}

    });

    function add_task(new_task){
	// 将新task推入task-list
	task_list.push(new_task);
	// 更新localStorage
	store.set('task_list', task_list);
	// 用作if语句的布尔表达式
	return true;
	// console.log('task_list', task_list); 
    }

    function init(){
	task_list = store.get('task_list') || [];
    }

    function render_task_list(){
	var $task_list = $('.task-list');
	for(var i = 0; i < task_list.length; i++){
	    var $task = render_task_tpl(task_list[i]);
	    $task_list.append($task);
	}
    }

    function render_task_tpl(data){
	var list_item_tpl =
	    '<div class="task-item">' + 
	    '<span><input name="" type="checkbox" value=""/></span>' +
	    '<span class="task-content">' + data.content + '</span>' +
	    '<span>删除</span>' +
	    '<span>详细</span>' +
	    '</div>';
	return $(list_item_tpl);
    }

})();//本地域


