/* Demo 用 */
var Demo = {};

Demo.N = 8;
Demo.EDGE = 100;
// 初期状態
Demo.arr = [0, 1, 2, 3, 4, 5, 6, 7];
Demo.tasks = new Queue();
Demo.imgs = new Array();
Demo.isRunning = false;
Demo.kindOfSort = 1;

Demo.init = function () {
    // demo_ctx.clearRect(0, 0, demo_canvas.width, demo_canvas.height);
    arrayShuffle(Demo.arr);
    var initTask = new Task();
    initTask.SetState(Demo.arr);
    initTask.SetColor([0, 0, 0, 0, 0, 0, 0, 0]);
    Demo.tasks.Push(initTask);
    Demo.sendMessage();

    for (var i = 0; i < Demo.N; ++i) {
        Demo.imgs[i] = new Image();
        Demo.imgs[i].addEventListener("load", function () {
            // drawImage を実行する文をここに置く
            console.log("ok");
        }, false);
        Demo.imgs[i].src = "./img/" + (i + 1) + ".png";
    }
}

Demo.shuffle = function () {
    if (Demo.isRunning) {
        Demo.isRunning = false;
        clearInterval(runningFunc);
    }
    Demo.init();
    Demo.draw();
}

Demo.arraySort = function () {
    // 挿入ソート
    if (Demo.kindOfSort == 1) {
        Demo.insertionSort();
    }
    // バブルソート
    else if (Demo.kindOfSort == 2) {
        Demo.bubbleSort();
    }
}

Demo.insertionSort = function () {

    var tmpArr = Demo.arr.concat();

    for (var i = 1; i < tmpArr.length; ++i) {
        var tmp = tmpArr[i]

        // 変更前の配列
        var tmpBeforeTask = new Task();
        var tmpBeforeColor = new Array(Demo.N);
        // ソート済みの印
        for (var k = 0; k < i; ++k) {
            tmpBeforeColor[k] = 2;
        }
        // 現在挿入しようとしている要素
        tmpBeforeColor[i] = 1;
        for (var k = i + 1; k < tmpArr.length; ++k) {
            tmpBeforeColor[k] = 0;
        }

        tmpBeforeTask.SetState(tmpArr);
        tmpBeforeTask.SetColor(tmpBeforeColor);
        Demo.tasks.Push(tmpBeforeTask);

        // 挿入位置を探す
        if (tmpArr[i - 1] > tmp) {

            var j = i;

            do {
                // 右に一つずつずらす
                tmpArr[j] = tmpArr[j - 1];
                j--;
            } while (j > 0 && tmpArr[j - 1] > tmp);

            // 挿入
            tmpArr[j] = tmp;
            tmpBeforeColor[j] = 3;
        }

        // 変更あとの配列
        var tmpAfterTask = new Task();
        var tmpAfterColor = tmpBeforeColor.concat();
        tmpAfterColor[i] = 2;
        tmpAfterTask.SetState(tmpArr);
        tmpAfterTask.SetColor(tmpAfterColor);
        Demo.tasks.Push(tmpAfterTask);
    }

    // 終了後の配列
    var tmpEndTask = new Task();
    var tmpEndColor = new Array(Demo.N);
    tmpAfterColor.fill(2);
    tmpEndTask.SetState(tmpArr);
    tmpEndTask.SetColor(tmpEndColor);
    Demo.tasks.Push(tmpEndTask);
}

