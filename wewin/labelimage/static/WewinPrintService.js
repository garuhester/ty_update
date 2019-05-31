/**
 * Name: WEWIN 通用式插件 API v1.0.7
 * Time: 2019/05/31
 * Author: WEWIN资管组
 */
var WewinPrintService = function () {

    function WewinPrintService() {
        this.initParams();
    }

    WewinPrintService.prototype = {
        /**
         * 初始化原始参数
         */
        initParams: function () {
            this.printername = "";//打印机名称
            this.Isp30 = -1;
            this.fontname = "宋体";//打印默认字体
            this.data = [];//打印数据
            this.dots = 0;//打印机分辨率点数
            this.measureDiv = null;//测量字符长度div
            this.measureCanvas = null;//测量字符长度canvas
            this.DEFAULT_VERSION = 8.0;//动态二维码生成方式IE版本判断
            this.xmlWrong = 0;//打印数据是否符合规范参数
            this.noview = "";//无预览参数
            this.qrcode = "";//动态二维码生成方式参数
            this.modal = false;//IE模态框预览方式参数
            this.printNum = -1;//每张打印份数参数
            this.minPrintNum = 1;//每张打印份数最小值
            this.maxPrintNum = 99;//每张打印份数最大值

            this.noViewTip = "没有找到对应打印机";//无预览监测打印机型号提示
            this.noServiceTip = "请安装插件或启动服务";//监测插件情况提示
            this.printNumTip = "每张打印份数请输入" + this.minPrintNum + "-" + this.maxPrintNum + "的整数数字";//每张打印份数提示
        },
        /**
         * 初始化点击事件
         */
        initClickEvent: function () {
            $(".view").click(function () {
                $(this).remove();
            });
            $(".view .main").click(function () {
                window.event.stopPropagation();
            });
        }
    }

    /**
     * 测量字符串长度
     * @param {String} str 需要测量的字符串(单字符或字符串)
     * @param {Number} size 字体大小
     * @returns {Number} 返回字符串像素长度
     */
    WewinPrintService.prototype.getLen = function (str, size) {
        var webType = this.isIE();
        var length = 0;
        var texts = [];
        if (str.length != 1) {
            texts = str.split("");
        } else {
            texts[0] = str;
        }
        if (webType) {
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
        } else {
            //非IE浏览器
            for (var i = 0; i < texts.length; i++) {
                if (this.isChinese(texts[i]) || this.isBig(texts[i])) {
                    length += size;
                } else if (this.isWordOrNum(texts[i]) || this.isSmall(texts[i])) {
                    length += size / 2;
                } else {
                    this.measureCanvas.font = size + "px " + this.fontname;
                    length += this.measureCanvas.measureText(texts[i]).width;
                }
            }
            return length;
        }
    }

    /**
     * 打印数据入口，获取用户传入的打印数据
     * @param {String} data 打印数据
     */
    WewinPrintService.prototype.LabelPrint = function (data) {
        this.data = data;
    }

    /**
     * 预览窗口加载
     */
    WewinPrintService.prototype.Load = function () {
        this.CreateView();
        this.Getperinterlist();
    }

    /**
     * 设置预览相关信息
     * @param {String} title 预览页面标题
     * @param {String} version 版本号
     */
    WewinPrintService.prototype.SetViewInfo = function (obj) {
        //预览页面标题(修改为：重庆品胜 - 新疆移动 - 打印预览)
        document.getElementById("btitle").innerHTML = obj.title;

        //修改版本号
        document.getElementById("versionnum").innerHTML = obj.version;
    }

    /**
     * 设置打印相关信息
     * @param {String} printers 支持的打印机型号
     */
    WewinPrintService.prototype.SetPrintInfo = function (printers) {
        //支持的打印机型号
        document.getElementById("printtype").innerHTML = printers;
        //打印张数
        document.getElementById("printtype2").innerHTML = "打印张数: <span style='font-weight:bold;color:red'>1张</span>";
        //当前模板
        var labelname = document.getElementById("labelname");
        var index = labelname.selectedIndex; // 选中索引
        var content = labelname.options[index].text; // 选中文本
        document.getElementById("printtype3").innerHTML = "当前模板: <span style='font-weight:bold;color:red'>" + content + "</span>";

        //每张打印份数
        if (this.printNum != -1 && document.getElementById('printNum') != null) {
            document.getElementById('printNum').value = this.printNum;
        }
    }

    /**
     * 创建预览窗口
     */
    WewinPrintService.prototype.CreateView = function () {

        var html = "";
        html += "<div class=\"wewinview2 noselect\"><\/div>";
        html += "<div class=\"wewinview noselect\">";
        html += "    <div class=\"wewinmain\">";
        html += "        <div class=\"bigtitle\" id=\"btitle\">";
        html += "            重庆品胜 - 资管打印 - 打印预览";
        html += "        <\/div>";
        html += "        <div class=\"wewinsplit\"><\/div>";
        html += "        <div class=\"choose\">";
        html += "            <div class=\"title\" id=\"printnamediv\">";
        html += "                <div class=\"line\">";
        html += "                    <div class=\"left\">选择打印机：<\/div>";
        html += "                    <div class=\"right\">";
        html += "                        <select style=\"width: 100%;height: 100%;border-radius: 5px;outline: none;font-size: 14px;\" id=\"printername\" onchange=\"\"><\/select>";
        html += "                    <\/div>";
        html += "                <\/div>";
        html += "                <div class=\"line\">";
        html += "                    <div class=\"left\">标签型号：<\/div>";
        html += "                    <div class=\"right\">";
        html += "                        <select style=\"width: 100%;height: 100%;border-radius: 5px;outline: none;font-size: 14px;\" id=\"labelname\" onchange=\"changetype()\"><\/select>";
        html += "                    <\/div>";
        html += "                <\/div>";
        html += "            <\/div>";
        html += "            <div style=\"margin-bottom:5px;\" class=\"wewininfo\">";
        html += "                该标签支持的打印机型号：";
        html += "                <span id=\"printtype\"><\/span>";
        html += "            <\/div>";
        html += "            <div style=\"margin-bottom:10px;\" class=\"wewininfo2\">";
        html += "                <span style=\"display:inline-block;margin-right:10px;\" id=\"printtype2\"><\/span>";
        html += "                <span style=\"display:inline-block;margin-left:10px;\" id=\"printtype3\"><\/span>";
        html += "            <\/div>";
        html += "        <\/div>";
        html += "        <div class=\"wewinbtns\">";
        html += "            <button style=\"color: #fff;border: none;padding: 5px 15px 5px 15px;border-radius: 50px;margin-left: 5px;margin-right: 5px;cursor: pointer;outline: none;font-size: 16px;\" class=\"wewinbtn\" type=\"button\" name=\"print\" onclick=\"Print()\">";
        html += "                打印";
        html += "            <\/button>";
        html += "            <button style=\"color: #fff;border: none;padding: 5px 15px 5px 15px;border-radius: 50px;margin-left: 5px;margin-right: 5px;cursor: pointer;outline: none;font-size: 16px;\" class=\"wewinbtn\" type=\"button\" name=\"print\" onclick=\"lookXml()\">";
        html += "                查看报文";
        html += "            <\/button>";
        html += "            <button style=\"color: #fff;border: none;padding: 5px 15px 5px 15px;border-radius: 50px;margin-left: 5px;margin-right: 5px;cursor: pointer;outline: none;font-size: 16px;\" class=\"wewinbtn\" type=\"button\" name=\"print\" onclick=\"lookHelp()\">";
        html += "                帮助";
        html += "            <\/button>";
        if (!this.modal) {
            html += "            <button style=\"color: #fff;border: none;padding: 5px 15px 5px 15px;border-radius: 50px;margin-left: 5px;margin-right: 5px;cursor: pointer;outline: none;font-size: 16px;\" class=\"wewinbtn\" type=\"button\" name=\"close\" onclick=\"$('.wewinview').remove();$('.wewinview2').remove();\">";
            html += "                关闭";
            html += "            <\/button>";
        }
        html += "        <\/div>";
        if (this.printNum != -1) {
            html += "        <div class=\"wewinbtns\">";
            html += "           <span style='color: #FF3B30;font-weight:bold;'>每张打印份数：<\/span><input id='printNum' type='number' max='" + this.maxPrintNum + "' min='" + this.minPrintNum + "' style='ime-mode:disabled;width:55px;border-radius: 5px;outline: none;font-size: 14px;padding: 2px;padding-left:5px;box-sizing: border-box;margin-top:7px;' onKeyPress=\"if(event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;\" onKeyUp=\"this.value=this.value.replace(/\\D/g,'')\" /> (" + this.minPrintNum + "-" + this.maxPrintNum + ") 份";
            html += "        <\/div>";
        }
        html += "        <div class=\"wewinsplit2\"><\/div>";
        if (this.printNum != -1) {
            html += "        <div class=\"tags\" style='height: calc(100% - 255px);'>";
        } else {
            html += "        <div class=\"tags\" style='height: calc(100% - 245px);'>";
        }
        html += "            <div style=\"margin-bottom: 50px;text-align:center;\" id=\"preview\"><\/div>";
        html += "        <\/div>";
        html += "        <div class=\"wewindown\">";
        html += "            <div class=\"left version\">版本号：";
        html += "                <span id=\"versionnum\"><\/span>";
        html += "            <\/div>";
        html += "            <div class=\"right\">";
        html += "                <a style=\"color: #000;font-size: 14px;\" href=\".\/plug(pop)_V1.0.7.zip\" target=\"_blank\">wewin打印服务插件下载<\/a>";
        html += "            <\/div>";
        html += "        <\/div>";
        if (!this.modal) {
            html += "        <div class=\"cha\" onclick=\"$('.wewinview').remove();$('.wewinview2').remove();\">&#10006<\/div>";
        }
        html += "    <\/div>";
        html += "    <canvas id=\"wewincanvas\" style=\"display: none\"><\/canvas>";
        html += "<\/div>";
        $(document.body).append(html);

        var webType = this.isIE();
        if (webType) {
            //测量div
            var div = document.createElement("div");
            div.id = "divgetlen";
            div.style.position = "absolute";
            div.style.marginLeft = "-10000px";
            div.style.fontFamily = this.fontname;
            document.body.appendChild(div);
            this.measureDiv = document.getElementById('divgetlen');
        } else {
            //测量canvas
            var canvas = document.getElementById('wewincanvas');
            this.measureCanvas = canvas.getContext("2d");
        }
        // this.initClickEvent();
    }

    /**
     * 获取打印机列表，并添加到下拉选择框
     */
    WewinPrintService.prototype.Getperinterlist = function () {
        var _this = this;
        //查询打印机数据
        var rawData = {
            "handleType": "0",
            "printer": "",
            "hasDrive": "0",
            "copyNum": "1",
            "labels": [
                {
                    "labelWidth": "0",
                    "labelHeight": "0",
                    "rfid": "",
                    "ddfLength": "0",
                    "cutOption": "0",
                    "blocks": []
                }
            ]
        }
        var sendData = "";
        sendData = this.resolveData(rawData);
        var url = this.getTrueUrl();

        var _this = this;
        this.Ajax('post', url, sendData, function (data) {
            console.log('非jsonp-查询-success：' + data);
            _this.AddPrinter(data);
        }, function (error) {
            if (error == 0) {
                alert(_this.noServiceTip);
                return;
            }
            console.log('非jsonp-查询-error：' + error);
            $.ajax({
                url: url,
                type: 'POST',
                data: sendData,
                dataType: "jsonp",
                jsonpCallback: "wwprint",
                success: function (data) {
                    console.log("jsonp-查询-success：", data);
                    _this.AddPrinter(JSON.stringify(data));
                },
                error: function (error) {
                    alert(_this.noServiceTip);
                    console.log("jsonp-查询-error：", error);
                }
            });
        });
    }

    /**
     * 封装jsonp请求
     * @param {Object} obj ajax参数
     */
    WewinPrintService.prototype.AjaxJsonp = function (obj) {
        //---------------------
        //调用方式
        // var _this = this;
        // this.AjaxJsonp({
        //     url: url,
        //     data: sendData,
        //     jsonpCallback: "wwprint",
        //     success: function (data) {
        //         console.log("jsonp-查询-success：", data);
        //         _this.AddPrinter(JSON.stringify(data));
        //     },
        //     error: function (error) {
        //         console.log("jsonp-查询-error：", error);
        //     }
        // });
        //---------------------
        var script = document.createElement('script');
        var rnum = Math.floor(Math.random() * 100000000 + 500);

        // eval(obj.jsonpCallback + " = obj.success; ");
        $(function () {
            window.wwprint = obj.success;
        })

        var url = obj.url + "/?callback=" + obj.jsonpCallback + "&name=" + obj.data + "&_=" + rnum;
        console.log(url)
        script.setAttribute('src', url);
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    /**
     * 添加查询的打印机
     * @param {String} data 查询打印机获取的数据
     */
    WewinPrintService.prototype.AddPrinter = function (data) {
        var printers = [];
        var jsonData = JSON.parse(data);
        printers = jsonData.content;
        var pelement = document.getElementById("printername");
        if (pelement != null) {
            pelement.innerHTML = "";
        }

        var temp = true;
        for (var i = 0; i < printers.length; i++) {
            var pname = printers[i];
            if (pname.printer.toLowerCase().indexOf("wewin") != -1 || pname.printer.indexOf("HiTi") != -1) {
                temp = false;
            }
        }
        if (temp) {
            pelement.options.add(new Option("当前无WEWIN打印机，请接入", "-1"));
        }

        for (var i = 0; i < printers.length; i++) {
            var pname = printers[i];
            if (pname.printer.toLowerCase().indexOf("wewin") != -1 || pname.printer.indexOf("HiTi") != -1) {
                pelement.options.add(new Option(pname.printer, pname.printer + "&&" + pname.dots + "&&" + pname.hasDrive));
            }
        }
    }

    /**
     * 打印预览函数
     * @param {Function} viewPrintFunc 
     */
    WewinPrintService.prototype.ViewPrint = function (viewPrintFunc) {
        viewPrintFunc(this.data);
    }

    /**
     * 查看报文
     */
    WewinPrintService.prototype.lookXml = function () {
        var copyData = JSON.stringify(this.data);

        //复制打印数据
        try {
            if (this.isIE()) {
                window.clipboardData.setData("Text", copyData);
            } else {
                var oInput = document.createElement('input');
                oInput.value = copyData;
                document.body.appendChild(oInput);
                oInput.select();
                document.execCommand("Copy");
                oInput.id = 'oInput';
                oInput.style.display = 'none';
                $("#oInput").remove();
            }
        } catch (error) {
            console.log(error);
        }

        alert(copyData);
    }

    /**
     * 查看帮助
     */
    WewinPrintService.prototype.lookHelp = function () {
        var text = "";
        text += "————————重庆品胜科技有限公司————————\n";
        text += "帮助：\n";
        text += "* H50plus\/P1200\/268系列打印机需安装驱动；\n";
        text += "* 请在页面底部下载最新的wewin打印服务插件；\n";
        text += "* 若使用IE浏览器版本为IE9及以下，点击IE浏览器的的“工具->Internet 选项->安全->自定义级别” 将 “其他” 选项中的 “通过域访问数据源” 选中为 “启用” 或者 “提示” ，点击确定就可以了。\n";
        text += "* 服务热线：4000238080";
        alert(text);
    }

    /**
     * 设置选中的打印机
     */
    WewinPrintService.prototype.GetPrinter = function () {
        this.printername = document.getElementById("printername").value;
        if (this.printername == "-1") {
            alert("当前无WEWIN打印机，请接入");
            return;
        }
    }

    /**
     * 无预览打印
     * @param {String} 打印数据
     * @param {String} 打印机名称
     * @param {Function} 回调函数
     */
    WewinPrintService.prototype.SetPrinter = function (tagData, printer, func) {
        this.data = tagData;
        this.printername = "";
        this.noview = "1";
        var _this = this;
        var html = "<canvas id=\"wewincanvas\" style=\"display: none\"><\/canvas>";
        $(document.body).append(html);

        var webType = this.isIE();
        if (webType) {
            //测量div
            var div = document.createElement("div");
            div.id = "divgetlen";
            div.style.position = "absolute";
            div.style.marginLeft = "-10000px";
            div.style.fontFamily = this.fontname;
            document.body.appendChild(div);
            this.measureDiv = document.getElementById('divgetlen');
        } else {
            //测量canvas
            var canvas = document.getElementById('wewincanvas');
            this.measureCanvas = canvas.getContext("2d");
        }

        if (printer.trim() == "") {
            this.printername = "";
            if (this.printername != "") {
                func();
            } else {
                alert(_this.noViewTip);
            }
            return;
        }

        //查询打印机数据
        var rawData = {
            "handleType": "0",
            "printer": "",
            "hasDrive": "0",
            "copyNum": "1",
            "labels": [
                {
                    "labelWidth": "0",
                    "labelHeight": "0",
                    "rfid": "",
                    "ddfLength": "0",
                    "cutOption": "0",
                    "blocks": []
                }
            ]
        }
        var sendData = "";
        sendData = this.resolveData(rawData);
        var url = this.getTrueUrl();

        var _this = this;
        this.Ajax('post', url, sendData, function (data) {
            console.log('非jsonp-查询-success：' + data);
            var jsonData = JSON.parse(data);
            var printers = jsonData.content;
            for (var i = 0; i < printers.length; i++) {
                if (printers[i].printer.toLowerCase().indexOf(printer.toLowerCase()) != -1) {
                    _this.printername = printers[i].printer + "&&" + printers[i].dots + "&&" + printers[i].hasDrive;
                    break;
                }
            }
            if (_this.printername != "") {
                func();
            } else {
                alert(_this.noViewTip);
            }
        }, function (error) {
            if (error == 0) {
                alert(_this.noServiceTip);
                return;
            }
            console.log('非jsonp-查询-error：' + error);
            $.ajax({
                url: url,
                type: 'POST',
                data: sendData,
                dataType: "jsonp",
                jsonpCallback: "wwprint",
                success: function (data) {
                    console.log("jsonp-查询-success：", JSON.stringify(data));
                    var jsonData = data;
                    var printers = jsonData.content;
                    for (var i = 0; i < printers.length; i++) {
                        if (printers[i].printer.toLowerCase().indexOf(printer.toLowerCase()) != -1) {
                            _this.printername = printer + "&&" + printers[i].dots + "&&" + printers[i].hasDrive;
                            break;
                        }
                    }
                    if (_this.printername != "") {
                        func();
                    } else {
                        alert(_this.noViewTip);
                    }
                },
                error: function (error) {
                    alert(_this.noServiceTip);
                    console.log("jsonp-查询-error：", error);
                }
            });

        });
    }

    /**
     * 打印函数
     * @param {Function} doLabelPrintFunc 
     */
    WewinPrintService.prototype.DoLabelPrint = function (doLabelPrintFunc) {
        if (this.noview != "1") {
            var supportPrinter = document.getElementById("printtype").innerHTML;
            var supportPrinterArr = supportPrinter.split(" ");
            var temp = true;
            for (var i = 0; i < supportPrinterArr.length; i++) {
                if (this.printername.toLowerCase().indexOf(supportPrinterArr[i].toLowerCase()) != -1) {
                    temp = false;
                    break;
                }
            }
            if (temp) {
                alert("不支持该打印机型号");
                return;
            }
        }
        doLabelPrintFunc(this.data);
    }

    /**
     * 多个标签全选
     */
    WewinPrintService.prototype.chooseAllCheckbox = function () {
        var allchebox = document.getElementById("allcb");
        var data = this.data;

        if (typeof (data) == "string") {
            var xmldoc = loadXML(this.data);
            data = xmldoc.getElementsByTagName("Print");
        }

        if (allchebox.checked) {
            for (var i = 0; i < data.length; i++) {
                document.getElementById("cb" + i).checked = true;
            }
            //打印张数
            document.getElementById("printtype2").innerHTML = "打印张数: <span style='font-weight:bold;color:red'>" + data.length + "张</span>";
        } else {
            for (var i = 0; i < data.length; i++) {
                document.getElementById("cb" + i).checked = false;
            }
            //打印张数
            document.getElementById("printtype2").innerHTML = "打印张数: <span style='font-weight:bold;color:red'>0张</span>";
        }
    }

    /**
     * 选中单个标签
     */
    WewinPrintService.prototype.chooseOneCheckbox = function () {
        var data = this.data;

        if (typeof (data) == "string") {
            var xmldoc = loadXML(this.data);
            data = xmldoc.getElementsByTagName("Print");
        }

        var num = 0;
        for (var i = 0; i < data.length; i++) {
            if (document.getElementById("cb" + i).checked == true) {
                num++;
            }
        }

        //打印张数
        document.getElementById("printtype2").innerHTML = "打印张数: <span style='font-weight:bold;color:red'>" + num + "张</span>";
    }

    /**
     * 编码转换
     * @param {String} str 需要转换的字符串
     * @returns {String} 转换后的字符串
     */
    WewinPrintService.prototype.utf16to8 = function (str) {
        var out, i, len, c;
        out = "";
        str = this.isWrong(str);
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    /**
     * 每一张标签打多次处理
     */
    WewinPrintService.prototype.MulPrint = function (obj) {
        var printNumObj = document.getElementById('printNum');
        if (printNumObj != null) {
            this.printNum = document.getElementById('printNum').value;
            this.printNum = parseInt(this.printNum);
            if (typeof (this.printNum) != 'number' || this.printNum < this.minPrintNum || this.printNum > this.maxPrintNum || isNaN(this.printNum)) {
                return false;
            }
        }
        if (this.printNum == -1) {
            this.printNum = 1;
        }
        var newArr = [];
        for (var i = 0; i < obj.labels.length; i++) {
            var ar = [];
            for (var j = 0; j < this.printNum; j++) {
                ar.push(obj.labels[i]);
            }
            newArr.push(ar);
        }
        obj.labels = [];
        for (var i = 0; i < newArr.length; i++) {
            var cArr = newArr[i];
            for (var j = 0; j < cArr.length; j++) {
                obj.labels.push(cArr[j]);
            }
        }
        return obj;
    }

    /**
     * 打印方法
     * @param {Object} rawData 打印数据
     * @returns {String} 对象转字符串的打印数据
     */
    WewinPrintService.prototype.Print = function (rawData) {
        if (this.printername != -1) {
            var parr = this.printername.split("&&");
            var pname = parr[0];
            var dots = parr[1];
            var hasDrive = parr[2];
            rawData.printer = pname;
            rawData.hasDrive = hasDrive;
            rawData = this.MulPrint(rawData);
            if (rawData == false) {
                alert(this.printNumTip);
                return;
            }
            var sendData = "";
            sendData = this.resolveData(rawData);
            console.log("打印前的数据(json)：", JSON.parse(sendData));
            console.log("打印前的数据(string)：", sendData);
            var url = this.getTrueUrl();

            sendData = sendData.replace(/#/g, encodeURIComponent("#"));

            var _this = this;
            this.Ajax('post', url, sendData, function (data) {
                console.log('非jsonp-打印-success：' + data);
            }, function (error) {
                console.log('非jsonp-打印-error：' + error);
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: sendData,
                    dataType: "jsonp",
                    jsonpCallback: "wwprint",
                    success: function (data) {
                        console.log('jsonp-打印-success' + data);
                    },
                    error: function (error) {
                        console.log("jsonp-打印-error：", error);
                    }
                });
            });

            return sendData;
        } else {
            return "-1";
        }
    }

    /**
     * 解析原始数据为打印数据
     * @param {Object} rawData 原始数据对象
     * @returns {String} 转为字符串的数据
     */
    WewinPrintService.prototype.resolveData = function (rawData) {
        var sendData = "";
        sendData = JSON.parse(JSON.stringify(rawData), function (key, value) {
            if (typeof (value) == "number") {
                return value.toString();
            } else {
                return value;
            }
        });
        sendData = JSON.stringify(sendData);
        // console.log("resolveData: " + sendData);
        return sendData;
    }

    /**
     * Ajax请求封装
     * @param {String} type 请求类型
     * @param {String} url 请求地址
     * @param {String} data 请求参数
     * @param {Function} success 成功回调函数
     * @param {Function} failed 失败回调函数
     */
    WewinPrintService.prototype.Ajax = function (type, url, data, success, failed) {
        // 创建ajax对象
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
        }

        var type = type.toUpperCase();
        // 用于清除缓存
        var random = Math.random();

        if (typeof data == 'object') {
            var str = '';
            for (var key in data) {
                str += key + '=' + data[key] + '&';
            }
            data = str.replace(/&$/, '');
        }

        if (type == 'GET') {
            try {
                if (data) {
                    xhr.open('GET', url + '?' + data, true);
                } else {
                    xhr.open('GET', url + '?t=' + random, true);
                }
                xhr.send();
            } catch (error) {
                failed("error");
            }
        } else if (type == 'POST') {
            try {
                xhr.open('POST', url, true);
                // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(data);
            } catch (error) {
                failed("error");
            }
        }

        // 处理返回数据
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success(xhr.responseText);
                } else {
                    if (failed) {
                        failed(xhr.status);
                    }
                }
            }
        }
    }

    /**
     * 拼接数组
     * @param {Array} arr1 数组1
     * @param {Array} arr2 数组2
     * @returns {Array} 拼接数组1和数组2
     */
    WewinPrintService.prototype.addArr = function (arr1, arr2) {
        for (var i = 0; i < arr2.length; i++) {
            arr1.push(arr2[i]);
        }
        return arr1;
    }

    /**
     * 解析xml
     * @param {String} xmlString xml数据
     */
    WewinPrintService.prototype.loadXML = function (xmlString) {
        var xmlDoc = null;
        if (!window.DOMParser && window.ActiveXObject) {
            var xmlDomVersions = ['MSXML.2.DOMDocument.6.0',
                'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'
            ];
            for (var i = 0; i < xmlDomVersions.length; i++) {
                try {
                    xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xmlString);
                    break;
                } catch (e) { }
            }
        } else if (window.DOMParser && document.implementation &&
            document.implementation.createDocument) {
            try {
                domParser = new DOMParser();
                xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
            } catch (e) { }
        } else {
            return null;
        }
        return xmlDoc;
    }

    /**
     * rfid解析
     * @param {Object} obj 
     * @returns {String} rfid数据
     */
    WewinPrintService.prototype.rfidParse = function (obj) {
        var rfidType = obj.rfidType;
        var rfidWay = obj.rfidWay;
        var rfidData = obj.rfidData;
        var rfidResult = {
            "EPC": "01",
            "USER": "03"
        }
        var rfid = rfidResult[rfidType] + rfidWay + rfidData;

        return rfid;
    }

    /**
     * 判断浏览器是否为IE浏览器
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintService.prototype.isIE = function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 获取当前协议对应的请求服务地址
     * @returns 服务插件请求地址
     */
    WewinPrintService.prototype.getTrueUrl = function () {
        var url = "http://127.0.0.1:18188";
        var protocol = window.location.protocol.replace(":", "");
        var webType = this.isIE();

        if (webType) {
            if (protocol == "https") {
                url = "https://127.0.0.1:18189";
            }
        }

        console.log("请求服务地址：" + url);

        return url;
    }

    /**
     * 开始打印，获取配置参数
     * @param {Object} obj 配置参数
     * @param {Function} callback 回调函数
     */
    WewinPrintService.prototype.StartPrint = function (obj, callback, modalDialog) {

        this.xmlWrong = 0;

        if (obj == undefined) {
            obj = {};
        }
        //qrcode
        if (obj.qrcode != undefined) {
            this.qrcode = obj.qrcode.trim();
        }
        //modal
        if (obj.modal == undefined) {
            obj.modal = false;
        } else if (this.isIE()) {
            this.modal = obj.modal;
        }
        if (modalDialog == "modal") {
            this.modal = true;
        }
        //printNum
        if (obj.printNum != undefined && obj.printNum != null) {
            if (typeof (obj.printNum) != "number" || obj.printNum < this.minPrintNum || obj.printNum > this.maxPrintNum || isNaN(obj.printNum)) {
                alert(this.printNumTip);
                this.printNum = -1;
            } else {
                this.printNum = obj.printNum;
            }
        }
        callback(obj.noView, obj.modal);
    }

    /**
     * 动态二维码部分，获取当前浏览器的IE版本，非IE浏览器默认为10，小于等于8使用图片方式
     */
    WewinPrintService.prototype.getIeVersion = function () {
        var ua = navigator.userAgent.toLowerCase();
        var isIE = ua.indexOf("msie") > -1;
        var safariVersion = 10;
        if (isIE) {
            safariVersion = ua.match(/msie ([\d.]+)/)[1];
        }
        return safariVersion;
    }

    /**
     * 获取动态二维码生成方式
     */
    WewinPrintService.prototype.qrcodeRender = function () {
        var render = "", qrcodeTemp = true;
        if (this.isIE()) {
            if (this.qrcode == "table") {
                render = "table";
                qrcodeTemp = true;
            } else {
                if (this.getIeVersion() <= this.DEFAULT_VERSION) {
                    render = "table";
                    qrcodeTemp = false;
                } else {
                    render = "canvas";
                    qrcodeTemp = true;
                }
            }
        } else {
            render = "canvas";
        }

        return {
            render: render,
            qrcodeTemp: qrcodeTemp
        }
    }

    /**
     * 动态生成二维码
     * @param {String} className 类名
     * @param {Object} qrcodeRender 动态二维码生成方式
     * @param {Array} printTexts 二维码内容数组
     * @param {Number} width 二维码宽度
     * @param {Number} height 二维码高度
     */
    WewinPrintService.prototype.generateQrcode = function (obj) {
        if (obj.qrcodeRender.qrcodeTemp) {
            if (obj.printTexts.length != 0 && obj.printTexts[0].trim() != "") {
                jQuery(obj.className).qrcode({
                    render: obj.qrcodeRender.render,
                    width: obj.width,
                    height: obj.height,
                    text: wps.utf16to8(obj.printTexts[0])
                });
            }
        } else {
            $(obj.className).text("");
            $(obj.className).append("<img width='" + obj.width + "' height='" + obj.height + "' src='./labelimage/qrcode.png'/>");
        }
    }

    /**
     * 判断字符串是否不符合规范
     */
    WewinPrintService.prototype.isWrong = function (arr) {
        if (typeof arr == "object") {
            for (var i = 0, j = arr.length; i < j; i++) {
                var str = arr[i];
                if (str == undefined || str == null || str == "") {
                    arr[i] = "";
                }
            }
            return arr;
        } else {
            if (arr == undefined || arr == null || arr == "") {
                return "";
            }
            return arr;
        }
    }

    /**
     * 判断打印数据是否符合规范
     * @param {Number} type 是否弹窗(0:不弹窗 1:弹窗)
     */
    WewinPrintService.prototype.SetRightData = function (obj, type) {
        if (this.xmlWrong == 0) {
            var data = obj.data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].elem.length < data[i].num) {
                    if (type == 0) {
                        console.log("xml或json节点数有误");
                    } else if (type == 1) {
                        var html = "xml或json节点数有误\n\n正确节点数：\n";
                        html += "----------------\n";
                        for (var j = 0; j < obj.name.length; j++) {
                            html += obj.name[j] + ": " + data[j].num + "个\n";
                        }
                        html += "----------------";
                        alert(html);
                        console.log(html);
                    }
                    this.xmlWrong = 1;
                    break;
                }
            }
        }
    }

    /**
     * 打开IE浏览器模态框预览
     */
    WewinPrintService.prototype.OpenModalDialog = function (dialogData) {
        var openUrl = dialogData.path;
        var targetWindowStyle = "dialogHeight: " + dialogData.height + "px; dialogWidth: " + dialogData.width + "px; center: Yes; help: No; resizable: yes; status: yes; scroll:yes;";
        var sendData = [];
        sendData.push(dialogData.data);
        if (dialogData.obj == undefined || dialogData.obj == null) {
            dialogData.obj = {};
        }
        sendData.push(dialogData.obj);
        showModalDialog(openUrl, sendData, targetWindowStyle);
    }

    //-------------------------------打印方法------------------------------

    /**
     * 打印预览
     * @param {String} str - 需要打印的字符串
     * @param {Number} fontHeight - 字体高度
     * @param {Number} printWidth - 换行宽度
     * @param {Number} type - 分隔符选择
     * @return {Array}
     */
    WewinPrintService.prototype.PrintTextView = function (obj, type) {
        var str = obj.str;
        str = this.isWrong(str);
        var fontHeight = obj.fontHeight;
        var printWidth = obj.printWidth;
        var backstr = [];
        var strLen = 0;
        var temp = 0;
        var strs = str.split("");
        var tLen = 0;
        var letter = [];
        for (var i = 0; i < strs.length; i++) {
            // if (this.isChinese(strs[i])) {
            //     tLen = fontHeight / 2;
            //     letter.push(strs[i]);
            // } else {
            //     tLen = this.getLen(strs[i], fontHeight);
            // }
            tLen = this.getLen(strs[i], fontHeight);
            strLen += tLen;
            if ((strLen - printWidth) > 0) {
                // if (letter.length != 0 && letter.length % 2 == 0) {
                //     i -= 1;
                // }
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
        if (type == 1) {
            return backstr.join("\n");
        } else if (type == 0) {
            return backstr.join("<br/>");
        }
    }

    /**
     * 打印预览自适应
     * @param {Array} str - 需要打印的字符串数组
     * @param {Number} fontHeight - 字体高度
     * @param {Number} printWidth - 换行宽度
     * @param {Number} y - y坐标
     * @param {Number} rotate - 旋转
     * @param {Number} xoffset - Text内部行间距
     * @param {Number} loffset - Text外部行间距
     * @param {Number} maxH - 换行间距
     * @return {Number} - 返回字体高度
     */
    WewinPrintService.prototype.AutoPrintTextView = function (obj) {
        var str = obj.str;
        str = this.isWrong(str);
        var fontHeight = obj.fontHeight;
        var printWidth = obj.printWidth;
        var y = obj.y;
        var xoffset = obj.xoffset;
        var loffset = obj.loffset;
        var backstr = [];
        var flag = true;

        var maxY = y + obj.maxH * 8;
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
        return fontHeight;
    }

    /**
     * 文本打印函数
     * @param {Array} str - 需要打印的字符串数组
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
    WewinPrintService.prototype.PrintText = function (obj) {
        var str = obj.str;
        str = this.isWrong(str);
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

        var backstr = [];
        var flag = true;

        var startPos = obj.startPos;
        var centerThick = obj.centerThick;
        var height = obj.height;

        var resultArr = [];

        //获取打印机分辨率(8 | 12)
        var dots = this.GetDots();
        x = x / 8 * dots;
        y = y / 8 * dots;
        fontHeight = fontHeight / 8 * dots;
        fontWidth = fontHeight / 2;
        printWidth = printWidth / 8 * dots;
        xoffset = xoffset / 8 * dots;
        loffset = loffset / 8 * dots;

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
                    var obj = {};
                    obj.type = 0;
                    obj.x = tempX;
                    obj.y = y;
                    obj.fontWidth = fontWidth;
                    obj.fontHeight = fontHeight;
                    obj.fontWeight = fontWeight;
                    obj.fontName = this.fontname;
                    obj.content = backstr[j];
                    obj.oritention = rotate;
                    resultArr.push(obj);
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
                    var obj = {};
                    obj.type = 0;
                    obj.x = x;
                    obj.y = tempY;
                    obj.fontWidth = fontWidth;
                    obj.fontHeight = fontHeight;
                    obj.fontWeight = fontWeight;
                    obj.fontName = this.fontname;
                    obj.content = backstr[j];
                    obj.oritention = rotate;
                    resultArr.push(obj);
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
                    var obj = {};
                    obj.type = 0;
                    obj.x = tempX;
                    obj.y = y;
                    obj.fontWidth = fontWidth;
                    obj.fontHeight = fontHeight;
                    obj.fontWeight = fontWeight;
                    obj.fontName = this.fontname;
                    obj.content = backstr[j];
                    obj.oritention = rotate;
                    resultArr.push(obj);
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
                    var obj = {};
                    obj.type = 0;
                    obj.x = x;
                    obj.y = tempY;
                    obj.fontWidth = fontWidth;
                    obj.fontHeight = fontHeight;
                    obj.fontWeight = fontWeight;
                    obj.fontName = this.fontname;
                    obj.content = backstr[j];
                    obj.oritention = rotate;
                    resultArr.push(obj);
                    x -= fontHeight + xoffset;
                }
                x -= loffset;
            }
        }

        return resultArr;
    }

    /**
     * 二维码打印函数
     * @param {String} str - 需要生成二维码的字符串
     * @param {Number} x - x坐标
     * @param {Number} y - y坐标
     * @param {Number} width - 二维码宽度
     * @param {Number} rotate - 旋转
     * @returns {Array} 返回当前打印二维码的json数组
     */
    WewinPrintService.prototype.PrintQrcode = function (obj) {
        var x = obj.x;
        var y = obj.y;
        var width = obj.width;
        var str = obj.str;
        str = this.isWrong(str);
        var rotate = obj.rotate;

        //获取打印机分辨率(8 | 12)
        var dots = this.GetDots();
        x = x / 8 * dots;
        y = y / 8 * dots;
        width = width / 8 * dots;

        var CodesArr = [{
            "type": "2",
            "x": x,
            "y": y,
            "width": width,
            "content": str,
            "oritention": rotate
        }];

        return CodesArr;
    }

    /**
     * 条形码打印函数
     * @param {String} str - 需要生成条形码的字符串
     * @param {Number} x - x坐标
     * @param {Number} y - y坐标
     * @param {Number} rotate - 旋转
     * @param {Number} height - 条码高度
     * @param {Number} pwidth - 条码单元宽度
     * @returns {Array} 返回当前打印条形码的json数组
     */
    WewinPrintService.prototype.PrintBarcode = function (obj) {
        var codeType = obj.codeType;
        var x = obj.x;
        var y = obj.y;
        var pwidth = obj.pwidth;
        var height = obj.height;
        var str = obj.str;
        str = this.isWrong(str);
        var rotate = obj.rotate;

        //获取打印机分辨率(8 | 12)
        var dots = this.GetDots();
        x = x / 8 * dots;
        y = y / 8 * dots;
        height = height / 8 * dots;

        var BarcodesArr = [{
            "type": "1",
            "codeType": codeType,
            "x": x,
            "y": y,
            "pwidth": pwidth,
            "height": height,
            "content": str,
            "oritention": rotate
        }];

        return BarcodesArr;
    }

    /**
     * 线条打印函数
     * @param {Number} x - x坐标
     * @param {Number} y - y坐标
     * @param {Number} ex - 旋转
     * @param {Number} ey - 条码高度
     * @param {Number} thickness - 线条厚度
     * @returns {Array} 返回当前打印线条的json数组
     */
    WewinPrintService.prototype.PrintLine = function (obj) {
        var x = obj.x;
        var y = obj.y;
        var thickness = obj.thickness;
        var ex = obj.ex;
        var ey = obj.ey;

        //获取打印机分辨率(8 | 12)
        var dots = this.GetDots();
        x = x / 8 * dots;
        y = y / 8 * dots;
        ex = ex / 8 * dots;
        ey = ey / 8 * dots;

        var LinesArr = [{
            "type": "4",
            "x": x,
            "y": y,
            "thickness": thickness,
            "ex": ex,
            "ey": ey
        }];

        return LinesArr;
    }

    /**
     * 图片打印函数
     * @param {Number} x - x坐标
     * @param {Number} y - y坐标
     * @param {Number} width - 图片宽度
     * @param {Number} height - 图片高度
     * @param {Number} path - 图片路径
     * @param {Number} rotate - 图片旋转
     * @returns {Array} 返回当前打印图片的json数组
     */
    WewinPrintService.prototype.PrintLogo = function (obj) {
        var x = obj.x;
        var y = obj.y;
        var width = obj.width;
        var height = obj.height;
        var path = obj.path;
        path = this.isWrong(path);
        var rotate = obj.rotate;

        //获取打印机分辨率(8 | 12)
        var dots = this.GetDots();
        x = x / 8 * dots;
        y = y / 8 * dots;
        width = width / 8 * dots;
        height = height / 8 * dots;

        var ImagesArr = [{
            "type": "3",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "path": path,
            "oritention": rotate
        }];

        return ImagesArr;
    }

    /**
     * 获取打印机分辨率
     * @returns {String} 打印机分辨率
     */
    WewinPrintService.prototype.GetDots = function () {
        var printername = this.printername;
        var parr = this.printername.split("&&");
        var dots = parr[1];
        return dots;
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
    WewinPrintService.prototype.returnPtype = function (str, ptype, xy, fontHeight, printWidth, operator) {
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
    WewinPrintService.prototype.autoSplit = function (fontHeight, str, printWidth) {
        str = this.isWrong(str);
        var strLen = 0;
        var temp = 0;
        var backstr = [];
        var strs = str.split("");
        var tLen = 0;
        var letter = [];
        for (var i = 0; i < strs.length; i++) {
            // if (this.isChinese(strs[i])) {
            //     tLen = fontHeight / 2;
            //     letter.push(strs[i]);
            // } else {
            //     tLen = this.getLen(strs[i], fontHeight);
            // }
            tLen = this.getLen(strs[i], fontHeight);
            strLen += tLen;
            if ((strLen - printWidth) > 0) {
                // if (letter.length != 0 && letter.length % 2 == 0) {
                //     i -= 1;
                // }
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
    WewinPrintService.prototype.isChinese = function (temp) {
        var re = /^[\u4E00-\u9FA5]/;
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是英文字母或数字
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintService.prototype.isWordOrNum = function (temp) {
        var re = /^[A-Za-z0-9]/;
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是英文符号
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintService.prototype.isSmall = function (temp) {
        var re = new RegExp("[`~!@#$^&*()=|{}':;,\\[\\].<>/?]");
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 是否是中文符号
     * @param {String} 单字符
     * @returns {Boolean} true:是 false:否
     */
    WewinPrintService.prototype.isBig = function (temp) {
        var re = new RegExp("[《》！（）【】；：。，、？￥……‘’”“——]");
        if (re.test(temp)) return true;
        return false;
    }

    /**
     * 解析xml数据
     * @param {Object} ele xml数据
     * @returns {Array} 解析xml生成的数组
     */
    WewinPrintService.prototype.parseXmlElement = function (ele) {
        var eles = [];
        for (var j = 0; j < ele.length; j++) {
            if (ele[j] != undefined && ele[j].childNodes[0] != undefined || ele[j].firstChild != null) {
                eles[j] = ele[j].firstChild.nodeValue;
            } else {
                eles[j] = "";
            }
        }
        return eles;
    }

    /**
     * 解析json数据
     * @param {Object} ele json数据
     * @returns {Array} 解析json生成的数组
     */
    WewinPrintService.prototype.parseJsonElement = function (ele) {
        if (typeof (ele) == "string") {
            var arr = [];
            arr.push(ele);
            return arr;
        } else if (typeof (ele) == "object") {
            return ele;
        }
    }

    return new WewinPrintService();
}

/**
 * 兼容IE8以下console报错问题
 */
window._console = window.console;//将原始console对象缓存
window.console = (function (orgConsole) {
    return {//构造的新console对象
        log: getConsoleFn("log"),
        debug: getConsoleFn("debug"),
        info: getConsoleFn("info"),
        warn: getConsoleFn("warn"),
        exception: getConsoleFn("exception"),
        assert: getConsoleFn("assert"),
        dir: getConsoleFn("dir"),
        dirxml: getConsoleFn("dirxml"),
        trace: getConsoleFn("trace"),
        group: getConsoleFn("group"),
        groupCollapsed: getConsoleFn("groupCollapsed"),
        groupEnd: getConsoleFn("groupEnd"),
        profile: getConsoleFn("profile"),
        profileEnd: getConsoleFn("profileEnd"),
        count: getConsoleFn("count"),
        clear: getConsoleFn("clear"),
        time: getConsoleFn("time"),
        timeEnd: getConsoleFn("timeEnd"),
        timeStamp: getConsoleFn("timeStamp"),
        table: getConsoleFn("table"),
        error: getConsoleFn("error"),
        memory: getConsoleFn("memory"),
        markTimeline: getConsoleFn("markTimeline"),
        timeline: getConsoleFn("timeline"),
        timelineEnd: getConsoleFn("timelineEnd")
    };
    function getConsoleFn(name) {
        return function actionConsole() {
            if (typeof (orgConsole) !== "object") return;
            if (typeof (orgConsole[name]) !== "function") return;//判断原始console对象中是否含有此方法，若没有则直接返回
            return orgConsole[name].apply(orgConsole, Array.prototype.slice.call(arguments));//调用原始函数
        };
    }
}(window._console));

/**
 * 兼容IE8以下没有getElementsByClassName函数
 */
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (className, element) {
        var children = (element || document).getElementsByTagName('*');
        var elements = new Array();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    elements.push(child);
                    break;
                }
            }
        }
        return elements;
    };
}

/**
 * 兼容IE8以下没有trim函数
 */
String.prototype.trim = function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}