/* maze 用の名前空間と各種変数 */
var Maze = {};

Maze.HEIGHT = 6 + 1;
Maze.WIDTH = 6 + 1;
Maze.EDGE = 57; // デフォルトが 7x7 のため

Maze.ACTION = 4;
Maze.ALPHA = 0.05;
Maze.GAMMA = 1.0;

Maze.NONE = 0;
Maze.WALL = 1;
Maze.USED = 2;
Maze.AGENT = 3;

Maze.IMAGE_NAME = "./img/icon.png";

// 右, 上, 左, 下
Maze.vx = [1, 0, -1, 0];
Maze.vy = [0, -1, 0, 1];
Maze.isRunning = false;
Maze.field = new Array(Maze.HEIGHT);
Maze.Q = new Array(Maze.HEIGHT);
Maze.img = new Image();
Maze.agent = new Unit(1, 1);


/* Maze ここから */

Maze.init = function () {
    Maze.agent = new Unit(1, 1);
    Maze.img.src = Maze.IMAGE_NAME;

    for (var h = 0; h < Maze.HEIGHT; ++h) {
        Maze.field[h] = new Array(Maze.WIDTH);
        Maze.Q[h] = new Array(Maze.WIDTH);

        for (var w = 0; w < Maze.WIDTH; ++w) {
            Maze.Q[h][w] = new Array(Maze.ACTION);

            for (var a = 0; a < Maze.ACTION; ++a) {
                Maze.Q[h][w][a] = 0;
            }

            if ((h == 0) || (h + 1 == Maze.HEIGHT)) {
                Maze.field[h][w] = Maze.WALL;
            }
            else {
                Maze.field[h][w] = Maze.NONE;
            }
        }
        Maze.field[h][0] = Maze.field[h][Maze.WIDTH - 1] = Maze.WALL;
    }
}

// 壁を初期化する
Maze.prepareWall = function () {
    Maze.clearCanvas();

    for (var h = 1; h < Maze.HEIGHT - 1; h++) {
        for (var w = 1; w < Maze.WIDTH - 1; w++) {
            Maze.field[h][w] = Maze.NONE;
        }
    }
    for (var h = 2; h < Maze.HEIGHT - 1; h += 2) {
        for (var w = 2; w < Maze.WIDTH - 1; w += 2) {
            Maze.field[h][w] = Maze.WALL;
        }
    }

    Maze.draw();
}

// 棒倒し法
Maze.stickDown = function () {
    Maze.prepareWall();

    for (var h = 2; h < Maze.HEIGHT - 1; h += 2) {
        for (var w = 2; w < Maze.WIDTH - 1; w += 2) {
            var candidate = new Array();

            for (var i = 0; i < 4; ++i) {
                // 上方向は除外
                if (h != 2 && i == 1) {
                    continue;
                }

                var ny = h + Maze.vy[i], nx = w + Maze.vx[i];

                if (Maze.field[ny][nx] == Maze.NONE) {
                    candidate.push(new Unit(ny, nx));
                }
            }

            var idx = getRandomInt(candidate.length - 1);
            Maze.field[candidate[idx].y][candidate[idx].x] = Maze.WALL;
        }
    }

    Maze.draw();
}

// 壁伸ばし法に使うやつ
// 座標 -> 頂点番号 の変換
Maze.convertVertex = function (y, x) {
    return Math.floor(y / 2) * (Math.floor(Maze.WIDTH / 2) + 1) + Math.floor(x / 2);
}

