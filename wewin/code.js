//初始化WewinPrintService API
var wps = WewinPrintService();

//test.html页面传递json
function LabelPrint(data, obj, modalDialog) {
    wps.StartPrint(obj, function (noView, modal) {
        if (modal) {
            if (wps.isIE()) {
                var openUrl = "./PS_LabelPrint.html";
                var targetWindowStyle = "dialogHeight: 660px; dialogWidth: 1000px; center: Yes; help: No; resizable: yes; status: yes; scroll:yes;";
                showModalDialog(openUrl, data, targetWindowStyle);
            } else {
                //有预览打印
                wps.LabelPrint(data);
                Load();
            }
        } else {
            if (noView != undefined) {
                //无预览打印
                NoViewLabelPrint(data, noView.trim());
            } else {
                //有预览打印
                wps.LabelPrint(data);
                Load();
            }
        }
    }, modalDialog);
}

//加载预览页面
function Load() {
    wps.Load();
    setTimeout(function () {
        wps.ViewPrint(ViewPrint);
    }, 0);
}

//标签尺寸下拉框变化时，刷新预览界面
function changetype() {
    ViewPrint(wps.data, 1);
}

//在预览中点击打印按钮时打印标签
function Print() {
    wps.GetPrinter();
    wps.DoLabelPrint(DoLabelPrint);
}

//直接点击打印按钮时打印标签
function NoViewLabelPrint(data, printer) {
    wps.SetPrinter(data, printer, function () {
        wps.DoLabelPrint(DoLabelPrint);
    });
}

//查看报文
function lookXml() {
    wps.lookXml();
}

//查看帮助
function lookHelp() {
    wps.lookHelp();
}

