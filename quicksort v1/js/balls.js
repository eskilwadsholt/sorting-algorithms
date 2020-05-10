var pivot;
var balls = [];
var n = 50;
var swapTime = 40;
var pause = 40;
var swaps = 0;
var comparisons = 0;
var ballRadius = 10;
var ballMargin = 3;
var best = bestCase(n);
var worst = worstCase(n);
var allBest = best;
var allWorst = worst;
var divisionRate = 1;
var divisionWeight = 0;

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

$("#size").html(`${n} (\\(n^2=${n * n}\\) and \\(n\\log n=${(n * Math.log2(n)).toFixed(1)}\\))`);

function increaseSwaps() {
    $("#swaps").text(++swaps);
}

function increaseComparisons() {
    $("#comparisons").text(++comparisons);
}

$("#restart").click(() => {
    location.reload();
});



$("#advance").click(async function(event) {
    $(".popup__body").html(`
        <div>This is a test</div>
        <div class="ball>
            <div class="numbering>
                123
            </div>
        </div>
    `);
    //$(".popup").addClass("popup--active");
    await quickSort(0, n - 1);
    await sleep(pause);
    $(".ball.clone").animate({
        opacity: 0
    }, 1000);
    await $(".ball.clone").promise();
    $(".ball").animate({
        top: 3 * ballRadius
    }, 2000);
    event.stopImmediatePropagation();
});

function updateWorst(val) {
    worst += val;
    var gained = allWorst - (comparisons + worst);
    var range = worst - best;
    $("#gained-bar").css({
        width: gained / allWorst  * 100 + "%"
    });
    $("#range-bar").css({
        width: range / allWorst  * 100 + "%"
    });
}

function updateBest(val) {
    best += val;
    var lost = comparisons + best - allBest;
    var range = worst - best;
    $("#min-bar").css({
        width: allBest / allWorst * 100 + "%"
    });
    $("#lost-bar").css({
        width: lost / allWorst * 100 + "%"
    }, pause);
    $("#range-bar").css({
        width: range / allWorst  * 100 + "%"
    });
}

function updateDivision(division, relevance) {
    divisionWeight += relevance / n;
    divisionRate *= Math.pow(Math.max(division, 1 - division), relevance / n);
    var rate = 100 * Math.pow(divisionRate, 1 / divisionWeight);
    $("#division").text(`${rate.toFixed(0)}% / ${(100 - rate).toFixed(0)}%`);
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
    updateDivision( (i - low) / (high - low), high - low);
    console.log((i - low) + " / " + (high - low));
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
        await animateSwap(pivotIndex, high, swapTime);
        await sleep(pause);
        resolve();
    });
}

async function partition(low, high, pivot) {
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
        resolve();
    });
}

function randInt(max) {
    return Math.floor(Math.random() * max );
}