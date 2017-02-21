;(function(){
    'use strict';

    var $form_add_task = $('.add-task');
    var $delete_task;
    var task_list = [];

    init();
    
    $form_add_task.on('submit', function(e){
	// new_task必须在此域中，之前放在全局中出现问题
	var new_task = {};
	var $input;

	// 禁用默认行为
	e.preventDefault();
	// 获取新task值
	$input = $(this).find('input[name=content]');
	new_task.content = $input.val();
	// 如新task值为空，则直接返回，否则继续执行
	if( !new_task.content ){
	    return;
	}
	// 存入新task值
	if( add_task(new_task) ){
	    // render_task_list();
	    $input.val('');	// null也可
	}
    });

    // 查找并监听所有删除按钮的点击事件
    function listen_task_delete(){
	$delete_task.on('click', function(){
	    var $this = $(this);
	    // 找到删除按钮所在的task元素
	    var $item = $this.parent().parent();
	    var index = $item.data('index');
	    var tmp = confirm('确定删除?');
	    
	    return tmp ? delete_task(index) : null;
	});
    }
    
    function add_task(new_task){
	// 将新task推入task-list
	task_list.push(new_task);
	// 更新localStorage
	refresh_task_list();
	// 用作if语句的布尔表达式
	return true;
    }

    // 刷新localStorage并渲染模板(tpl)
    function refresh_task_list(){
	store.set('task_list', task_list);
	render_task_list();
    }

    // 删除一条task
    function delete_task(index){
	// 如果没有index或者index不存在，则直接返回
	if( index === undefined || !task_list[index] ){
	    return;
	}
	delete task_list[index];
	refresh_task_list();
    }

    function init(){
	task_list = store.get('task_list') || [];
	if( task_list.length ){
	    render_task_list();
	}
    }

    // 渲染所有task模板
    function render_task_list(){
	var $task_list = $('.task-list');
	$task_list.html('');
	for(var i = 0; i < task_list.length; i++){
	    var $task = render_task_item(task_list[i], i);
	    $task_list.append($task);
	}
	$delete_task = $('.action.delete');
	listen_task_delete();
    }

    // 渲染单条task模板
    function render_task_item(data, index){
	if( !data || !index ){
	    return;
	}

	var list_item_tpl =
	    '<div class="task-item" data-index="' + index + '" >' + 
	    '<span><input name="" type="checkbox" value=""/></span>' +
	    '<span class="task-content">' + data.content + '</span>' +
	    '<span class="fr">' + 
	    '<span class="action delete"> 删除</span>' +
	    '<span class="action"> 详细</span>' +
	    '</span>' +
	    '</div>';
	return $(list_item_tpl);
    }
})();//本地域


