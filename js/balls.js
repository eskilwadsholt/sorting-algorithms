var pivot;
var balls = [];
var n = 30;
var swapTime = 100;
var pause = 150;
var swaps = 0;
var comparisons = 0;
var ballRadius = 12;
var ballMargin = 8;
var best = bestCase(n);
var worst = worstCase(n);

// Fill list of balls random numbers
for (var i=1; i<=n; i++) {
    balls.push({ val: randInt(n) });
}

// Append ball divs
for (var i=0; i<n; i++) {
    $("#balls")
    .append($('<div class="ball"</div>')
        .html(`<div class="numbering">${balls[i].val}</div>`)
        .css({
            top: 3 * ballRadius,
            left: (2 * ballRadius  + ballMargin ) * i + ballMargin,
            width: 2 * ballRadius,
            height: 2 * ballRadius,
            "border-radius": ballRadius
        }));
    balls[i].div = $(".ball").last();
}

updateBest(0);
updateWorst(0);

$(".numbering").css({
    "font-size": 0.85 * ballRadius + "pt"
});

$("#size").html(`${n} (n &times; n = ${n * n},
    n log n = ${(n * Math.log2(n)).toFixed(2)})`);

function increaseSwaps() {
    $("#swaps").text(++swaps);
}

function increaseComparisons() {
    $("#comparisons").text(++comparisons);
}

$("#restart").click(() => {
    location.reload();
    console.log("restarting");
});



$("#advance").click(async function(event) {
    $("#advance").addClass("disabled");
    await quickSort(0, n - 1);
    await sleep(pause);
    $(".ball.clone").animate({
        opacity: 0
    }, 500);
    await $(".ball.clone").promise();
    $(".ball").animate({
        top: 3 * ballRadius
    }, 2000);
    event.stopImmediatePropagation();
});

function updateWorst(val) {
    worst += val;
    $("#worst").text(`${comparisons + worst} / ${worstCase(n)}`);
}

function updateBest(val) {
    best += val;
    $("#best").text(`${comparisons + best} / ${bestCase(n)}`);
}

async function quickSort(low, high) {
    if (low > 0 || high < n - 1) {
        $(balls.slice(low, high + 1)).each((i, ball) => {
            $("#balls").append($(ball.div).clone().empty().addClass("clone"));
            $(ball.div).animate({
                top: `+=${2 * ballRadius + ballMargin}`
            }, 500);
            setTimeout(() => {
                $(ball.div).attr("class", "ball");
            }, 200);
        });
        await sleep(550);
    }
    var ballList = [];
    balls.forEach(ball => {
        ballList.push(ball.val);
    });
    console.log(`quickSort(${low}, ${high})`);
    await sleep(pause);
    await choosePivot(low, high);
    var i = await partition(low, high, pivot);
    await sleep(pause);
    updateBest(-bestCase(high + 1 - low) + bestCase(i - low) + bestCase(high - i));
    updateWorst(-worstCase(high + 1 - low) + worstCase(i - low) + worstCase(high - i));
    if (low < i - 1) await quickSort(low, i - 1);
    else $(balls[low].div).attr("class", "ball done");
    if (i + 1 < high) await quickSort(i + 1, high);
    else $(balls[high].div).attr("class", "ball done");
}

function worstCase(k) {
    if (k <= 1) return 0;
    return k * (k - 1) / 2;
}

function bestCase(k) {
    if (k <= 1) return 0;
    var lower = (k - 1) % 2 == 0 ? (k - 1) / 2 : (k - 2) / 2;
    var upper = k - 1 - lower;
    return k - 1 + bestCase(lower) + bestCase(upper);
}

function choosePivot(low, high) {
    return new Promise(async resolve => {
        var pivotIndex = low + randInt(high - low + 1);
        pivot = balls[pivotIndex];
        pivot.div.addClass("pivot");
        console.log(`Index: ${pivotIndex}`);
        console.log(`Pivot: ${pivot.val}`);
        await animateSwap(pivotIndex, high, swapTime);
        await sleep(pause);
        resolve();
    });
}

async function partition(low, high, pivot) {
    console.log(`partition(${low}, ${high})`);
    var i = low;
    for (var j=low; j < high; j++) {
        increaseComparisons();
        if (balls[j].val < pivot.val) {
            balls[j].div.addClass("less");
            await sleep(2 * swapTime);
            await animateSwap(i, j, swapTime);
            i += 1;
        } else {
            balls[j].div.addClass("more");
            await sleep(2 * swapTime);
        }
    }
    await sleep(pause);
    await animateSwap(i, high, swapTime);
    await sleep(pause);
    $(pivot.div).removeClass("pivot");
    $(pivot.div).addClass("done");
    return i;
}

function sleep(ms) {
    return new Promise(resolve => { setTimeout(resolve, ms)});
}



$.extend($.easing, {
    sin: function(x, t, b, c, d) {
        return b + c * Math.sin(Math.PI * x);
    },
    cos: function(x, t, b, c, d) {
        return b + c / 2 - c / 2 * Math.cos(Math.PI * x);
    },
    sinUp: function(x, t, b, c, d) {
        return b + c * Math.sin(Math.PI * x / 2);
    },
    sinDown: function(x, t, b, c, d) {
        return b + c - c * Math.cos(Math.PI * x / 2);
    },
});

function animateSwap(i1, i2, ms) {
    increaseSwaps();
    return new Promise(async resolve => {
        var duration = ms;
        if (i1 != i2) {
            var $a = balls[i1].div;
            var $b = balls[i2].div;
            var x1 = parseInt($a.css("left"));
            var x2 = parseInt($b.css("left"));
            var y1 = parseInt($a.css("top"));
            var y2 = parseInt($b.css("top"));
            var radius = Math.min(Math.abs(x2 - x1) / 2, 2 * ballRadius + ballMargin);
            duration = Math.max(0, ms * (i2 - i1 - 2) / 3);
            console.log(duration);
            $a.animate({
                left: [`+=${radius}`, 'sinDown'],
                top: [`-=${radius}`, 'sinUp']
            }, ms);
            if (duration > 0) {
                $a.animate({
                    left: [x2 - radius, 'linear']
                }, duration);
            }
            $a.animate({
                left: [x2, 'sinUp'],
                top: [y2, 'sinDown']
            }, ms);
            $b.animate({
                left: [`-=${radius}`, 'sinDown'],
                top: [`+=${radius}`, 'sinUp']
            }, ms);
            if (duration > 0) {
                $b.animate({
                    left: [x1 + radius, 'linear']
                }, duration);
            }
            $b.animate({
                left: [x1, 'sinUp'],
                top: [y1, 'sinDown']
            }, ms);
            
            var temp = balls[i1];
            balls[i1] = balls[i2];
            balls[i2] = temp;
            await $a.promise();
            await $b.promise();
        }
        console.log("animation is done");
        resolve();
    });
}

function randInt(max) {
    return Math.floor(Math.random() * max );
}