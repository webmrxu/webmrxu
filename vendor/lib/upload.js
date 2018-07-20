var utils = require('./utils');
var Session = require('./session');
var loginLib = require('./login');

var noop = function noop() {};
var defaultOptions = {
    success: noop,
    fail: noop,
    uploadUrl: null,
};

/***
 * @class
 * 表示请求过程中发生的异常
 */
var UploadError = (function () {
    function UploadError(message) {
        Error.call(this, message);
        this.message = message;
    }

    UploadError.prototype = new Error();
    UploadError.prototype.constructor = UploadError;

    return UploadError;
})();

function uploadFile(options) {
    if (typeof options !== 'object') {
        var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
        throw new UploadError(message);
    }

    var success = options.success || noop;
    var fail = options.fail || noop;
    var complete = options.complete || noop;
    var saved = options.saved || noop;


    // 成功回调
    var callSuccess = function (res) {
      success.call(this, res);
      saved.call(this, res);
    };

    // 失败回调
    var callFail = function (error) {
        fail.call(null, error);
        complete.call(null, error);
    };

    doUpload();

    // 实际进行请求的方法
    function doUpload() {
      console.log("准备上传");
        wx.uploadFile(utils.extend({}, options, {

            success: function (result) {
              var str = utils.formatJsonStr(result.data);
              console.log(str);

              var data = JSON.parse(str);
              console.log(data);

                if (data) {
                    if (!data.success){
                        message = data.msg || '未知错误';
                        error = new UploadError(message);
                    }else{
                      callSuccess.call(this, data);
                        return;
                    }
                }else{
                    var errorMessage = '请求没有包含会话响应，请确保服务器处理 `' + options.url + '` 的时候输出登录结果';
                    var error = new UploadError(errorMessage);
                    options.fail(error);
                }
                callFail(error);
            },

            fail: callFail,
            complete: noop,
        }));
    };

};

module.exports = {
    UploadError: UploadError,
    uploadFile: uploadFile,
};