Demo.bubbleSort = function () {
    var tmpArr = Demo.arr.concat();

    var swapped = false;
    var n = tmpArr.length;

    do {
        swapped = false;
        for (var i = 0; i < n - 1; ++i) {
            // 変更前の配列
            var tmpBeforeTask = new Task();
            var tmpBeforeColor = new Array(Demo.N);
            tmpBeforeColor.fill(0);
            // ソート済み
            for (var j = n; j < Demo.N; ++j) {
                tmpBeforeColor[j] = 2;
            }
            // swap 対象
            tmpBeforeColor[i] = 1;
            tmpBeforeColor[i + 1] = 1;

            tmpBeforeTask.SetState(tmpArr);
            tmpBeforeTask.SetColor(tmpBeforeColor);
            Demo.tasks.Push(tmpBeforeTask);
            if (tmpArr[i] > tmpArr[i + 1]) {

                swapped = true;
                var tmp = tmpArr[i];
                tmpArr[i] = tmpArr[i + 1];
                tmpArr[i + 1] = tmp;

            }
            // 変更あとの配列
            var tmpAfterTask = new Task();
            var tmpAfterColor = tmpBeforeColor.concat();
            tmpAfterColor[i] = 3;
            tmpAfterColor[i + 1] = 3;
            tmpAfterTask.SetState(tmpArr);
            tmpAfterTask.SetColor(tmpAfterColor);
            Demo.tasks.Push(tmpAfterTask);
        }
        n -= 1;
    } while (swapped);

    // 終了後の配列
    var tmpEndTask = new Task();
    var tmpEndColor = new Array(Demo.N);
    tmpEndColor.fill(2);
    tmpEndTask.SetState(tmpArr);
    tmpEndTask.SetColor(tmpEndColor);
    Demo.tasks.Push(tmpEndTask);
}

Demo.runSort = function () {
    if (Demo.isRunning) {
        clearInterval(Demo.runningFunc);
        Demo.tasks.Clear();

        arrayShuffle(Demo.arr);
        var initTask = new Task();
        initTask.SetState(Demo.arr);
        initTask.SetColor([0, 0, 0, 0, 0, 0, 0, 0]);
        Demo.tasks.Push(initTask);
    }

    Demo.arraySort();
    Demo.runningFunc = setInterval('Demo.draw()', 750);
    Demo.isRunning = true;
}

Demo.draw = function () {
    if (Demo.tasks.IsEmpty()) {
        if (Demo.isRunning) {
            console.log("sort end");
            clearInterval(Demo.runningFunc);
            Demo.isRunning = false;
        }
        return;
    }

    // タスクを一つ取り出して
    var task = Demo.tasks.Front();
    Demo.tasks.Pop();
    demo_ctx.beginPath();
    demo_ctx.lineWidth = 1;

    // 一旦全部消す
    //demo_ctx.clearRect(0, 0, demo_ctx.canvas.clientWidth, demo_ctx.canvas.clientHeight);
    demo_ctx.clearRect(0, 0, demo_canvas.width, demo_canvas.height);
    demo_ctx.fillStyle = 'rgb(255, 255, 255)';
    // demo_ctx.fillRect(0, 0, demo_ctx.canvas.clientWidth, demo_ctx.canvas.clientHeight);
    demo_ctx.fillRect(0, 0, demo_canvas.clientWidth, demo_canvas.clientHeight);

    for (var i = 0; i < Demo.N; ++i) {
        var tmpHeight = 50;
        var tmpWidth = 10 + Demo.EDGE * i + 10 * i;

        if (task.color[i] == 1 || task.color[i] == 3) {
            tmpHeight -= 20;
        }

        demo_ctx.drawImage(Demo.imgs[task.state[i]], tmpWidth, tmpHeight, Demo.EDGE, Demo.EDGE);

        if (task.color[i] == 0) {
            demo_ctx.strokeStyle = 'rgb(0, 0, 0)';
        }
        else if (task.color[i] == 1) {
            demo_ctx.strokeStyle = 'rgb(255, 0, 0)';
        }
        else if (task.color[i] == 2) {
            demo_ctx.strokeStyle = 'rgb(0, 255, 0)';
        }
        else if (task.color[i] == 3) {
            demo_ctx.strokeStyle = 'rgb(0, 0, 255)';
        }

        /* 枠線を描く */
        demo_ctx.strokeRect(tmpWidth, tmpHeight, Demo.EDGE, Demo.EDGE);
    }
}

Demo.changeKindOfSort = function () {
    Demo.kindOfSort = document.demo.kind.value;
}

Demo.sendMessage = function () {
    demo_message.innerHTML = "現在設定されているアルゴリズムは ";

    if (Demo.kindOfSort == 1) {
        demo_message.innerHTML += "<strong>挿入ソート</strong>";
    }
    else if (Demo.kindOfSort == 2) {
        demo_message.innerHTML += "<strong>バブルソート</strong>"
    }

    demo_message.innerHTML += " です";
}