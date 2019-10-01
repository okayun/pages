'use struct';

/* データ構造や汎用的な関数など */

class Queue {
    constructor() {
        this.head = 0;
        this.tail = 0;
        this.elements = new Array();
    }

    IsEmpty() {
        return (this.head == this.tail);
    }

    Pop() {
        if (this.head == this.tail) {
            return;
        }
        this.head += 1;
    }

    Front() {
        return this.elements[this.head];
    }

    Push(elem) {
        this.elements = this.elements.concat(elem);
        this.tail += 1;
    }

    Clear() {
        this.elements.length = 0;
    }
};

class Stack {
    constructor() {
        this.size = 0;
        this.element = new Array();
    }

    IsEmpty() {
        return this.size == 0;
    }

    Top() {
        return this.element[this.size - 1];
    }

    Pop() {
        this.element.pop();
        this.size -= 1;
    }

    Push(elem) {
        this.element = this.element.concat(elem);
        this.size += 1;
    }
};

class Unit {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }
};

class UnionFind {
    constructor(n) {
        this.size = n;
        this.par = new Array(n);
        this.rank = new Array(n);

        for (var i = 0; i < this.size; ++i) {
            this.par[i] = i;
            this.rank[i] = 0;
        }
    }

    Size() {
        return this.size;
    }

    Root(x) {
        return (this.par[x] == x ? x : (this.par[x] = this.Root(this.par[x])));
    }

    Unite(x, y) {
        x = this.Root(x);
        y = this.Root(y);

        if (x == y) {
            return;
        }

        if (this.rank[x] < this.rank[y]) {
            this.par[x] = y;
        } else {
            this.par[y] = x;
            if (this.rank[x] == this.rank[y]) {
                this.rank[x]++;
            }
        }
    }

    Same(x, y) {
        return this.Root(x) == this.Root(y);
    }
};

class Edge {
    constructor(s, t, cost) {
        this.s = s;
        this.t = t;
        this.cost = cost;
    }
};

class Task {
    constructor(state = [], color = []) {
        this.state = state;
        this.color = color;
    }

    SetColor(c) {
        this.color = c.concat();
    }

    SetState(s) {
        this.state = s.concat();
    }
};

/**
 * Math.random() は 0 以上 1 "未満" の浮動小数点数を返す
 */
function getRandomInt(max_value) {
    return Math.floor(Math.random() * max_value + 1);
}

function arrayShuffle(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
        // 0~iのランダムな数値を取得
        var rnd = getRandomInt(i);

        // 配列の数値を入れ替える
        var tmp = arr[i];
        arr[i] = arr[rnd];
        arr[rnd] = tmp;
    }
}

/* ここまで */