// 壁伸ばし法
Maze.wallExtend = function () {
    Maze.prepareWall();

    // 頂点数
    var N = (Math.floor(Maze.HEIGHT / 2) + 1) * (Math.floor(Maze.WIDTH / 2) + 1);
    var uf = new UnionFind(N);

    // 上端と下端
    for (var w = 0; w < Maze.WIDTH - 1; w += 2) {
        var s = Maze.convertVertex(0, w);
        var t = Maze.convertVertex(0, w + 2);
        uf.Unite(s, t);
        s = Maze.convertVertex(Maze.HEIGHT - 1, w);
        t = Maze.convertVertex(Maze.HEIGHT - 1, w + 2);
        uf.Unite(s, t);
    }

    // 右端と左端
    for (var h = 0; h < Maze.HEIGHT - 1; h += 2) {
        var s = Maze.convertVertex(h, 0);
        var t = Maze.convertVertex(h + 2, 0);
        uf.Unite(s, t);
        s = Maze.convertVertex(h, Maze.WIDTH - 1);
        t = Maze.convertVertex(h + 2, Maze.WIDTH - 1);
        uf.Unite(s, t);
    }

    var edges = new Array();

    // 横方向の辺
    for (var h = 2; h < Maze.HEIGHT - 1; h += 2) {
        for (var w = 0; w < Maze.WIDTH - 1; w += 2) {
            var s = Maze.convertVertex(h, w), t = Maze.convertVertex(h, w + 2);

            edges.push(new Edge(s, t, getRandomInt(1000)));
        }
    }

    // 縦方向
    for (var w = 2; w < Maze.WIDTH - 1; w += 2) {
        for (var h = 0; h < Maze.HEIGHT - 1; h += 2) {
            var s = Maze.convertVertex(h, w), t = Maze.convertVertex(h + 2, w);

            edges.push(new Edge(s, t, getRandomInt(1000)));
        }
    }

    // コストを昇順にソート
    edges.sort(function (a, b) {
        if (a.cost < b.cost) return 1;
        if (a.cost > b.cost) return -1;
        return 0;
    });

    for (var i = 0; i < edges.length; ++i) {
        if (!uf.Same(edges[i].s, edges[i].t)) {
            uf.Unite(edges[i].s, edges[i].t);

            // 頂点番号 -> 座標 の変換
            var sh = Math.floor(edges[i].s / (Math.floor(Maze.WIDTH / 2) + 1)) * 2, sw = (edges[i].s % (Math.floor(Maze.WIDTH / 2) + 1)) * 2,
                th = Math.floor(edges[i].t / (Math.floor(Maze.WIDTH / 2) + 1)) * 2, tw = (edges[i].t % (Math.floor(Maze.WIDTH / 2) + 1)) * 2;

            if (sh == th) {
                var mh = sh, mw = Math.floor((sw + tw) / 2);
                if (Maze.field[mh][mw] == Maze.WALL) {
                    alert(edges[i].s + ", " + edges[i].t);
                    alert(mh + ", " + mw);
                    alert("Error");
                }
                Maze.field[mh][mw] = Maze.WALL;
                //alert(mh + ", " + mw);
            } else {
                var mh = Math.floor((sh + th) / 2), mw = sw;
                if (Maze.field[mh][mw] == Maze.WALL) {
                    alert(edges[i].s + ", " + edges[i].t);
                    alert(mh + ", " + mw);
                    alert("Error");
                }
                Maze.field[mh][mw] = Maze.WALL;
            }
        }
    }

    Maze.draw();
}

// キャラ変更
Maze.changeCharacter = function () {
    Maze.IMAGE_NAME = "./img/natori_prof.jpg";
    Maze.img.src = Maze.IMAGE_NAME;
    setTimeout('Maze.draw()', 200);
}

Maze.draw = function () {
    ctx.beginPath();
    ctx.lineWidth = 1;

    for (var h = 0; h < Maze.HEIGHT; ++h) {
        for (var w = 0; w < Maze.WIDTH; ++w) {
            if (Maze.agent.y == h && Maze.agent.x == w) {
                ctx.drawImage(Maze.img, w * Maze.EDGE, h * Maze.EDGE, Maze.EDGE, Maze.EDGE);
            }
            else if (h == Maze.HEIGHT - 2 && w == Maze.WIDTH - 2) {
                ctx.fillStyle = 'rgb(128, 255, 255)';
                ctx.fillRect(w * Maze.EDGE, h * Maze.EDGE, Maze.EDGE, Maze.EDGE);
            }
            else if (Maze.field[h][w] !== Maze.NONE) {
                // 指定は (横, 縦, 横の辺, 縦の辺)
                ctx.fillStyle = (Maze.field[h][w] === Maze.WALL ? 'rgb(100, 100, 100)' : 'rgb(240, 110, 110)');
                ctx.fillRect(w * Maze.EDGE, h * Maze.EDGE, Maze.EDGE, Maze.EDGE);
            }
            else {
                ctx.fillStyle = 'rgb(255, 255, 255)';
                ctx.fillRect(w * Maze.EDGE, h * Maze.EDGE, Maze.EDGE, Maze.EDGE);
            }
            /* 枠線を描く */
            ctx.strokeRect(w * Maze.EDGE, h * Maze.EDGE, Maze.EDGE, Maze.EDGE);
        }
    }
}

Maze.bfs = function () {
    if (que.IsEmpty()) {
        return;
    }

    var u = que.Front();
    que.Pop();

    for (var i = 0; i < 4; ++i) {
        var ny = u.y + Maze.vy[i], nx = u.x + Maze.vx[i];

        if (Maze.field[ny][nx] == Maze.NONE) {
            que.Push(new Unit(ny, nx));
            Maze.field[ny][nx] = Maze.USED;
        }
    }

    Maze.draw();
}

Maze.dfs = function () {
    if (stack.IsEmpty()) {
        return;
    }

    var u = stack.Top();
    var flag = true;

    for (var i = 0; i < 4; ++i) {
        var ny = u.y + Maze.vy[i], nx = u.x + Maze.vx[i];

        if (Maze.field[ny][nx] == Maze.NONE) {
            stack.Push(new Unit(ny, nx));
            Maze.field[ny][nx] = Maze.USED;
            flag = false;
            break;
        }
    }

    if (flag) {
        stack.Pop();
    }

    Maze.draw();
}

