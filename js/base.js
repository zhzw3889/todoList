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
	$task_detail_content_input, //  用于修改content的input
	$checkbox_complete
    ;

    init();

    // 初始化
    function init() {
	task_list = store.get('task_list') || [];
	// 刪除無效的index項
	for(var i = 0; i < task_list.length; i++) {
	    if( !task_list[i] ) {
		task_list.splice(i, 1);
	    }
	}
	// 開始就渲染，即開始就顯示原來的item信息
	if( task_list.length ) {
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
	if( !new_task.content ) {
	    return;
	}
	// 存入新task值
	if( add_task(new_task) ) {
	    // render_task_list();
	    // new_task的complete屬性默認爲false
	    //new_task.complete = false;
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
	    var real_index = get(index);
	    var tmp = confirm('确定删除?');
	    // 點擊確定則刪除否則返回null
	    return tmp ? delete_task(real_index) : null;
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
	    var index = $item.data('index');
	    // 找到數組中的實際對應的real_index
	    var real_index = get(index);
	    show_task_detail(real_index);
	});
    }

    // 監聽完成task事件，單選框選中
    function listen_checkbox_complete() {
	$checkbox_complete.on('click',function() {
	    var $this = $(this);
	    var index = $this.parent().parent().data('index');
	    // 這裏的index與的task_list[index]不是同一個
	    var real_index = get(index);
	    var item = task_list[real_index];

	    // 對item對象增加complete特性，取反
	    if( item && item.complete ) {
		update_task(real_index, {complete: false});
	    }
	    else {
		update_task(real_index, {complete: true});
	    }
	});
    }

    function get(index) {
	// 尋找index對應的task_list[real_index]數組中real_index
	var real_index;
	// 取得index對應的item的content
	// eq中不能传入变量，用字符串相加的方式解决
	// var item_content = $('.task-content:eq(' + index + ')').text();
	var item_content = $('[data-index=' + index +'] span:eq(1)').text();

	// 尋找對應的task_list項
	for(var j = 0; j < task_list.length; j++) {
	    if (task_list[j].content == item_content) {
		real_index = j;
		return real_index;
	    }
	}

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
	if( !task_list[index] ) {
	    return;
	}

	task_list[index] = $.extend({}, task_list[index], data); // 合併舊數據
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
	var complete_items = [];
	var $task;
	// 計算未打完成標記的item個數，以計算index
	var num_of_uncomplete = 0;

	// index從0開始
	for(var i = 0; i < task_list.length; i++) {
	    // 不是$task_list[i]，切記！
	    var item = task_list[i]; 
	    if( item && item.complete ) {
		complete_items.push(item);
	    }
	    else {
		// 這裏的參數顯然不能用i，否則難免會產生與後面的
		// completed的item的index產生重合的問題，從而導致
		// 後面的item間的耦合
		$task = render_task_item(item, num_of_uncomplete);
		// 不用append，新加的任務放在最前面
		$task_list.prepend($task);
		num_of_uncomplete++;
	    }
	}

	for( var k = 0; k < complete_items.length; k++) {
	    $task = render_task_item(complete_items[k], num_of_uncomplete+k);
	    if( !$task ) continue;
	    $task.addClass('completed');
	    $task_list.append($task);
	}

	$task_delete_trigger = $('.action.delete');
	$task_detail_trigger = $('.action.detail');
	$checkbox_complete = $('.task-list .complete[type=checkbox]');
	// 每次render後都保持監聽狀態
	listen_task_delete();
	listen_task_detail();
	listen_checkbox_complete();
    }

    // 渲染单条task模板
    function render_task_item(data, index){
	// 如果沒有會出現content未定義的情況
	// 應該包含index爲0時的情況
	if( !data ){
	    return;
	}

	var list_item_tpl =
	    '<div class="task-item" data-index="' + index + '" >' + 
	    '<span><input class="complete"' +
	    (data.complete ? 'checked="checked"' : "") + // 直接checked不行，why？
	    'type="checkbox"/></span>' +
	    '<span class="task-content">' + data.content + '</span>' +
	    '<span class="fr">' + 
	    '<span class="action delete"> 删除</span>' +
	    '<span class="action detail"> 详细</span>' +
	    '</span>' +
	    '</div>';
	
	return $(list_item_tpl);
    }
})();//本地域


