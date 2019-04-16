//-----------------------------------------
//调用方式
var wpsm = WewinPrintServiceModule({
    printerName: "P50",
    fontName: "宋体",
    dots: 8
});

wpsm.PrintText({
    str: ["请输入内容", "请输入内容"],
    fontHeight: 16,
    fontWeight: 400,
    printWidth: 160,
    x: 100,
    y: 100,
    rotate: 3,
    xoffset: 2,
    loffset: 1,
    maxH: 25,
    ptype: 0
});
//-----------------------------------------

var WewinPrintServiceModule = function (obj) {

    function WewinPrintServiceModule(obj) {
        this.initParams(obj);
    }

    WewinPrintServiceModule.prototype = {
        /**
         * 初始化原始参数
         */
        initParams: function (obj) {
            this.printername = obj.printerName;
            this.fontname = obj.fontName;
            this.dots = obj.dots;
            this.measureDiv = null;
            this.initDom();
        },
        initDom: function () {
            var div = document.createElement("div");
            div.id = "divgetlen";
            div.style.position = "absolute";
            div.style.marginLeft = "-10000px";
            div.style.fontFamily = this.fontname;
            document.body.appendChild(div);
            this.measureDiv = document.getElementById('divgetlen');
        }
    }

    /**
     * 测量字符串长度
     * @param {String} str 需要测量的字符串(单字符或字符串)
     * @param {Number} size 字体大小
     * @returns {Number} 返回字符串像素长度
     */
    WewinPrintServiceModule.prototype.getLen = function (str, size) {
        var length = 0;
        var texts = [];
        if (str.length != 1) {
            texts = str.split("");
        } else {
            texts[0] = str;
        }
        //IE浏览器
        var dom = this.measureDiv;
        for (var i = 0; i < texts.length; i++) {
            if (this.isChinese(texts[i]) || this.isBig(texts[i])) {
                length += size;
            } else if (this.isWordOrNum(texts[i]) || this.isSmall(texts[i])) {
                length += size / 2;
            } else {
                dom.style.fontSize = size + "px";
                dom.innerHTML = texts[i];
                if (dom.clientWidth == 0) {
                    length += dom.scrollWidth;
                } else {
                    length += dom.clientWidth;
                }
            }
        }
        return length;
    }

    /**
     * 文本打印函数
     * @param {String} str - 需要打印的字符串
     * @param {Number} fontHeight - 字体高度
     * @param {Number} fontWeight - 字体黑度
     * @param {Number} printWidth - 换行宽度
     * @param {Number} x - x坐标
     * @param {Number} y - y坐标
     * @param {Number} rotate - 旋转
     * @param {Number} xoffset - Text内部行间距
     * @param {Number} loffset - Text外部行间距
     * @param {Number} maxH - 换行间距
     * @param {Number} ptype - 打印方式（0：靠左打印；1：居中打印；2：靠右打印）
     * @param {Number} startPos - 垂直居中打印的起始坐标
     * @param {Number} centerThick - 垂直居中打印的限制高度
     * @param {Number} height - 标签高度
     * @returns {Array} 返回当前打印文本的json数组
     */
    WewinPrintServiceModule.prototype.PrintText = function (obj) {
        var str = obj.str;
        var fontHeight = obj.fontHeight;
        var fontWidth = fontHeight / 2;
        var fontWeight = obj.fontWeight;
        var printWidth = obj.printWidth;
        var x = obj.x;
        var y = obj.y;
        var rotate = obj.rotate;
        var xoffset = obj.xoffset;
        var loffset = obj.loffset;
        var ptype = obj.ptype;
        var dots = this.dots;

        var backstr = [];
        var flag = true;

        var startPos = obj.startPos;
        var centerThick = obj.centerThick;
        var height = obj.height;

        var resultArr = [];

        //获取打印机分辨率(8 | 12)
        x = x / 8 * dots;
        y = y / 8 * dots;
        fontHeight = fontHeight / 8 * dots;
        printWidth = printWidth / 8 * dots;

        var pname = this.printername;
        if (rotate == 0) {
            //正竖向打印(y递增)
            var maxY = y + obj.maxH * dots;
            var newY = y;

            var tempHeight1 = 0, tempHeight2 = fontHeight, temp = 0;
            while (flag) {
                if (temp != 0 && (fontHeight == tempHeight1 || fontHeight == tempHeight2)) {
                    flag = false;
                }
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newY += fontHeight + xoffset;
                    }
                    newY += loffset;
                }
                if (newY > maxY) {
                    //范围外
                    newY = y;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight2 = fontHeight;
                    }
                } else if (newY < maxY) {
                    //范围内
                    newY = y;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight1 = fontHeight;
                    }
                }
                fontHeight = Math.floor((tempHeight1 + tempHeight2) / 2);
            }
            fontHeight = tempHeight2;

            flag = true;
            newY = y;

            while (flag) {
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newY += fontHeight + xoffset;
                    }
                    newY += loffset;
                }
                if (newY > maxY) {
                    newY = y;
                    fontHeight--;
                } else {
                    flag = false;
                }
            }

            fontWidth = fontHeight / 2;
            var tempH = y;
            if (startPos != undefined && centerThick != undefined && height != undefined) {
                startPos *= dots;
                centerThick *= dots;
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        y += fontHeight + xoffset;
                    }
                    y += loffset;
                }
                y = startPos + (centerThick / 2 - Math.abs(y - loffset - tempH) / 2);
            }
            for (var i = 0; i < str.length; i++) {
                backstr = this.autoSplit(fontHeight, str[i], printWidth);
                for (var j = 0; j < backstr.length; j++) {
                    var tempX = x;
                    tempX = this.returnPtype(backstr[j], ptype, tempX, fontHeight, printWidth, "+");
                    if (pname.indexOf("P50") > -1 || pname.indexOf("P30") > -1 || pname.indexOf("H50Plus") > -1 || pname.indexOf("P70") > -1) {
                        printUtil.DrawTextTrueTypeW30(tempX, y, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    } else {
                        printUtil.DrawTextTrueTypeW1200(tempX, y, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    }
                    y += fontHeight + xoffset;
                }
                y += loffset;
            }
        } else if (rotate == 1) {
            //右横向打印(x递增)
            var maxX = x + obj.maxH * dots;
            var newX = x;

            var tempHeight1 = 0, tempHeight2 = fontHeight, temp = 0;
            while (flag) {
                if (temp != 0 && (fontHeight == tempHeight1 || fontHeight == tempHeight2)) {
                    flag = false;
                }
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newX += fontHeight + xoffset;
                    }
                    newX += loffset;
                }
                if (newX > maxX) {
                    //范围外
                    newX = x;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight2 = fontHeight;
                    }
                } else if (newX < maxX) {
                    //范围内
                    newX = x;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight1 = fontHeight;
                    }
                }
                fontHeight = Math.floor((tempHeight1 + tempHeight2) / 2);
            }
            fontHeight = tempHeight2;

            flag = true;
            newX = x;

            while (flag) {
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newX += fontHeight + xoffset;
                    }
                    newX += loffset;
                }
                if (newX > maxX) {
                    newX = x;
                    fontHeight--;
                } else {
                    flag = false;
                }
            }

            fontWidth = fontHeight / 2;
            var tempH = x;
            if (startPos != undefined && centerThick != undefined && height != undefined) {
                startPos *= dots;
                centerThick *= dots;
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        x += fontHeight + xoffset;
                    }
                    x += loffset;
                }
                x = (height - startPos) + (centerThick / 2 - Math.abs(x - loffset - tempH) / 2);
            }
            for (var i = 0; i < str.length; i++) {
                backstr = this.autoSplit(fontHeight, str[i], printWidth);
                for (var j = 0; j < backstr.length; j++) {
                    var tempY = y;
                    tempY = this.returnPtype(backstr[j], ptype, tempY, fontHeight, printWidth, "-");
                    if (pname.indexOf("P50") > -1 || pname.indexOf("P30") > -1 || pname.indexOf("H50Plus") > -1 || pname.indexOf("P70") > -1) {
                        printUtil.DrawTextTrueTypeW30(x, tempY, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    } else {
                        printUtil.DrawTextTrueTypeW1200(x, tempY, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    }
                    x += fontHeight + xoffset;
                }
                x += loffset;
            }
        } else if (rotate == 2) {
            //反竖向打印(y递减)
            var minY = y - obj.maxH * dots;
            var newY = y;

            var tempHeight1 = 0, tempHeight2 = fontHeight, temp = 0;
            while (flag) {
                if (temp != 0 && (fontHeight == tempHeight1 || fontHeight == tempHeight2)) {
                    flag = false;
                }
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newY -= fontHeight + xoffset;
                    }
                    newY -= loffset;
                }
                if (newY < minY) {
                    //范围外
                    newY = y;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight2 = fontHeight;
                    }
                } else if (newY > minY) {
                    //范围内
                    newY = y;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight1 = fontHeight;
                    }
                }
                fontHeight = Math.floor((tempHeight1 + tempHeight2) / 2);
            }
            fontHeight = tempHeight2;

            flag = true;
            newY = y;

            while (flag) {
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newY -= fontHeight + xoffset;
                    }
                    newY -= loffset;
                }
                if (newY < minY) {
                    newY = y;
                    fontHeight--;
                } else {
                    flag = false;
                }
            }

            fontWidth = fontHeight / 2;
            var tempH = y;
            if (startPos != undefined && centerThick != undefined && height != undefined) {
                startPos *= dots;
                centerThick *= dots;
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        y -= fontHeight + xoffset;
                    }
                    y -= loffset;
                }
                y = startPos - (centerThick / 2 - Math.abs(y + loffset - tempH) / 2);
            }
            for (var i = 0; i < str.length; i++) {
                backstr = this.autoSplit(fontHeight, str[i], printWidth);
                for (var j = 0; j < backstr.length; j++) {
                    var tempX = x;
                    tempX = this.returnPtype(backstr[j], ptype, tempX, fontHeight, printWidth, "-");
                    if (pname.indexOf("P50") > -1 || pname.indexOf("P30") > -1 || pname.indexOf("H50Plus") > -1 || pname.indexOf("P70") > -1) {
                        printUtil.DrawTextTrueTypeW30(tempX, y, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    } else {
                        printUtil.DrawTextTrueTypeW1200(tempX, y, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    }
                    y -= fontHeight + xoffset;
                }
                y -= loffset;
            }
        } else if (rotate == 3) {
            //左横向打印(x递减)
            var minX = x - obj.maxH * dots;
            var newX = x;

            var tempHeight1 = 0, tempHeight2 = fontHeight, temp = 0;
            while (flag) {
                if (temp != 0 && (fontHeight == tempHeight1 || fontHeight == tempHeight2)) {
                    flag = false;
                }
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newX -= fontHeight + xoffset;
                    }
                    newX -= loffset;
                }
                if (newX < minX) {
                    //范围外
                    newX = x;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight2 = fontHeight;
                    }
                } else if (newX > minX) {
                    //范围内
                    newX = x;
                    if (temp == 0) {
                        temp++;
                    } else {
                        tempHeight1 = fontHeight;
                    }
                }
                fontHeight = Math.floor((tempHeight1 + tempHeight2) / 2);
            }
            fontHeight = tempHeight2;

            flag = true;
            newX = x;

            while (flag) {
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        newX -= fontHeight + xoffset;
                    }
                    newX -= loffset;
                }
                if (newX < minX) {
                    newX = x;
                    fontHeight--;
                } else {
                    flag = false;
                }
            }

            fontWidth = fontHeight / 2;
            var tempH = x;
            if (startPos != undefined && centerThick != undefined && height != undefined) {
                startPos *= dots;
                centerThick *= dots;
                for (var i = 0; i < str.length; i++) {
                    backstr = this.autoSplit(fontHeight, str[i], printWidth);
                    for (var j = 0; j < backstr.length; j++) {
                        x -= fontHeight + xoffset;
                    }
                    x -= loffset;
                }
                x = Math.abs(startPos - centerThick) - (centerThick / 2 - Math.abs(x + loffset - tempH) / 2);
            }
            for (var i = 0; i < str.length; i++) {
                backstr = this.autoSplit(fontHeight, str[i], printWidth);
                for (var j = 0; j < backstr.length; j++) {
                    var tempY = y;
                    tempY = this.returnPtype(backstr[j], ptype, tempY, fontHeight, printWidth, "+");
                    if (pname.indexOf("P50") > -1 || pname.indexOf("P30") > -1 || pname.indexOf("H50Plus") > -1 || pname.indexOf("P70") > -1) {
                        printUtil.DrawTextTrueTypeW30(x, tempY, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    } else {
                        printUtil.DrawTextTrueTypeW1200(x, tempY, fontHeight, fontWidth, this.fontname, rotate, 600, backstr[j]);
                    }
                    x -= fontHeight + xoffset;
                }
                x -= loffset;
            }
        }

        return resultArr;
    }

    /**
     * 返回打印方式的坐标
     * @param {String} str 
     * @param {Number} ptype 
     * @param {Number} xy 
     * @param {Number} fontHeight 
     * @param {Number} printWidth 
     * @param {String} operator 
     * @return {Number}  
     */
    WewinPrintServiceModule.prototype.returnPtype = function (str, ptype, xy, fontHeight, printWidth, operator) {
        var newXY = xy;
        var strLen = this.getLen(str, fontHeight);
        if (ptype == 0) {
            //靠左打印
            newXY = xy;
        } else if (ptype == 1) {
            //居中打印
            if (operator == "+") {
                newXY += printWidth / 2 - strLen / 2;
            } else if (operator == "-") {
                newXY -= printWidth / 2 - strLen / 2;
            }
        } else if (ptype == 2) {
            //靠右打印
            if (operator == "+") {
                newXY += printWidth - strLen;
            } else if (operator == "-") {
                newXY -= printWidth - strLen;
            }
        }
        return newXY;
    }

    /**
     * 分割字符串
     * @param {Number} fontHeight - 字体高度
     * @param {String} str - 字符串
     * @param {Number} printWidth - 换行宽度
     * @return {Array} 分割字符串的数组
     */
    WewinPrintServiceModule.prototype.autoSplit = function (fontHeight, str, printWidth) {
        var strLen = 0;
        var temp = 0;
        var backstr = [];
        var strs = str.split("");
        var tLen = 0;
        for (var i = 0; i < strs.length; i++) {
            tLen = this.getLen(strs[i], fontHeight);
            strLen += tLen;
            if ((strLen - printWidth) > 0) {
                backstr.push(str.substring(temp, i));
                temp = i;
                strLen = 0;
                i--;
                tArr = [];
                letter = [];
            }
            if (i == str.length - 1) {
                backstr.push(str.substring(temp, i + 1));
            }
        }
        return backstr;
    }

    /**
     * 是否是中文
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintServiceModule.prototype.isChinese = function (temp) {
        var re = /^[\u4E00-\u9FA5]/;
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是英文字母或数字
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintServiceModule.prototype.isWordOrNum = function (temp) {
        var re = /^[A-Za-z0-9]/;
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是英文符号
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintServiceModule.prototype.isSmall = function (temp) {
        var re = new RegExp("[`~!@#$^&*()=|{}':;,\\[\\].<>/?]");
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是中文符号
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintServiceModule.prototype.isBig = function (temp) {
        var re = new RegExp("[《》！（）【】；：。，、？￥……‘’”“——]");
        if (re.test(temp)) return true;
        return false;
    }

    return new WewinPrintServiceModule(obj);
}