//解析XML
function loadXML(xmlString) {
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

//----------------------------------------------------
//修改-标签预览
function ViewPrint(data, temp) {

    var text = "", xmldoc, PrintElements, noTag = true;
    var dataStr = data;
    var preview = document.getElementById("preview");

    if (typeof (dataStr) == "string") {
        xmldoc = loadXML(data);
        PrintElements = xmldoc.getElementsByTagName("Print");
        data = PrintElements;
    }

    for (var i = 0; i < data.length; i++) {

        wps.SetViewInfo({
            //预览页面标题
            title: "重庆品胜 - 资管打印 - 打印预览",
            //修改版本号
            version: "TY_123"
        })

        if (typeof (dataStr) == "string") {
            //标签类型
            var LabelTypeElement = data[i].getElementsByTagName("EntityTypeId");
            var labelType = wps.parseXmlElement(LabelTypeElement);
            //Text节点
            var TextElement = data[i].getElementsByTagName("Text");
            var Texts = wps.parseXmlElement(TextElement);
            //Code节点
            var CodeElement = data[i].getElementsByTagName("Code");
            var Codes = wps.parseXmlElement(CodeElement);
        } else if (typeof (dataStr) == "object") {
            //标签类型
            var labelType = wps.parseJsonElement(data[i].EntityTypeId);
            //Text节点
            var Texts = wps.parseJsonElement(data[i].Text);
            //Code节点
            var Codes = wps.parseJsonElement(data[i].Code);
        }

        // 标签1(123)
        if (labelType[0] == "123") {
            noTag = false;

            //检验打印数据是否符合规范
            wps.SetRightData({
                name: ["labelType", "Texts", "Codes"],
                data: [
                    { elem: labelType, num: 1 },
                    { elem: Texts, num: 1 },
                    { elem: Codes, num: 2 }
                ]
            }, 0);

            //标签型号
            var labelname = document.getElementById("labelname");
            if (temp != 1) {
                labelname.innerHTML = "";
                labelname.options.add(new Option("25-25", "0"));
            }
            var selValue = labelname.value;

            if (selValue == 0) {
                //支持的打印机型号
                wps.SetPrintInfo("P50 268");

                if (i == 0 && data.length > 1) {
                    text += "<div style=\"width:60px;height:17px;overflow:hidden;margin: 0 auto;margin-bottom:10px\"><div style=\"height:17px;float:left;line-height:17px;font-size:15px;\">全选</div><input onclick=\"wps.chooseAllCheckbox()\" id=\"allcb\" type=\"checkbox\" style=\"width:17px;height:17px;margin:0;padding:0;float:right\"><\/div>";
                }

                if (i == 0) {
                    text += "<div style=\"position: relative;font-family:'" + wps.fontname + "';background-image:url(\'labelimage\/(25-25)(0).png\');background-repeat:no-repeat;width: 200px;height: 200px;display:block;margin:0 auto;padding:0;\">";
                } else {
                    text += "<div style=\"position: relative;font-family:'" + wps.fontname + "';background-image:url(\'labelimage\/(25-25)(0).png\');background-repeat:no-repeat;width: 200px;height: 200px;display:block;margin:0 auto;padding:0;margin-top: 15px\">";
                }

                if (data.length > 1) {
                    if (i == 0) {
                        text += "<input onclick=\"wps.chooseOneCheckbox()\" id=\"cb" + i + "\" type=\"checkbox\" checked=\"checked\" style=\"position: absolute;top:10px;left:-30px;width:17px;height:17px;\">";
                    } else {
                        text += "<input onclick=\"wps.chooseOneCheckbox()\" id=\"cb" + i + "\" type=\"checkbox\" style=\"position: absolute;top:10px;left:-30px;width:17px;height:17px;\">";
                    }
                }

                //-----------------------文本预览----------------------------
                var fontHeight = 16;//字体大小
                var printWidth = 160;//换行宽度
                var x = 21;//x坐标
                var y = 7;//y坐标
                var maxH = 25;//最大高度
                var xoffset = 4;//Text内部行间距
                var loffset = 2;//Text外部行间距
                var height = 39.05279999999999;//不用修改
                var width = 160;//不用修改

                //计算预览自适应
                var fh = wps.AutoPrintTextView({
                    str: [Texts[0]],
                    fontHeight: fontHeight,
                    printWidth: printWidth,
                    y: y,
                    xoffset: xoffset,
                    loffset: loffset,
                    maxH: maxH
                });
                var lh = parseInt(fh) + 4;

                text += "	<div style=\"";
                text += "		position: absolute;";
                text += "		top: " + y + "px;";
                text += "		left: " + x + "px;";
                // text += "		width: " + width + "px;";
                text += "		text-align: left;";
                text += "		line-height: " + lh + "px;";
                text += "		font-size: " + fh + "px;";
                text += "	\">"

                text += "       <div>";
                text += wps.PrintTextView({ str: Texts[0], fontHeight: fh, printWidth: printWidth }, 0);
                text += "       <\/div>";

                text += "   <\/div>";
                //---------------------------------------------------------

                //-----------------------动态二维码预览----------------------
                text += "	<div class=\"qrcode" + i + "5\" style=\"";
                text += "		position: absolute;";
                text += "		top:  " + 76 + "px;";
                text += "		left:  " + 113 + "px;";
                text += "		font-size:0px;";
                text += "	\">"
                text += "   <\/div>";

                //---------------------------------------------------------
                text += "<\/div>";
            }
        }


        preview.innerHTML = text;
    }

    if (noTag) {
        var labelname = document.getElementById("labelname");
        if (temp != 1) {
            labelname.innerHTML = "";
            labelname.options.add(new Option("无该类型的标签模板", "-1"));
        }
    }

    //动态二维码
    var qrcodeRender = wps.qrcodeRender();

    var labelname = document.getElementById("labelname");
    var selValue = labelname.value;

    for (var i = 0; i < data.length; i++) {

        if (typeof (dataStr) == "string") {
            //标签类型
            var LabelTypeElement = data[i].getElementsByTagName("EntityTypeId");
            var labelType = wps.parseXmlElement(LabelTypeElement);
            //Text节点
            var TextElement = data[i].getElementsByTagName("Text");
            var Texts = wps.parseXmlElement(TextElement);
            //Code节点
            var CodeElement = data[i].getElementsByTagName("Code");
            var Codes = wps.parseXmlElement(CodeElement);
        } else if (typeof (dataStr) == "object") {
            //标签类型
            var labelType = wps.parseJsonElement(data[i].EntityTypeId);
            //Text节点
            var Texts = wps.parseJsonElement(data[i].Text);
            //Code节点
            var Codes = wps.parseJsonElement(data[i].Code);
        }

        // 标签1(123)
        if (labelType[0] == "123") {
            if (selValue == 0) {
                var printTexts = Codes.slice(0, 1);
                wps.generateQrcode({
                    className: ".qrcode" + i + "5",
                    qrcodeRender: qrcodeRender,
                    printTexts: printTexts,
                    width: 75,
                    height: 75
                });
            }
            
        }
    }

}

//修改-标签打印
function DoLabelPrint(data) {
    var lablesArr = [];

    var xmldoc, PrintElements;
    var dataStr = data;

    if (typeof (dataStr) == "string") {
        xmldoc = loadXML(data);
        PrintElements = xmldoc.getElementsByTagName("Print");
        data = PrintElements;
    }

    for (var i = 0; i < data.length; i++) {

        if (typeof (dataStr) == "string") {
            //标签类型
            var LabelTypeElement = data[i].getElementsByTagName("EntityTypeId");
            var labelType = wps.parseXmlElement(LabelTypeElement);
            //Text节点
            var TextElement = data[i].getElementsByTagName("Text");
            var Texts = wps.parseXmlElement(TextElement);
            //Code节点
            var CodeElement = data[i].getElementsByTagName("Code");
            var Codes = wps.parseXmlElement(CodeElement);
        } else if (typeof (dataStr) == "object") {
            //标签类型
            var labelType = wps.parseJsonElement(data[i].EntityTypeId);
            //Text节点
            var Texts = wps.parseJsonElement(data[i].Text);
            //Code节点
            var Codes = wps.parseJsonElement(data[i].Code);
        }

        // 标签1(123)
        if (labelType[0] == '123') {
            if (data.length == 1) {
                lablesArr = print_tag123(lablesArr, Texts, Codes);
            } else {
                if (wps.noview == "1") {
                    lablesArr = print_tag123(lablesArr, Texts, Codes);
                } else {
                    if (document.getElementById("cb" + i).checked) {
                        lablesArr = print_tag123(lablesArr, Texts, Codes);
                    }
                }
            }
        }
    }

    var data = {
        "handleType": "1",
        "printer": "",
        "hasDrive": "",
        "copyNum": "1",
        "labels": lablesArr
    }

    wps.Print(data);

}


// 标签1(123)
function print_tag123(lablesArr, Texts, Codes) {
    var labelWidth = 0;//标签宽
    var labelHeight = 0;//标签高
    var printTexts = [];
    var resultArr = [];
    var rfid = "";

    //获取标签下拉列表
    if (wps.noview == "1") {
        var selValue = 0;
    } else {
        var labelname = document.getElementById("labelname");
        var selValue = labelname.value;
    }

    //获取打印机分辨率(8 | 12)
    var printername = wps.printername;
    var parr = wps.printername.split("&&");
    var dots = parr[1];

    if (selValue == 0) {

        labelWidth = 25 * dots;
        labelHeight = 25 * dots;

        //---------------------------------------------------------
        //文字打印
        var x = 187.66666666666666;
        var y = 25;
        var fontHeight = 16;
        var fontWeight = 400;
        var printWidth = 160;
        var rotate = 3;
        var xoffset = 2;
        var loffset = 1;
        var maxH = 25;
        var ptype = 0;

        printTexts = Texts.slice(0, 1);

        var TextsArr = wps.PrintText({
            str: printTexts,
            fontHeight: fontHeight,
            fontWeight: fontWeight,
            printWidth: printWidth,
            x: x,
            y: y,
            rotate: rotate,
            xoffset: xoffset,
            loffset: loffset,
            maxH: maxH,
            ptype: ptype
        });
        resultArr = wps.addArr(resultArr, TextsArr);
        //---------------------------------------------------------

        //---------------------------------------
        var x = 126;
        var y = 30;
        var ex = 126;
        var ey = 180;
        var thickness = 5;

        //线条打印
        var LinesArr = wps.PrintLine({
            x: x,
            y: y,
            ex: ex,
            ey: ey,
            thickness: thickness
        });
        resultArr = wps.addArr(resultArr, LinesArr);
        //---------------------------------------

        //---------------------------------------
        var path = window.location.href.split('?')[0];
        path = path.substring(0, path.lastIndexOf('/')) + '/labelimage/CM1.bmp';//图片路径(绝对路径)
        var x = 50.053639846743295;
        var y = 19.000000000000057;
        var rotate = 1;
        var width = 76.9463601532567;
        var height = 74.0536398467433;

        //图片打印
        var ImagesArr = wps.PrintLogo({
            path: path,
            x: x,
            y: y,
            width: width,
            height: height,
            rotate: rotate
        });
        resultArr = wps.addArr(resultArr, ImagesArr);
        //---------------------------------------

        //---------------------------------------
        var x = 49;
        var y = 113;
        var rotate = 1;
        var width = 75;

        printTexts = Codes.slice(0, 1);

        //二维码打印
        var CodesArr = wps.PrintQrcode({
            str: printTexts[0],
            x: x,
            y: y,
            width: width,
            rotate: rotate
        });
        resultArr = wps.addArr(resultArr, CodesArr);
        //---------------------------------------

        //---------------------------------------
        var codeType = 4;
        var x = 9;
        var y = 22;
        var rotate = 1;
        var height = 30;
        var pwidth = 2;

        printTexts = Codes.slice(1, 2);

        //条形码打印
        var BarcodesArr = wps.PrintBarcode({
            codeType: codeType,
            str: printTexts[0],
            x: x,
            y: y,
            rotate: rotate,
            height: height,
            pwidth: pwidth
        });
        resultArr = wps.addArr(resultArr, BarcodesArr);
        //---------------------------------------

    }

    var obj = {
        "labelWidth": labelWidth,
        "labelHeight": labelHeight,
        "rfid": rfid,
        "ddfLength": "0",
        "cutOption": "0",
        "blocks": resultArr
    }
    lablesArr.push(obj);

    return lablesArr;
}
