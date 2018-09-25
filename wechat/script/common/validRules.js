function checkIdcard(num) {
    num = num.toUpperCase();
    //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
    if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) {
        //alert('输入的身份证号长度不对，或者号码不符合规定！\n15位号码应全为数字，18位号码末位可以为数字或X。');
        return false;
    }
    return true; // 下面校验可能有问题 先粗略校验

    //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
    //下面分别分析出生日期和校验位
    var len, re;
    len = num.length;
    if (len == 15) {
        re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
        var arrSplit = num.match(re);

        //检查生日日期是否正确
        var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
        var bGoodDay;
        bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
        if (!bGoodDay) {
            //alert('输入的身份证号里出生日期不对！');
            return false;
        } else {
            //将15位身份证转成18位
            //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var nTemp = 0,
                i;
            num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
            for (i = 0; i < 17; i++) {
                nTemp += num.substr(i, 1) * arrInt[i];
            }
            num += arrCh[nTemp % 11];
            return true;
        }
    }
    if (len == 18) {
        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
        var arrSplit = num.match(re);

        //检查生日日期是否正确
        var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
        var bGoodDay;
        bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
        if (!bGoodDay) {
            //alert(dtmBirth.getYear());
            //alert(arrSplit[2]);
            //alert('输入的身份证号里出生日期不对！');
            return false;
        } else {
            //检验18位身份证的校验码是否正确。
            //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
            var valnum;
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var nTemp = 0,
                i;
            for (i = 0; i < 17; i++) {
                nTemp += num.substr(i, 1) * arrInt[i];
            }
            valnum = arrCh[nTemp % 11];
            if (valnum != num.substr(17, 1)) {
                //alert('18位身份证的校验码不正确！应该为：' + valnum);
                return false;
            }
            return true;
        }
    }
    return false;
}

function checkUserName(str) {
    return /^[\u4E00-\u9FA5]{1,20}$/.test(str);
}

function checkAddr(str) {
    return /^.{1,25}$/.test(str);
}

function checkMobile(str) {
    return /^1\d{10}$/.test(str)
}

function checkMsgCode(str) {
    return /^\d{6}$/.test(str);
}

function getMsgCode(tel, str) {
    var ret = false;
    var msg = '';
    if (!checkMobile(tel)) {
        return {
            ret: false,
            message: '请输入正确的手机号码'
        };
    }

    if (!checkMsgCode(str)) {
        return {
            ret: false,
            message: '请输入正确的验证码'
        };
    }

    $.ajax({
        url: "/security/checksmscode.htm",
        type: "POST",
        async: false,
        data: {
            phoneNo: tel,
            verifyCode: str
        },
        success: function (json) {
            if (json.code) {
                ret = false;
                msg = json.message;
            } else {
                ret = true;
            }
        }

        /*,
        error: function () {
            ret = false;
            msg = '请求失败';
            alert(msg)
        }
        */
    })
    return {
        ret: ret,
        message: msg
    };
}

function checkPassword(str) {
    var ret = false;
    if (passwordFormat(str)) {
        $.ajax({
            url: '/security/verifypassword.htm',
            type: 'POST',
            async: false,
            data: {
                password: window.MD5(str)
            },
            success: function (json) {
                    if (json.code) {
                        ret = false;
                    } else {
                        ret = true;
                    }
                }
                /*,
                            error: function () {
                                ret = false;
                            }*/
        })
    }
    return ret;
}

function checkPasswordObj(str) {
    var ret = false,
        msg = '';
    if (passwordFormat(str)) {
        $.ajax({
            url: '/security/verifypassword.htm',
            type: 'POST',
            async: false,
            data: {
                password: window.MD5(str)
            },
            success: function (json) {
                    if (json.code) {
                        ret = false;
                        msg = json.message;
                    } else {
                        ret = true;
                    }
                }
                /*,
                            error: function () {
                                ret = false;
                                msg = '请求失败';
                                }*/
        })
    }
    return {
        ret: ret,
        message: msg
    };
}

function checkMiCard(str) {
    return /^\d{10,25}$/.test(str)
}

function passwordFormat(str) {
    // return /^[a-z0-9A-Z]{6,15}$/.test(str);
    return /^(?=.*[a-zA-Z]+)(?=.*[0-9]+)[0-9a-zA-Z]{6,15}$/.test(str);
}

if (typeof window.taoguKit != 'object') {
    window.taoguKit = {};
}

window.taoguKit.valid = {
    idCard: checkIdcard,
    userName: checkUserName,
    addr: checkAddr,
    mobile: checkMobile,
    miCard: checkMiCard,
    msgCode: checkMsgCode,
    password: checkPassword,
    passwordObj: checkPasswordObj,
    getMsgCode: getMsgCode,
    passwordFormat: passwordFormat
};
