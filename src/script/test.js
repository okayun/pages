
// 読み込み時
// 場合分けすること
onload = function () {
    canvas = document.getElementById('canvas_test');
    ctx = canvas.getContext('2d');
    q_table = document.getElementById('q_table');
    demo_message = document.getElementById('demo_message');
    demo_canvas = document.getElementById('demo');
    demo_ctx = demo_canvas.getContext('2d');

    // 画像の読み込みを考慮
    Maze.init();
    Demo.init();
    setTimeout('Maze.draw()', 200);
    setTimeout('Demo.draw()', 210);
    setTimeout('Maze.drawQTable()', 250);
}

