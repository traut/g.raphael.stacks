/*!
 * g.Raphael 0.5 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
(function () {
    var mmin = Math.min,
        mmax = Math.max;

    function finger(x, y, width, height, dir, ending, isPath, paper) {
        var path,
            ends = { round: 'round', sharp: 'sharp', soft: 'soft', square: 'square' };

        // dir 0 for horizontal and 1 for vertical
        if ((dir && !height) || (!dir && !width)) {
            return isPath ? "" : paper.path();
        }

        ending = ends[ending] || "square";
        height = Math.round(height);
        width = Math.round(width);
        x = Math.round(x);
        y = Math.round(y);

        switch (ending) {
            case "round":
                if (!dir) {
                    var r = ~~(height / 2);

                    if (width < r) {
                        r = width;
                        path = [
                            "M", x + .5, y + .5 - ~~(height / 2),
                            "l", 0, 0,
                            "a", r, ~~(height / 2), 0, 0, 1, 0, height,
                            "l", 0, 0,
                            "z"
                        ];
                    } else {
                        path = [
                            "M", x + .5, y + .5 - r,
                            "l", width - r, 0,
                            "a", r, r, 0, 1, 1, 0, height,
                            "l", r - width, 0,
                            "z"
                        ];
                    }
                } else {
                    r = ~~(width / 2);

                    if (height < r) {
                        r = height;
                        path = [
                            "M", x - ~~(width / 2), y,
                            "l", 0, 0,
                            "a", ~~(width / 2), r, 0, 0, 1, width, 0,
                            "l", 0, 0,
                            "z"
                        ];
                    } else {
                        path = [
                            "M", x - r, y,
                            "l", 0, r - height,
                            "a", r, r, 0, 1, 1, width, 0,
                            "l", 0, height - r,
                            "z"
                        ];
                    }
                }
                break;
            case "sharp":
                if (!dir) {
                    var half = ~~(height / 2);

                    path = [
                        "M", x, y + half,
                        "l", 0, -height, mmax(width - half, 0), 0, mmin(half, width), half, -mmin(half, width), half + (half * 2 < height),
                        "z"
                    ];
                } else {
                    half = ~~(width / 2);
                    path = [
                        "M", x + half, y,
                        "l", -width, 0, 0, -mmax(height - half, 0), half, -mmin(half, height), half, mmin(half, height), half,
                        "z"
                    ];
                }
                break;
            case "square":
                if (!dir) {
                    path = [
                        "M", x, y + ~~(height / 2),
                        "l", 0, -height, width, 0, 0, height,
                        "z"
                    ];
                } else {
                    path = [
                        "M", x + ~~(width / 2), y,
                        "l", 1 - width, 0, 0, -height, width - 1, 0,
                        "z"
                    ];
                }
                break;
            case "soft":
                if (!dir) {
                    r = mmin(width, Math.round(height / 5));
                    path = [
                        "M", x + .5, y + .5 - ~~(height / 2),
                        "l", width - r, 0,
                        "a", r, r, 0, 0, 1, r, r,
                        "l", 0, height - r * 2,
                        "a", r, r, 0, 0, 1, -r, r,
                        "l", r - width, 0,
                        "z"
                    ];
                } else {
                    r = mmin(Math.round(width / 5), height);
                    path = [
                        "M", x - ~~(width / 2), y,
                        "l", 0, r - height,
                        "a", r, r, 0, 0, 1, r, -r,
                        "l", width - 2 * r, 0,
                        "a", r, r, 0, 0, 1, r, r,
                        "l", 0, height - r,
                        "z"
                    ];
                }
        }

        if (isPath) {
            return path.join(",");
        } else {
            return paper.path(path);
        }
    }

    function stacked_finger(x, y, width, step_height, value, dir, ending, isPath, paper) {
        var stack = [];
        var bh = Math.floor(step_height / 1.5);
        var is_array = Raphael.is(value, "array");
        for (var i = 0; i < (is_array ? value.length : value); i++) {
            var block = finger(x, y - i * step_height, width, bh, dir, ending, isPath, paper);
            if (is_array) {
                var title = value[i][0],
                    color = value[i][1];
                    //href = value[i][2];
                block.attr({title : title, fill : color}); //, href : href});
            }
            stack.push(block);
        }
        return stack;
    }

    /*
     * Vertical Stacked Barchart
     */
    function VStackedBarchart(paper, x, y, width, height, values, opts) {
        opts = opts || {};

        var chartinst = this,
            type = opts.type || "square",
            gutter = parseFloat(opts.gutter || "20%"),
            chart = paper.set(),
            bars = paper.set(),
            covers = paper.set(),
            covers2 = paper.set(),
            max_in_stack = Math.max.apply(Math, values) || 0,
            colors = opts.colors || chartinst.colors,
            len = values.length;

        if (Raphael.is(values[0], "array")) {
            for (var i = values.length; i--;) {
                max_in_stack = Math.max(max_in_stack, values[i].length);
            }
        } else {
            max_in_stack = Math.max.apply(Math, values);
        }

//            for (var i = values.length; i--;) {
//                max_in_stack.push(values[i].length);
//                len = Math.max(len, values[i].length);
//            }
//            max_in_stack = Math.max.apply(Math, max_in_stack);

//            for (var i = values.length; i--;) {
//                if (values[i].length < len) {
//                    for (var j = len; j--;) {
//                        values[i].push(0);
//                    }
//                }
//            }

        max_in_stack = (opts.to) || max_in_stack;

        var barwidth = width / (len * (100 + gutter) + gutter) * 100,
            barhgutter = barwidth * gutter / 100,
            barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
            stack = [],
            X = x + barhgutter,
            Y = (height - 2 * barvgutter) / max_in_stack;

        if (!opts.stretch) {
            barhgutter = Math.round(barhgutter);
            barwidth = Math.floor(barwidth);
        }

        //!opts.stacked && (barwidth /= multi || 1);

        for (var i = 0; i < len; i++) {
            var v = values[i];

            var h = Math.round((Raphael.is(values[i], "array") ? values[i].length : values[i]) * Y),
                top = y + height - barvgutter - h,
                bar = stacked_finger(
                    Math.round(X + barwidth / 2),
                    top + h,
                    barwidth,
                    Y,
                    v,
                    true, type, null, paper);

            for(var k = 0; k < bar.length; k++) {
                if (!bar[k].attrs['fill'] || bar[k].attrs['fill'] == "none") {
                    bar[k].attr({fill: colors[0] });
                }
                bar[k].attr({ stroke: "none" });
            }

            for(var k = 0; k < bar.length; k++) {
                bars.push(bar[k]);
                bar[k].y = k * 10;
                bar[k].x = Math.round(X + barwidth / 2);
                bar[k].w = barwidth;
                bar[k].h = 10;
                bar[k].value = values[i];
            }
            X += barwidth + barhgutter;
        }

        covers2.toFront();
        X = x + barhgutter;

        for (var i = 0; i < bars.length; i++) {
            for (var k = 0; k < bars[i].length; k++) {
                var cover;
                covers.push(cover = paper.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(chartinst.shim));
                cover.bar = bars[i][k];
                cover.value = cover.bar.value;
            }
            X += barwidth;
            X += barhgutter;
        }

        chart.label = function (labels, isBottom) {
            labels = labels || [];
            this.labels = paper.set();

            var L, l = -Infinity;

            for (var i = 0; i < len; i++) {
                for (var j = 0; j < (multi || 1); j++) {
                    var label = paper.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], max_in_stack);

                    L = paper.text(bars[i * (multi || 1) + j].x, isBottom ? y + height - barvgutter / 2 : bars[i * (multi || 1) + j].y - 10, label).attr(txtattr).insertBefore(covers[i * (multi || 1) + j]);

                    var bb = L.getBBox();

                    if (bb.x - 7 < l) {
                        L.remove();
                    } else {
                        this.labels.push(L);
                        l = bb.x + bb.width;
                    }
                }
            }
            return this;
        };

        chart.hover = function (fin, fout) {
            covers2.hide();
            covers.show();
            covers.mouseover(fin).mouseout(fout);
            return this;
        };

        chart.hoverColumn = function (fin, fout) {
            covers.hide();
            covers2.show();
            fout = fout || function () {};
            covers2.mouseover(fin).mouseout(fout);
            return this;
        };

        chart.click = function (f) {
            covers2.hide();
            covers.show();
            covers.click(f);
            return this;
        };

        chart.each = function (f) {
            if (!Raphael.is(f, "function")) {
                return this;
            }
            for (var i = covers.length; i--;) {
                f.call(covers[i]);
            }
            return this;
        };

        chart.eachColumn = function (f) {
            if (!Raphael.is(f, "function")) {
                return this;
            }
            for (var i = covers2.length; i--;) {
                f.call(covers2[i]);
            }
            return this;
        };

        chart.clickColumn = function (f) {
            covers.hide();
            covers2.show();
            covers2.click(f);
            return this;
        };

        chart.push(bars, covers, covers2);
        chart.bars = bars;
        chart.covers = covers;
        return chart;
    };

    
    //inheritance
    var F = function() {};
    F.prototype = Raphael.g;
    VStackedBarchart.prototype = new F;
    
    Raphael.fn.stackedbarchart = function(x, y, width, height, values, opts) {
        return new VStackedBarchart(this, x, y, width, height, values, opts);
    };
})();