Maze.QLearning = function () {
    var e = Math.max(1.0 - 0.9 * ql_iter / 10000, 0.05);
    ql_iter++;
    var action = 0;

    if (Math.random() < e) {
        action = getRandomInt(Maze.ACTION - 1);
    }
    else {
        var max_q = -1e9;

        for (var a = 0; a < Maze.ACTION; ++a) {
            if (max_q < Maze.Q[Maze.agent.y][Maze.agent.x][a]) {
                max_q = Maze.Q[Maze.agent.y][Maze.agent.x][a];
                action = a;
            }
        }
    }

    var ny = Maze.agent.y + Maze.vy[action], nx = Maze.agent.x + Maze.vx[action];

    // 行き先が壁ならその場に留まる
    if (Maze.field[ny][nx] == Maze.WALL) {
        ny = Maze.agent.y;
        nx = Maze.agent.x;
    }

    var target_q = -1e9;
    for (var a = 0; a < Maze.ACTION; ++a) {
        target_q = Math.max(Maze.Q[ny][nx][a], target_q);
    }

    // ゴールなら将来の報酬の期待値は 0
    if (ny == Maze.HEIGHT - 2 && nx == Maze.WIDTH - 2) {
        target_q = 0;
    }

    Maze.Q[Maze.agent.y][Maze.agent.x][action] += Maze.ALPHA * (-1 + Maze.GAMMA * target_q - Maze.Q[Maze.agent.y][Maze.agent.x][action]);

    Maze.agent.y = ny;
    Maze.agent.x = nx;

    Maze.draw();
    Maze.drawQTable();

    // ゴールなら終了
    if (ny == Maze.HEIGHT - 2 && nx == Maze.WIDTH - 2) {
        Maze.agent.y = 1;
        Maze.agent.x = 1;
    }

}

Maze.drawQTable = function () {
    q_table.innerHTML = "";

    for (var h = 1; h < Maze.HEIGHT - 1; ++h) {
        q_table.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        for (var w = 1; w < Maze.WIDTH - 1; ++w) {
            if (Maze.field[h][w] == Maze.WALL) {
                q_table.innerHTML += "O";
            }
            else if (h == Maze.HEIGHT - 2 && w == Maze.WIDTH - 2) {
                q_table.innerHTML += "G";
            }
            else {
                var max_q = -1e9;
                var action = 0;

                for (var a = 0; a < Maze.ACTION; ++a) {
                    if (max_q < Maze.Q[h][w][a]) {
                        max_q = Maze.Q[h][w][a];
                        action = a;
                    }
                }

                if (action == 0) {
                    q_table.innerHTML += "&gt;";
                }
                else if (action == 1) {
                    q_table.innerHTML += "&and;";
                }
                else if (action == 2) {
                    q_table.innerHTML += "&lt;";
                }
                else if (action == 3) {
                    q_table.innerHTML += "&or;";
                }
                else {
                    q_table.innerHTML += "O";
                }
            }
        }
        q_table.innerHTML += "<br>";
    }
}

Maze.runBfs = function () {
    if (Maze.isRunning) {
        Maze.agent.y = 1;
        Maze.agent.x = 1;
        clearInterval(runningFunc);
        Maze.isRunning = false;
    }

    que = new Queue();
    que.Push(new Unit(1, 1));
    Maze.field[1][1] = Maze.USED;
    runningFunc = setInterval('Maze.bfs()', 50);
    Maze.isRunning = true;
}

Maze.runDfs = function () {
    if (Maze.isRunning) {
        Maze.agent.y = 1;
        Maze.agent.x = 1;
        clearInterval(runningFunc);
        Maze.isRunning = false;
    }

    stack = new Stack();
    stack.Push(new Unit(1, 1));
    Maze.field[1][1] = Maze.USED;
    runningFunc = setInterval('Maze.dfs()', 50);
    Maze.isRunning = true;
}

Maze.runQLearning = function () {
    if (Maze.isRunning) {
        Maze.agent.y = 1;
        Maze.agent.x = 1;
        clearInterval(runningFunc);
        Maze.isRunning = false;
    }

    Maze.clearCanvas();

    ql_iter = 0;

    runningFunc = setInterval('Maze.QLearning()', 50);
    Maze.isRunning = true;
}

Maze.stop = function () {
    if (Maze.isRunning) {
        clearInterval(runningFunc);
        Maze.isRunning = false;
    }
}

Maze.clearCanvas = function () {
    if (Maze.isRunning) {
        clearInterval(runningFunc);
        Maze.isRunning = false;
    }

    ctx.beginPath();
    ctx.lineWidth = 1;

    for (var h = 0; h < Maze.HEIGHT; ++h) {
        for (var w = 0; w < Maze.WIDTH; ++w) {
            if (Maze.field[h][w] == Maze.USED) {
                Maze.field[h][w] = Maze.NONE;
            }
        }
    }

    Maze.agent.y = 1;
    Maze.agent.x = 1;

    Maze.draw();
}

Maze.allClearCanvas = function () {
    ctx.clearRect(0, 0, 400, 400);
}

Maze.changeSize = function () {
    Maze.HEIGHT = document.maze.maze_h.value;
    Maze.WIDTH = document.maze.maze_w.value;
    Maze.EDGE = Math.min(Math.floor(400 / Math.max(Maze.HEIGHT, Maze.WIDTH)), 100);
    Maze.allClearCanvas();
    Maze.init();
    setTimeout('Maze.draw()', 200);
}

/* Maze ここまで */