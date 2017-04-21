;(function(){
    'use strict';

    var $form_add_task = $('.add-task'),
	$task_delete,
	$task_delete_trigger,	// 刪除按鈕，而非item
	$task_detail = $('.task-detail'),
	$task_detail_trigger,	// 詳情按鈕，而非item
	$task_detail_mask = $('.task-detail-mask'),
	task_list = [],
	$update_form,		// 用於更新form
	$task_detail_content,	// detail的content元素
	$task_detail_content_input //  用于修改content的input
    ;

    init();

    // 初始化
    function init(){
	task_list = store.get('task_list') || [];
	// 開始就渲染，即開始就顯示原來的item信息
	if( task_list.length ){
	    render_task_list();
	}
    }
    
    $form_add_task.on('submit', on_add_task_form_submit);
    $task_detail_mask.on('click', hide_task_detail);
	
    function on_add_task_form_submit(e) {
	// new_task必须在此域中，之前放在全局中出现问题
	// 每一次都新增一個對象
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
    }

    $task_detail_mask.on('click', hide_task_detail);

    // 查找并监听所有删除按钮的点击事件
    function listen_task_delete(){
	$task_delete_trigger.on('click', function(){
	    var $this = $(this);
	    // 找到删除按钮所在的task元素
	    var $item = $this.parent().parent();
	    var index = $item.data('index');
	    var tmp = confirm('确定删除?');
	    // 點擊確定則刪除否則返回null
	    return tmp ? delete_task(index) : null;
	});
    }
    
    // 監聽打開task詳情事件
    function listen_task_detail() {
	var index;

	// 雙擊item時顯示詳情，不必單擊詳情按鈕
	$('.task-item').on('dblclick', function() {
	    index = $(this).data('index');
	    show_task_detail(index);
	});
	
	$task_detail_trigger.on('click', function() {
	    var $this = $(this);
	    var $item = $this.parent().parent();
	    index = $item.data('index');
	    show_task_detail(index);
	});
    }

    
    function add_task(new_task){
	// 将新task推入task-list
	task_list.push(new_task);
	// 更新localStorage
	refresh_task_list();
	// 返回true，用作if语句的布尔表达式
	return true;
    }

    // 刷新localStorage并渲染模板(tpl)
    function refresh_task_list(){
	// 更新localStorage
	store.set('task_list', task_list);
	// 渲染模板
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

    // 顯示task詳情
    function show_task_detail(index) {
	// 生成詳情模板
	render_task_detail(index);
	//current_index = index;
	// 顯示詳情模板（默認隱藏）
	$task_detail.show();
	// 顯示mask（默認隱藏）
	$task_detail_mask.show();
    }

    // 隱藏task詳情，點擊mask時啓動
    function hide_task_detail() {
	$task_detail.hide();
	$task_detail_mask.hide();
    }

    // 更新task
    function update_task(index, data) {
	if( !index || !task_list[index] ) {
	    return;
	}

	task_list[index] = data;
	refresh_task_list();
    }

    // 渲染制定task的詳細信息
    function render_task_detail(index) {
	if( index === undefined || !task_list[index] ) {
	    return;
	}

	var item = task_list[index];

	var tpl =
	    '<form>'+
	    '<div>'+
	    '<div class="content">'+ item.content +
	    '</div>'+
	    '<div class="input-item">' +
	    '<input style="display: none;" name="content" type="text" value="'+ (item.content || '') + '"/>' + 
	    '</div>' +
	    '<div>'+
	    '<div class="disc input-item">'+
	    '<textarea name="desc">'+ (item.desc || '') +'</textarea>'+ // ||''解決undefined的問題
	    '</div>'+
	    '</div>'+
	    '<div class="remind input-item">'+
	    '<input name="remind_date" type="date" value="'+ item.remind_date +'">'+
	    '</div>'+
	    '</div>'+
	    '<div class="input-item"><button type="submit">更新</button></div>'+
	    '</form>';

	// 清空task詳情模板
	$task_detail.html('');
	// 添加新模板
	$task_detail.html(tpl);
	// 選中form，後將監聽其submit事件
	$update_form = $task_detail.find('form');
	// 選中顯示task內容的元素
	$task_detail_content = $update_form.find('.content');
	// 選中task input元素
	$task_detail_content_input = $update_form.find('[name=content]');

	$update_form.on('submit',function(e) {
	    e.preventDefault();
	    var data = {};	// data爲以前的值
	    // 獲取表單中各個input的值
	    data.content = $(this).find('[name=content]').val();
	    data.desc = $(this).find('[name=desc]').val();
	    data.remind_date = $(this).find('[name=remind_date]').val();

	    update_task(index, data);
	    hide_task_detail();
	});

	// 雙擊內容元素顯示input
	$task_detail_content.on('dblclick', function() {
	    $task_detail_content_input.show();
	    $task_detail_content.hide();
	});
    }
    
    // 渲染所有task模板
    function render_task_list(){
	var $task_list = $('.task-list');
	// 清空$task_list以從頭開始重新遍歷渲染
	$task_list.html('');
	for(var i = 0; i < task_list.length; i++){
	    var $task = render_task_item(task_list[i], i);
	    $task_list.prepend($task); // 不用append，新加的任務放在最前面
	}
	$task_delete_trigger = $('.action.delete');
	$task_detail_trigger = $('.action.detail');
	// 每次render後都保持監聽狀態
	listen_task_delete();
	listen_task_detail();
    }

    // 渲染单条task模板
    function render_task_item(data, index){
	// 如果沒有會出現content未定義的情況
	if( !data || !index ){
	    return;
	}

	var list_item_tpl =
	    '<div class="task-item" data-index="' + index + '" >' + 
	    '<span><input name="" type="checkbox" value=""/></span>' +
	    '<span class="task-content">' + data.content + '</span>' +
	    '<span class="fr">' + 
	    '<span class="action delete"> 删除</span>' +
	    '<span class="action detail"> 详细</span>' +
	    '</span>' +
	    '</div>';
	return $(list_item_tpl);
    }
})();//本地域


