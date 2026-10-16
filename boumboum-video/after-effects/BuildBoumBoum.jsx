// Ballon Boum Boum promo - After Effects project builder
// ------------------------------------------------------
// Rebuilds the Remotion promo as a fully editable After Effects project:
// scene pre-comps, text layers, shape layers, keyframes and audio.
//
// How to use:
//   1. Install the fonts in the "fonts" folder (LilitaOne, Lobster, Fredoka Bold).
//   2. In After Effects: File > Scripts > Run Script File... and pick this file.
//      Keep this script next to the "footage" and "audio" folders.
//   3. The project is built and saved as "BoumBoum.aep" next to this script.
//
// Timings mirror the Remotion version: 1080x1920, 30 fps, 405 frames (13.5 s).

(function buildBoumBoum() {
    var ROOT = new File($.fileName).parent;
    var FPS = 30;
    var W = 1080;
    var H = 1920;

    var FONT_DISPLAY = "LilitaOne";
    var FONT_SCRIPT = "Lobster-Regular";
    var FONT_BODY = "Fredoka-Bold";

    function hex(h) {
        h = h.replace("#", "");
        return [
            parseInt(h.substr(0, 2), 16) / 255,
            parseInt(h.substr(2, 2), 16) / 255,
            parseInt(h.substr(4, 2), 16) / 255
        ];
    }

    var C = {
        bubblePink: hex("F7B6CF"),
        hotPink: hex("F06AA8"),
        deepPink: hex("D9367F"),
        logoRed: hex("E3123B"),
        green: hex("2E9E3E"),
        greenDark: hex("1F7A2E"),
        strawberry: hex("E01F3D"),
        strawberryDark: hex("B5122C"),
        white: [1, 1, 1]
    };

    function f(frame) {
        return frame / FPS;
    }

    // ---------- keyframe helpers ----------

    function easeDims(prop) {
        var t = prop.propertyValueType;
        if (t === PropertyValueType.ThreeD) return 3;
        if (t === PropertyValueType.TwoD) return 2;
        return 1; // OneD and spatial properties
    }

    // Sets keyframes at the given frames and applies an easy ease to all of them.
    function keys(prop, frames, values, influence) {
        var inf = influence || 60;
        for (var i = 0; i < frames.length; i++) {
            prop.setValueAtTime(f(frames[i]), values[i]);
        }
        var n = easeDims(prop);
        var ease = [];
        for (var d = 0; d < n; d++) ease.push(new KeyframeEase(0, inf));
        for (var k = 1; k <= prop.numKeys; k++) {
            prop.setTemporalEaseAtKey(k, ease, ease);
        }
    }

    function lerp(a, b, t) {
        if (a instanceof Array) {
            var out = [];
            for (var i = 0; i < a.length; i++) out.push(a[i] + (b[i] - a[i]) * t);
            return out;
        }
        return a + (b - a) * t;
    }

    // Bouncy "spring" move with an overshoot, built from plain keyframes.
    function spring(prop, f0, f1, from, to, overshoot) {
        var os = overshoot === undefined ? 0.12 : overshoot;
        var d = f1 - f0;
        keys(
            prop,
            [f0, f0 + d * 0.55, f0 + d * 0.8, f1],
            [from, lerp(from, to, 1 + os), lerp(from, to, 1 - os * 0.35), to]
        );
    }

    // ---------- layer helpers ----------

    function tr(layer) {
        return layer.property("ADBE Transform Group");
    }

    function pos(layer) {
        return tr(layer).property("ADBE Position");
    }

    function scl(layer) {
        return tr(layer).property("ADBE Scale");
    }

    function rot(layer) {
        return tr(layer).property("ADBE Rotate Z");
    }

    function opa(layer) {
        return tr(layer).property("ADBE Opacity");
    }

    function dropShadow(layer, opacity, distance, softness) {
        var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
        fx.property("ADBE Drop Shadow-0001").setValue([0, 0, 0, 1]);
        fx.property("ADBE Drop Shadow-0002").setValue(opacity * 2.55);
        fx.property("ADBE Drop Shadow-0003").setValue(180);
        fx.property("ADBE Drop Shadow-0004").setValue(distance);
        fx.property("ADBE Drop Shadow-0005").setValue(softness);
        return fx;
    }

    function background(comp, name, c1, c2, radial) {
        var bg = comp.layers.addSolid(c2, name, W, H, 1, comp.duration);
        var ramp = bg.property("ADBE Effect Parade").addProperty("ADBE Ramp");
        if (radial) {
            ramp.property("ADBE Ramp-0001").setValue([W / 2, H * 0.45]);
            ramp.property("ADBE Ramp-0003").setValue([W / 2 + W * 0.95, H * 0.45]);
            ramp.property("ADBE Ramp-0005").setValue(2); // radial
        } else {
            ramp.property("ADBE Ramp-0001").setValue([W / 2, 0]);
            ramp.property("ADBE Ramp-0003").setValue([W / 2, H]);
            ramp.property("ADBE Ramp-0005").setValue(1); // linear
        }
        ramp.property("ADBE Ramp-0002").setValue(c1);
        ramp.property("ADBE Ramp-0004").setValue(c2);
        return bg;
    }

    // Text layer with its anchor point centered so it scales from the middle.
    function text(comp, name, str, font, size, fill, stroke, strokeWidth, center, leading) {
        var layer = comp.layers.addText(str);
        layer.name = name;
        var prop = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var td = prop.value;
        td.resetCharStyle();
        td.font = font;
        td.fontSize = size;
        td.applyFill = true;
        td.fillColor = fill;
        if (stroke) {
            td.applyStroke = true;
            td.strokeColor = stroke;
            td.strokeWidth = strokeWidth;
            td.strokeOverFill = false;
        } else {
            td.applyStroke = false;
        }
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        if (leading) {
            td.autoLeading = false;
            td.leading = leading;
        }
        prop.setValue(td);
        var r = layer.sourceRectAtTime(0, false);
        tr(layer).property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
        pos(layer).setValue(center);
        return layer;
    }

    // Soft "candy" shadow under bold titles.
    function candyShadow(layer) {
        dropShadow(layer, 18, 12, 0);
    }

    // Image fitted into a box (like objectFit: contain), centered at `center`.
    function image(comp, footage, name, boxW, boxH, center) {
        var layer = comp.layers.add(footage);
        layer.name = name;
        var s = Math.min(boxW / footage.width, boxH / footage.height) * 100;
        scl(layer).setValue([s, s]);
        pos(layer).setValue(center);
        return layer;
    }

    function shapeContents(layer) {
        return layer.property("ADBE Root Vectors Group");
    }

    function addFill(contents, color, opacity) {
        var fill = contents.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(color);
        if (opacity !== undefined) fill.property("ADBE Vector Fill Opacity").setValue(opacity);
        return fill;
    }

    function addEllipse(contents, name, size, position, color, opacity) {
        var g = contents.addProperty("ADBE Vector Group");
        g.name = name;
        var gc = g.property("ADBE Vectors Group");
        var e = gc.addProperty("ADBE Vector Shape - Ellipse");
        e.property("ADBE Vector Ellipse Size").setValue([size, size]);
        e.property("ADBE Vector Ellipse Position").setValue(position);
        addFill(gc, color, opacity);
        return g;
    }

    // Floating bubbles drifting upward (same motion as the Remotion version).
    var BUBBLES = [
        [8, 90, 1.0, 0], [22, 50, 1.4, 40], [38, 130, 0.8, 15],
        [55, 70, 1.2, 60], [70, 110, 0.9, 25], [85, 60, 1.3, 5],
        [93, 95, 1.0, 70], [15, 75, 1.1, 90], [62, 45, 1.5, 100]
    ];

    function bubbles(comp, color) {
        for (var i = 0; i < BUBBLES.length; i++) {
            var b = BUBBLES[i];
            var layer = comp.layers.addShape();
            layer.name = "Bubble " + (i + 1);
            var c = shapeContents(layer);
            addEllipse(c, "Bubble", b[1], [0, 0], color, 55);
            addEllipse(c, "Shine", b[1] * 0.3, [-b[1] * 0.2, -b[1] * 0.2], C.white, 70);
            pos(layer).expression =
                "var x = " + b[0] + ", s = " + b[1] + ", sp = " + b[2] + ", d = " + b[3] + ";\n" +
                "var fr = timeToFrames(time) + d;\n" +
                "var travel = thisComp.height + s * 2;\n" +
                "var y = thisComp.height + s - (fr * 6 * sp) % travel;\n" +
                "[x / 100 * thisComp.width + Math.sin(fr / 12) * 18 + s / 2, y + s / 2];";
        }
    }

    // Diagonal candy stripes that scroll sideways.
    function stripes(comp, a, b) {
        comp.layers.addSolid(a, "Stripes base", W, H, 1, comp.duration);
        var layer = comp.layers.addShape();
        layer.name = "Stripes";
        var c = shapeContents(layer);
        var g = c.addProperty("ADBE Vector Group");
        var gc = g.property("ADBE Vectors Group");
        var rect = gc.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([60, 2600]);
        rect.property("ADBE Vector Rect Position").setValue([-1290, 0]);
        addFill(gc, b);
        var rep = c.addProperty("ADBE Vector Filter - Repeater");
        rep.property("ADBE Vector Repeater Copies").setValue(24);
        rep.property("ADBE Vector Repeater Transform")
            .property("ADBE Vector Repeater Position").setValue([120, 0]);
        rot(layer).setValue(8);
        pos(layer).expression = "[thisComp.width / 2 + (timeToFrames(time) * 1.5) % 120, thisComp.height / 2];";
        return layer;
    }

    // Pink splash blob (same path as the Remotion SVG, viewBox 400x300).
    function splash(comp, width, center) {
        var layer = comp.layers.addShape();
        layer.name = "Splash";
        var c = shapeContents(layer);
        var g = c.addProperty("ADBE Vector Group");
        g.name = "Blob";
        var gc = g.property("ADBE Vectors Group");
        var pathProp = gc.addProperty("ADBE Vector Shape - Group");
        var shape = new Shape();
        shape.vertices = [[-140, 0], [-60, -100], [90, -95], [160, 10], [60, 105], [-90, 105]];
        shape.inTangents = [[-50, 50], [-70, -20], [-30, -45], [40, -50], [70, 25], [30, 40]];
        shape.outTangents = [[-40, -60], [40, -40], [70, -15], [35, 60], [-40, 40], [-70, 15]];
        shape.closed = true;
        pathProp.property("ADBE Vector Shape").setValue(shape);
        addFill(gc, C.bubblePink);
        addEllipse(c, "Drop 1", 28, [145, -105], C.bubblePink);
        addEllipse(c, "Drop 2", 16, [172, -80], C.bubblePink);
        addEllipse(c, "Drop 3", 24, [-160, 100], C.bubblePink);
        var s = (width / 400) * 100;
        scl(layer).setValue([s, s]);
        pos(layer).setValue(center);
        return layer;
    }

    // Null with a top-left anchor, so children can be placed relative to it.
    function controlNull(comp, name, p) {
        var n = comp.layers.addNull();
        n.name = name;
        tr(n).property("ADBE Anchor Point").setValue([0, 0]);
        pos(n).setValue(p);
        return n;
    }

    // Parents an un-keyframed layer to a control null, keeping it in place.
    function attach(layer, ctrl) {
        var p = pos(layer).value;
        var c = pos(ctrl).value;
        layer.parent = ctrl;
        pos(layer).setValue([p[0] - c[0], p[1] - c[1]]);
    }

    // "Ballon / BOUM BOUM" logo, letters popping in one by one.
    function logo(comp, delay, size, ballonCenter, boumCenter) {
        var ctrl = controlNull(comp, "Logo control", [W / 2, (ballonCenter[1] + boumCenter[1]) / 2]);

        var ballon = text(comp, "Ballon", "Ballon", FONT_SCRIPT, size * 0.5, C.logoRed, C.white, size * 0.08, ballonCenter);
        candyShadow(ballon);
        attach(ballon, ctrl);
        var b = pos(ballon).value;
        spring(pos(ballon), delay, delay + 18, [b[0], b[1] - 300], [b[0], b[1]], 0.08);
        keys(opa(ballon), [delay, delay + 6], [0, 100]);

        var boum = text(comp, "BOUM BOUM", "BOUM\rBOUM", FONT_DISPLAY, size, C.logoRed, C.white, size * 0.14, boumCenter, size * 0.85);
        candyShadow(boum);
        attach(boum, ctrl);

        // Text animator: letters start at 0% scale and -25 deg, revealed left to right.
        var anim = boum.property("ADBE Text Properties").property("ADBE Text Animators")
            .addProperty("ADBE Text Animator");
        anim.name = "Letter pop";
        var props = anim.property("ADBE Text Animator Properties");
        props.addProperty("ADBE Text Scale 3D").setValue([0, 0, 0]);
        props.addProperty("ADBE Text Rotation").setValue(-25);
        var sel = anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        var start = delay + 9;
        keys(sel.property("ADBE Text Percent Start"), [start, start + 26], [0, 100], 33);
        try {
            boum.property("ADBE Text Properties").property("ADBE Text More Options")
                .property("ADBE Text Anchor Point Align").setValue([0, -50]);
        } catch (e) {}
        return ctrl;
    }

    // ---------- import ----------

    app.beginUndoGroup("Build Boum Boum promo");
    var proj = app.project;
    var footageFolder = proj.items.addFolder("Footage");
    var audioFolder = proj.items.addFolder("Audio");
    var scenesFolder = proj.items.addFolder("Scenes");

    function importItem(rel, folder) {
        var file = new File(ROOT.fsName + "/" + rel);
        if (!file.exists) throw new Error("Missing file: " + file.fsName);
        var item = proj.importFile(new ImportOptions(file));
        item.parentFolder = folder;
        return item;
    }

    var IMG = {
        gumPasteque: importItem("footage/gum-pasteque.png", footageFolder),
        packsPasteque: importItem("footage/packs-pasteque.png", footageFolder),
        boxPasteque: importItem("footage/box-pasteque.png", footageFolder),
        packFraise: importItem("footage/pack-fraise.png", footageFolder),
        boxFraise: importItem("footage/box-fraise.png", footageFolder)
    };
    var music = importItem("audio/music.wav", audioFolder);
    var sfx = importItem("audio/sfx.wav", audioFolder);

    function newComp(name, frames) {
        var comp = proj.items.addComp(name, W, H, 1, frames / FPS, FPS);
        comp.parentFolder = scenesFolder;
        return comp;
    }

    // ---------- Scene 1: Intro (90 frames) ----------

    function buildIntro() {
        var comp = newComp("01 Intro", 90);
        background(comp, "Background", C.hotPink, C.deepPink, true);
        bubbles(comp, C.white);

        var sp = splash(comp, 1150, [W / 2, 911]);
        var s = (1150 / 400) * 100;
        spring(scl(sp), 0, 18, [0, 0], [s, s], 0.15);
        rot(sp).expression = "Math.sin(timeToFrames(time) / 15) * 3;";

        var ctrl = logo(comp, 9, 260, [W / 2, 742], [W / 2, 1018]);
        // heartbeat "BOUM BOUM" pulse once the letters have landed
        keys(scl(ctrl), [48, 52.5, 57, 61.5, 66], [[100, 100], [112, 112], [100, 100], [112, 112], [100, 100]]);

        var tag = text(comp, "Tagline", "Bubble Gum fourré", FONT_BODY, 72, C.white, null, 0, [W / 2, 1620]);
        candyShadow(tag);
        keys(opa(tag), [45, 60], [0, 100]);
        keys(pos(tag), [45, 60], [[W / 2, 1680], [W / 2, 1620]]);
        return comp;
    }

    // ---------- Scenes 2 & 3: Flavor (120 frames) ----------

    function buildFlavor(name, flavor, subtitle, stripeA, stripeB, hero, pack) {
        var comp = newComp(name, 120);
        stripes(comp, stripeA, stripeB);
        bubbles(comp, C.bubblePink);

        var sp = splash(comp, 867, [W / 2, 415]);
        opa(sp).setValue(90);
        var s = (867 / 400) * 100;
        spring(scl(sp), 0, 15, [0, 0], [s, s], 0.1);

        var sub = text(comp, "Subtitle", subtitle, FONT_BODY, 64, C.logoRed, null, 0, [W / 2, 270]);
        keys(opa(sub), [9, 21], [0, 100]);

        var title = text(comp, "Flavor title", flavor, FONT_DISPLAY, 200, C.white, stripeB, 28, [W / 2, 430]);
        candyShadow(title);
        spring(scl(title), 12, 27, [0, 0], [100, 100], 0.18);

        var heroLayer = image(comp, hero, "Hero", 960, 760, [W / 2, 940]);
        dropShadow(heroLayer, 35, 30, 40);
        spring(pos(heroLayer), 18, 39, [W / 2 + 1100, 940], [W / 2, 940], 0.06);
        keys(rot(heroLayer), [18, 39, 120], [25, 0, -3]);

        var packLayer = image(comp, pack, "Pack", 760, 600, [W / 2, 1570]);
        dropShadow(packLayer, 35, 25, 30);
        spring(pos(packLayer), 39, 60, [W / 2, 1570 + 900], [W / 2, 1570], 0.08);
        rot(packLayer).expression = "Math.sin(timeToFrames(time) / 10) * 4;";

        var flash = comp.layers.addSolid(C.white, "Boum flash", W, H, 1, comp.duration);
        keys(opa(flash), [12, 15, 24], [0, 50, 0]);
        return comp;
    }

    // ---------- Scene 4: Outro (120 frames) ----------

    function buildOutro() {
        var comp = newComp("04 Outro", 120);
        background(comp, "Background", C.bubblePink, C.hotPink, false);
        bubbles(comp, C.white);

        logo(comp, 0, 200, [W / 2, 192], [W / 2, 406]);

        var boxP = image(comp, IMG.boxPasteque, "Box pastèque", 640, 640, [320, 1220]);
        dropShadow(boxP, 30, 30, 40);
        rot(boxP).setValue(-6);
        spring(pos(boxP), 15, 33, [320 - 700, 1220], [320, 1220], 0.06);

        var boxF = image(comp, IMG.boxFraise, "Box fraise", 620, 620, [750, 1270]);
        dropShadow(boxF, 30, 30, 40);
        rot(boxF).setValue(5);
        spring(pos(boxF), 21, 39, [750 + 700, 1270], [750, 1270], 0.06);

        var badge = controlNull(comp, "Badge control", [895, 815]);
        var circle = comp.layers.addShape();
        circle.name = "Badge circle";
        var cc = shapeContents(circle);
        var g = cc.addProperty("ADBE Vector Group");
        var gc = g.property("ADBE Vectors Group");
        gc.addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([230, 230]);
        var stroke = gc.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(C.white);
        stroke.property("ADBE Vector Stroke Width").setValue(8);
        addFill(gc, C.green);
        pos(circle).setValue([895, 815]);
        var badgeText = text(comp, "Badge text", "Colorants\rnaturels", FONT_BODY, 44, C.white, null, 0, [895, 815], 46);
        attach(circle, badge);
        attach(badgeText, badge);
        spring(scl(badge), 42, 54, [0, 0], [100, 100], 0.2);
        rot(badge).expression = "12 + Math.sin(timeToFrames(time) / 8) * 6;";

        var cta = text(comp, "CTA", "Fais BOUM !", FONT_DISPLAY, 150, C.logoRed, C.white, 24, [W / 2, 1655]);
        candyShadow(cta);
        keys(scl(cta), [54, 66, 84, 88.5, 93], [[0, 0], [100, 100], [100, 100], [110, 110], [100, 100]]);
        return comp;
    }

    // ---------- Main comp ----------

    var intro = buildIntro();
    var pasteque = buildFlavor("02 Pastèque", "PASTÈQUE", "Fourré coulis goût",
        C.green, C.greenDark, IMG.gumPasteque, IMG.packsPasteque);
    var fraise = buildFlavor("03 Fraise", "FRAISE", "Fourré goût",
        C.strawberry, C.strawberryDark, IMG.packFraise, IMG.boxFraise);
    var outro = buildOutro();

    var main = proj.items.addComp("Boum Boum Promo", W, H, 1, 405 / FPS, FPS);

    function place(comp, startFrame) {
        var layer = main.layers.add(comp);
        layer.startTime = f(startFrame);
        return layer;
    }

    // Each new layer lands on top, so incoming scenes sit above outgoing ones.
    var lIntro = place(intro, 0);
    var lPasteque = place(pasteque, 75);
    var lFraise = place(fraise, 180);
    var lOutro = place(outro, 285);

    var CX = W / 2;
    var CY = H / 2;
    // Intro -> Pasteque: slide up from the bottom (frames 75-90)
    keys(pos(lPasteque), [75, 90], [[CX, CY + H], [CX, CY]], 80);
    keys(pos(lIntro), [75, 90], [[CX, CY], [CX, CY - H]], 80);

    // Pasteque -> Fraise: wipe in from the right (frames 180-195)
    var wipe = lFraise.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
    wipe.property("ADBE Linear Wipe-0002").setValue(90);
    keys(wipe.property("ADBE Linear Wipe-0001"), [180, 195], [100, 0], 33);

    // Fraise -> Outro: slide down from the top (frames 285-300)
    keys(pos(lOutro), [285, 300], [[CX, CY - H], [CX, CY]], 80);
    keys(pos(lFraise), [285, 300], [[CX, CY], [CX, CY + H]], 80);

    var lMusic = main.layers.add(music);
    lMusic.name = "Music";
    lMusic.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-4.4, -4.4]);
    var lSfx = main.layers.add(sfx);
    lSfx.name = "Sound effects";
    lSfx.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-0.9, -0.9]);

    main.openInViewer();
    app.endUndoGroup();

    var out = new File(ROOT.fsName + "/BoumBoum.aep");
    proj.save(out);
    alert("Boum Boum promo built and saved to:\n" + out.fsName);
})();
